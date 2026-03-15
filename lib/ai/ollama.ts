import { Ollama } from "ollama";

import type {
  JudgeApiError,
  JudgeApiErrorCode,
  JudgeRequest,
  JudgeResult,
  ScreenshotMeta
} from "@/lib/types";
import { judgeResultSchema } from "@/lib/validations";

const DEFAULT_MODEL = "gpt-oss:120b-cloud";
const DIRECT_CLOUD_HOST = "https://ollama.com";

const SYSTEM_PROMPT = `
You are an AI social profile analyst.

Your job is to analyze a person's social presence and overall vibe based on the information they provide.

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
- Gym routine
- Current goal
- Lifestyle
- Discipline level
- Energy level
- Self-rated social confidence
- Current social presence
- Biggest weakness
- How they think others see them
- How they want to be seen
- Style / image direction
- Social media activity level
- Habits / consistency
- Main improvement focus
- Additional context
- Uploaded screenshots of social media profiles

Some questionnaire answers may contain multiple selected options. Treat those as a combined signal, not a contradiction.

Use this information to estimate how the person's social presence appears.
Use the questionnaire answers to personalize your read on their habits, discipline, confidence, and goals, but do not invent facts that are not supported.

What you must analyze:
1. Overall Vibe: how the person likely comes across to others.
2. First Impression: what people probably think in the first few seconds.
3. Strengths: positive traits in their presentation.
4. Weak Points: things that may hurt their image or reduce their impact.
5. Low Aura Factors: things that make the profile feel less confident, unclear, or unattractive.
6. Written Presentation: use the "bioAnalysis" field to explain the user's written/image presentation cues, or what that text should sound like if the screenshots do not reveal much written profile text.
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

type OllamaTarget = {
  client: Ollama;
  requestedModel: string;
  model: string;
};

type OllamaServiceErrorOptions = {
  code: JudgeApiErrorCode;
  status?: number;
  userMessage: string;
  adminMessage?: string;
  retryable?: boolean;
};

export class OllamaServiceError extends Error {
  code: JudgeApiErrorCode;
  status: number;
  userMessage: string;
  adminMessage?: string;
  retryable: boolean;

  constructor({
    code,
    status = 502,
    userMessage,
    adminMessage,
    retryable = true
  }: OllamaServiceErrorOptions) {
    super(adminMessage ?? userMessage);
    this.name = "OllamaServiceError";
    this.code = code;
    this.status = status;
    this.userMessage = userMessage;
    this.adminMessage = adminMessage;
    this.retryable = retryable;
  }

  toResponseError(): JudgeApiError {
    return {
      code: this.code,
      userMessage: this.userMessage,
      adminMessage: this.adminMessage,
      retryable: this.retryable
    };
  }
}

function getRequestedModel() {
  return DEFAULT_MODEL;
}

function createOllamaTarget(): OllamaTarget {
  const requestedModel = getRequestedModel();
  const apiKey = process.env.OLLAMA_API_KEY?.trim();

  if (!apiKey) {
    throw new OllamaServiceError({
      code: "AI_NOT_CONFIGURED",
      status: 503,
      userMessage: "The AI service is not configured yet for the live site.",
      adminMessage:
        "Set OLLAMA_API_KEY so the official Ollama JavaScript client can call https://ollama.com directly.",
      retryable: false
    });
  }

  return {
    client: new Ollama({
      host: DIRECT_CLOUD_HOST,
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    }),
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

function formatSelections(values: string[]) {
  return values.length ? values.join(", ") : "Not shared.";
}

function buildUserPrompt(input: JudgeRequest, screenshots: ScreenshotMeta[]) {
  const gymSummary =
    input.gymStatus === "No"
      ? "Does not currently go to the gym."
      : `${input.gymStatus}. Training frequency: ${input.trainingFrequency?.trim() || "Not shared."}`;

  return [
    `Name: ${input.name}`,
    `Age: ${input.age}`,
    `Gender: ${input.gender}`,
    "",
    "Questionnaire context:",
    `Gym routine: ${gymSummary}`,
    `Current goal: ${formatSelections(input.currentGoal)}`,
    `Lifestyle: ${formatSelections(input.lifestyle)}`,
    `Discipline level: ${input.disciplineLevel}`,
    `Energy level: ${input.energyLevel}`,
    `Social confidence: ${input.socialConfidence}`,
    `Current social presence: ${input.socialPresence}`,
    `Biggest weakness: ${formatSelections(input.biggestWeakness)}`,
    `How they think others see them: ${input.perceivedByOthers}`,
    `How they want to be seen: ${formatSelections(input.desiredPerception)}`,
    `Style / image: ${input.styleImage}`,
    `Social media activity: ${input.socialMediaActivity}`,
    `Habits / consistency: ${formatSelections(input.habits)}`,
    `Main improvement focus: ${formatSelections(input.improvementFocus)}`,
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

  const candidates = [cleaned];
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(cleaned.slice(firstBrace, lastBrace + 1));
  }

  let lastError: unknown;

  try {
    for (const candidate of candidates) {
      try {
        return judgeResultSchema.parse(JSON.parse(candidate));
      } catch (error) {
        lastError = error;
      }
    }
  } catch (error) {
    lastError = error;
  }

  console.error("[ollama] Failed to parse streamed review JSON.", {
    error: getErrorMessage(lastError),
    responsePreview: cleaned.slice(0, 2000)
  });

  throw new Error("Ollama returned invalid JSON for the review.");
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Ollama error.";
}

function normalizeOllamaError(error: unknown, target: OllamaTarget) {
  const message = getErrorMessage(error);
  const lower = message.toLowerCase();

  if (lower.includes("401") || lower.includes("403") || lower.includes("unauthorized")) {
    return new OllamaServiceError({
      code: "AI_AUTH_FAILED",
      status: 502,
      userMessage: "The AI service is temporarily unavailable right now.",
      adminMessage: `OLLAMA_API_KEY was rejected by Ollama Cloud. ${message}`,
      retryable: false
    });
  }

  if (lower.includes("not found") || (lower.includes("model") && lower.includes("pull"))) {
    return new OllamaServiceError({
      code: "AI_MODEL_UNAVAILABLE",
      status: 502,
      userMessage: "The AI service is still being configured for the live site.",
      adminMessage: `The Ollama cloud model "${target.requestedModel}" is not available. ${message}`,
      retryable: false
    });
  }

  if (lower.includes("invalid json")) {
    return new OllamaServiceError({
      code: "AI_UPSTREAM_ERROR",
      status: 502,
      userMessage: "The AI reply could not be read cleanly. Please try again.",
      adminMessage: `Ollama Cloud returned a non-JSON review payload. ${message}`,
      retryable: true
    });
  }

  return new OllamaServiceError({
    code: "AI_UPSTREAM_ERROR",
    status: 502,
    userMessage: "The AI review service ran into a temporary problem. Please try again.",
    adminMessage: `Ollama Cloud request failed. ${message}`
  });
}

async function sendChatRequest(
  target: OllamaTarget,
  input: JudgeRequest,
  screenshots: ScreenshotMeta[],
  imagePayload: Uint8Array[] | undefined
) {
  const response = await target.client.chat({
    model: target.model,
    stream: true,
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

  const parts: string[] = [];

  for await (const part of response) {
    const content = part.message?.content ?? "";

    if (content) {
      parts.push(content);
    }
  }

  return parts.join("").trim();
}

export async function analyzeWithOllama(
  input: JudgeRequest,
  files: File[],
  screenshots: ScreenshotMeta[]
) {
  const target = createOllamaTarget();
  const imagePayload = files.length ? await buildImagePayload(files.slice(0, 4)) : undefined;

  try {
    const streamedText = await sendChatRequest(target, input, screenshots, imagePayload);
    return parseJudgeResult(streamedText);
  } catch (error) {
    throw normalizeOllamaError(error, target);
  }
}

export function getDefaultOllamaModel() {
  return DEFAULT_MODEL;
}
