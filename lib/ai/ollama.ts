import { Ollama } from "ollama";

import type { JudgeRequest, JudgeResult, ScreenshotMeta } from "@/lib/types";
import { judgeResultSchema } from "@/lib/validations";

const DEFAULT_MODEL = "gpt-oss:120b-cloud";
const DIRECT_CLOUD_HOST = "https://ollama.com";

const judgeResultFormat = {
  type: "object",
  additionalProperties: false,
  required: [
    "auraScore",
    "confidenceScore",
    "profileClarityScore",
    "socialPresenceScore",
    "overallVibe",
    "firstImpression",
    "strengths",
    "weakPoints",
    "lowAuraFactors",
    "bioAnalysis",
    "profilePresentation",
    "improvements",
    "confidenceTips",
    "finalPlan"
  ],
  properties: {
    auraScore: { type: "integer", minimum: 1, maximum: 99 },
    confidenceScore: { type: "integer", minimum: 1, maximum: 99 },
    profileClarityScore: { type: "integer", minimum: 1, maximum: 99 },
    socialPresenceScore: { type: "integer", minimum: 1, maximum: 99 },
    overallVibe: { type: "string" },
    firstImpression: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    weakPoints: { type: "array", items: { type: "string" } },
    lowAuraFactors: { type: "array", items: { type: "string" } },
    bioAnalysis: { type: "string" },
    profilePresentation: { type: "string" },
    improvements: { type: "array", items: { type: "string" } },
    confidenceTips: { type: "array", items: { type: "string" } },
    finalPlan: { type: "array", items: { type: "string" } },
    note: { type: "string" }
  }
} as const;

const SYSTEM_PROMPT = `
You are an AI social profile analyst.

Your job is to analyze a person's social presence, bio, and overall vibe based on the information they provide.

You are NOT insulting or rude.
You are honest, constructive, and insightful.

You analyze how the person comes across online and how they can improve their presence, confidence, and aura.

Your tone should be:
- honest
- constructive
- insightful
- slightly bold
- but never hateful or insulting

You are helping the user improve how they present themselves online.

You will receive:
- Name
- Age
- Gender
- Bio
- Additional context
- Uploaded screenshots of social media profiles

Use this information to estimate how the person's social presence appears.

What you must analyze:
1. Overall Vibe: how the person likely comes across to others.
2. First Impression: what people probably think in the first few seconds.
3. Strengths: positive traits in their presentation.
4. Weak Points: things that may hurt their image or reduce their impact.
5. Low Aura Factors: things that make the profile feel less confident, unclear, or unattractive.
6. Bio Quality: evaluate the clarity, personality, and impact of their bio.
7. Profile Presentation: analyze the structure and clarity of their profile based on the screenshots and screenshot notes provided.
8. Improvements: clear actions they can take to improve their presence.
9. Confidence Tips: advice on appearing more confident and intentional online.
10. Final Aura Upgrade Plan: a simple plan for improving their overall vibe.
11. Result scoring:
- auraScore
- confidenceScore
- profileClarityScore
- socialPresenceScore

Important rules:
- Do not insult appearance.
- Do not be hateful, abusive, or discriminatory.
- Do not claim things as absolute facts.
- Do not make claims about sensitive traits, mental health, diagnosis, race, religion, sexuality, or hidden identity.
- Focus on presentation, communication style, polish, profile clarity, and online behavior.
- Make reasonable observations and useful suggestions.
- If screenshots are unclear, limited, or only represented by metadata, say so briefly in the optional note field instead of inventing details.

Always return structured JSON in this exact shape:
{
  "auraScore": 74,
  "confidenceScore": 68,
  "profileClarityScore": 59,
  "socialPresenceScore": 71,
  "overallVibe": "...",
  "firstImpression": "...",
  "strengths": ["...", "..."],
  "weakPoints": ["...", "..."],
  "lowAuraFactors": ["...", "..."],
  "bioAnalysis": "...",
  "profilePresentation": "...",
  "improvements": ["...", "..."],
  "confidenceTips": ["...", "..."],
  "finalPlan": ["...", "..."],
  "note": "optional"
}

Return JSON only. Do not return markdown. Do not return commentary outside the JSON.
`.trim();

type OllamaMode = "local-ollama" | "cloud-api";

function getRequestedModel() {
  return process.env.OLLAMA_MODEL?.trim() || DEFAULT_MODEL;
}

function normalizeCloudModelName(model: string) {
  return model.replace(/-cloud$/, "");
}

function createOllamaClient() {
  const requestedModel = getRequestedModel();
  const apiKey = process.env.OLLAMA_API_KEY?.trim();

  if (apiKey) {
    return {
      client: new Ollama({ host: DIRECT_CLOUD_HOST }),
      mode: "cloud-api" as OllamaMode,
      requestedModel,
      model: normalizeCloudModelName(requestedModel)
    };
  }

  return {
    client: new Ollama(),
    mode: "local-ollama" as OllamaMode,
    requestedModel,
    model: requestedModel
  };
}

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) {
    return "unknown size";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function buildScreenshotSummary(screenshots: ScreenshotMeta[]) {
  if (!screenshots.length) {
    return "No screenshots were uploaded.";
  }

  return screenshots
    .map((file, index) => {
      const typeLabel = file.type || "unknown type";
      return `${index + 1}. ${file.name} (${typeLabel}, ${formatFileSize(file.size)})`;
    })
    .join("\n");
}

function buildUserPrompt(input: JudgeRequest, screenshots: ScreenshotMeta[]) {
  return [
    `Name: ${input.name}`,
    `Age: ${input.age}`,
    `Gender: ${input.gender}`,
    "",
    "Bio:",
    input.bio,
    "",
    "Extra context:",
    input.context?.trim() || "None provided.",
    "",
    "Screenshot notes:",
    buildScreenshotSummary(screenshots),
    "",
    "Analyze the user's social profile presence using the system instructions.",
    "Return JSON only."
  ].join("\n");
}

async function buildImagePayload(files: File[]) {
  return Promise.all(
    files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      return new Uint8Array(bytes);
    })
  );
}

function parseJudgeResult(rawContent: unknown): JudgeResult {
  if (typeof rawContent === "object" && rawContent !== null) {
    return judgeResultSchema.parse(rawContent);
  }

  if (typeof rawContent !== "string") {
    throw new Error("Ollama returned an invalid response.");
  }

  const cleaned = rawContent
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  try {
    return judgeResultSchema.parse(JSON.parse(cleaned));
  } catch {
    throw new Error("Ollama returned invalid JSON for the review.");
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Ollama error.";
}

function isLikelyImageCapabilityError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  return [
    "image",
    "images",
    "vision",
    "multimodal",
    "unsupported",
    "invalid input"
  ].some((pattern) => message.includes(pattern));
}

function normalizeOllamaError(error: unknown, mode: OllamaMode, requestedModel: string) {
  const message = getErrorMessage(error);
  const lower = message.toLowerCase();

  if (mode === "cloud-api" && (lower.includes("401") || lower.includes("403") || lower.includes("unauthorized"))) {
    return "OLLAMA_API_KEY was rejected by Ollama Cloud. Check the key and try again.";
  }

  if (lower.includes("not found") || (lower.includes("model") && lower.includes("pull"))) {
    if (mode === "cloud-api") {
      return `The Ollama model "${requestedModel}" is not available for this cloud request. Check OLLAMA_MODEL or use the default cloud model.`;
    }

    return `The Ollama model "${requestedModel}" is not available locally. Run "ollama signin" and "ollama pull ${requestedModel}", then try again.`;
  }

  if (mode === "local-ollama" && (lower.includes("fetch failed") || lower.includes("econnrefused") || lower.includes("connect"))) {
    return `Could not reach local Ollama. Start Ollama, run "ollama signin", pull "${requestedModel}", and try again. You can also set OLLAMA_API_KEY to use Ollama Cloud directly.`;
  }

  return `Ollama could not complete the review. ${message}`;
}

async function sendChatRequest(
  input: JudgeRequest,
  screenshots: ScreenshotMeta[],
  imagePayload: Uint8Array[] | undefined
) {
  const { client, model } = createOllamaClient();

  return client.chat({
    model,
    stream: false,
    format: judgeResultFormat,
    options: {
      temperature: 0.45
    },
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      {
        role: "user",
        content: buildUserPrompt(input, screenshots),
        images: imagePayload
      }
    ]
  });
}

export async function analyzeWithOllama(
  input: JudgeRequest,
  files: File[],
  screenshots: ScreenshotMeta[]
) {
  const { mode, requestedModel } = createOllamaClient();
  const imagePayload = files.length ? await buildImagePayload(files.slice(0, 4)) : undefined;

  try {
    const response = await sendChatRequest(input, screenshots, imagePayload);
    return parseJudgeResult(response.message.content);
  } catch (error) {
    if (imagePayload?.length && isLikelyImageCapabilityError(error)) {
      try {
        const retryResponse = await sendChatRequest(input, screenshots, undefined);
        const retryResult = parseJudgeResult(retryResponse.message.content);

        return {
          ...retryResult,
          note:
            retryResult.note ||
            "This review relied more on your bio, context, and screenshot metadata because image input was not accepted for this run."
        };
      } catch (retryError) {
        throw new Error(normalizeOllamaError(retryError, mode, requestedModel));
      }
    }

    throw new Error(normalizeOllamaError(error, mode, requestedModel));
  }
}

export function getDefaultOllamaModel() {
  return DEFAULT_MODEL;
}
