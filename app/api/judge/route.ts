import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { analyzeWithOllama, OllamaServiceError } from "@/lib/ai/ollama";
import { buildGuardrailResult } from "@/lib/fallback-results";
import { checkRateLimit } from "@/lib/rate-limit";
import { inspectJudgeInput } from "@/lib/safety";
import type { JudgeApiError, JudgeApiResponse, JudgeRequest, ScreenshotMeta } from "@/lib/types";
import { getClientIp } from "@/lib/utils";
import { judgeRequestSchema, validateUploads } from "@/lib/validations";

export const runtime = "nodejs";

function getStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildRateLimitHeaders(remaining: number, resetAt: number) {
  return {
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(resetAt)
  };
}

function buildErrorResponse(
  error: JudgeApiError,
  status: number,
  headers: Record<string, string>
) {
  return NextResponse.json<JudgeApiResponse>({ error }, { status, headers });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `judge:${ip}`,
    windowMs: 60_000,
    maxRequests: 10
  });

  const headers = buildRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt);

  if (!rateLimit.success) {
    return buildErrorResponse(
      {
        code: "RATE_LIMITED",
        userMessage: "You have sent a few reviews quickly. Give it a minute, then try again.",
        retryable: true
      },
      429,
      headers
    );
  }

  try {
    const formData = await request.formData();
    const payload = judgeRequestSchema.parse({
      name: formData.get("name"),
      age: formData.get("age"),
      gender: formData.get("gender"),
      gymStatus: formData.get("gymStatus"),
      trainingFrequency: formData.get("trainingFrequency") ?? undefined,
      currentGoal: getStringList(formData, "currentGoal"),
      lifestyle: getStringList(formData, "lifestyle"),
      disciplineLevel: formData.get("disciplineLevel"),
      energyLevel: formData.get("energyLevel"),
      socialConfidence: formData.get("socialConfidence"),
      socialPresence: formData.get("socialPresence"),
      biggestWeakness: getStringList(formData, "biggestWeakness"),
      perceivedByOthers: formData.get("perceivedByOthers"),
      desiredPerception: getStringList(formData, "desiredPerception"),
      styleImage: formData.get("styleImage"),
      socialMediaActivity: formData.get("socialMediaActivity"),
      habits: getStringList(formData, "habits"),
      improvementFocus: getStringList(formData, "improvementFocus"),
      context: formData.get("context") ?? undefined
    }) as JudgeRequest;

    const screenshots = formData
      .getAll("screenshots")
      .filter((value): value is File => value instanceof File && value.size > 0);

    validateUploads(screenshots);

    const screenshotMeta: ScreenshotMeta[] = screenshots.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size
    }));

    const review = inspectJudgeInput(payload, screenshotMeta);

    if (review.blocked) {
      return NextResponse.json<JudgeApiResponse>(
        {
          result: buildGuardrailResult(review.reason),
          meta: { guardrailed: true }
        },
        { headers }
      );
    }

    try {
      const result = await analyzeWithOllama(payload, screenshots, screenshotMeta);
      return NextResponse.json<JudgeApiResponse>({ result }, { headers });
    } catch (error) {
      if (error instanceof OllamaServiceError) {
        return buildErrorResponse(error.toResponseError(), error.status, headers);
      }

      return buildErrorResponse(
        {
          code: "AI_UPSTREAM_ERROR",
          userMessage: "The AI review service ran into a temporary problem. Please try again.",
          adminMessage:
            error instanceof Error ? error.message : "Ollama could not complete the request.",
          retryable: true
        },
        502,
        headers
      );
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return buildErrorResponse(
        {
          code: "VALIDATION_ERROR",
          userMessage: error.issues[0]?.message ?? "Please check your answers and try again.",
          retryable: false
        },
        400,
        headers
      );
    }

    return buildErrorResponse(
      {
        code: "BAD_REQUEST",
        userMessage: "The review request could not be read. Please try again.",
        adminMessage: error instanceof Error ? error.message : "Invalid request body.",
        retryable: true
      },
      400,
      headers
    );
  }
}
