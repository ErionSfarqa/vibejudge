import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { analyzeWithOllama } from "@/lib/ai/ollama";
import { buildGuardrailResult } from "@/lib/fallback-results";
import { checkRateLimit } from "@/lib/rate-limit";
import { inspectJudgeInput } from "@/lib/safety";
import type { JudgeRequest, ScreenshotMeta } from "@/lib/types";
import { getClientIp } from "@/lib/utils";
import { judgeRequestSchema, validateUploads } from "@/lib/validations";

export const runtime = "nodejs";

function buildRateLimitHeaders(remaining: number, resetAt: number) {
  return {
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(resetAt)
  };
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
    return NextResponse.json(
      { error: "Too many review requests. Give it a minute and try again." },
      { status: 429, headers }
    );
  }

  try {
    const formData = await request.formData();
    const payload = judgeRequestSchema.parse({
      name: formData.get("name"),
      age: formData.get("age"),
      gender: formData.get("gender"),
      bio: formData.get("bio"),
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
      return NextResponse.json(
        {
          result: buildGuardrailResult(review.reason),
          meta: { guardrailed: true }
        },
        { headers }
      );
    }

    try {
      const result = await analyzeWithOllama(payload, screenshots, screenshotMeta);
      return NextResponse.json({ result }, { headers });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Ollama could not complete the request."
        },
        { status: 502, headers }
      );
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Please check your input and try again." },
        { status: 400, headers }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request body." },
      { status: 400, headers }
    );
  }
}
