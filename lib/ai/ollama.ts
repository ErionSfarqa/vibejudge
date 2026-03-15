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
const RESPONSE_SCHEMA_TEMPLATE = `{
  "auraScore": 74,
  "confidenceScore": 68,
  "profileClarityScore": 59,
  "socialPresenceScore": 71,
  "overallVibe": "string",
  "firstImpression": "string",
  "strengths": ["string", "string"],
  "weakPoints": ["string", "string"],
  "lowAuraFactors": ["string", "string"],
  "bioAnalysis": "string",
  "profilePresentation": "string",
  "improvements": ["string", "string"],
  "confidenceTips": ["string", "string"],
  "finalPlan": ["string", "string", "string"],
  "note": "optional string"
}`;

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

Output contract:
- You must return ONLY valid JSON.
- Do not include markdown.
- Do not wrap the JSON in code fences.
- Do not write any explanation before or after the JSON.
- Do not add headings.
- Do not add notes outside the JSON object.
- Do not add commentary.
- Return exactly one valid JSON object.
- Your response must start with "{" and end with "}".

Schema requirements:
- Every required field must exist.
- Arrays must always be arrays.
- Use short, clear strings.
- Keep the output concise enough for mobile.
- Do not include extra fields beyond the schema below, except the optional "note" field.
- Strengths, weakPoints, lowAuraFactors, improvements, and confidenceTips should each contain 2 to 5 short items.
- finalPlan should contain 3 to 5 short items.
- Keep overallVibe, firstImpression, bioAnalysis, and profilePresentation direct and compact.

Return this schema exactly:
${RESPONSE_SCHEMA_TEMPLATE}
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
    "USER PROFILE INPUT",
    `name: ${input.name}`,
    `age: ${input.age}`,
    `gender: ${input.gender}`,
    "",
    "QUESTIONNAIRE",
    `gymRoutine: ${gymSummary}`,
    `currentGoal: ${formatSelections(input.currentGoal)}`,
    `lifestyle: ${formatSelections(input.lifestyle)}`,
    `disciplineLevel: ${input.disciplineLevel}`,
    `energyLevel: ${input.energyLevel}`,
    `socialConfidence: ${input.socialConfidence}`,
    `socialPresence: ${input.socialPresence}`,
    `biggestWeakness: ${formatSelections(input.biggestWeakness)}`,
    `perceivedByOthers: ${input.perceivedByOthers}`,
    `desiredPerception: ${formatSelections(input.desiredPerception)}`,
    `styleImage: ${input.styleImage}`,
    `socialMediaActivity: ${input.socialMediaActivity}`,
    `habits: ${formatSelections(input.habits)}`,
    `improvementFocus: ${formatSelections(input.improvementFocus)}`,
    "",
    "EXTRA_CONTEXT",
    `context: ${input.context?.trim() || "None provided."}`,
    "",
    "SCREENSHOT_NOTES",
    buildScreenshotSummary(screenshots),
    "",
    "FORMATTING INSTRUCTION",
    "Return ONLY one valid JSON object matching the required schema.",
    "No markdown.",
    "No code fences.",
    "No explanation.",
    "No intro sentence.",
    "No notes before or after.",
    "No extra text."
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

function cleanModelText(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
}

function uniqueItems(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function clipText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(1, maxLength - 3)).trimEnd()}...`;
}

function ensureSentence(value: string, fallback: string, maxLength: number) {
  const normalized = clipText(value.trim(), maxLength);
  return normalized.length >= 20 ? normalized : fallback;
}

function extractRawTextPoints(rawText: string) {
  const normalized = rawText.replace(/\r/g, "");
  const lines = normalized
    .split(/\n+/)
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").replace(/^\s*\d+[\).\s-]+/, "").trim())
    .filter((line) => line.length >= 8);
  const sentences = normalized
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 8);

  return uniqueItems([...lines, ...sentences]).slice(0, 20);
}

function selectPoints(
  points: string[],
  matchers: RegExp[],
  count: number,
  fallbacks: string[],
  used: Set<string>,
  maxLength = 180
) {
  const selected: string[] = [];

  for (const point of points) {
    if (selected.length >= count) {
      break;
    }

    if (used.has(point)) {
      continue;
    }

    if (matchers.some((matcher) => matcher.test(point))) {
      selected.push(clipText(point, maxLength));
      used.add(point);
    }
  }

  for (const point of points) {
    if (selected.length >= count) {
      break;
    }

    if (used.has(point)) {
      continue;
    }

    selected.push(clipText(point, maxLength));
    used.add(point);
  }

  while (selected.length < count) {
    const fallback = fallbacks[selected.length] ?? fallbacks[fallbacks.length - 1];
    selected.push(clipText(fallback, maxLength));
  }

  return selected;
}

function buildFallbackJudgeResult(rawText: string): JudgeResult {
  const cleaned = cleanModelText(rawText);
  const normalizedText =
    cleaned ||
    "The model returned an empty text response, so VibeJudge created a fallback summary from the available output.";
  const points = extractRawTextPoints(normalizedText);
  const used = new Set<string>();
  const summarySource = points[0] ?? normalizedText;
  const overview = ensureSentence(
    summarySource,
    "Analysis available, but the AI returned text instead of strict JSON.",
    260
  );
  const strengths = selectPoints(
    points,
    [/\b(strength|strong|clear|good|polished|confident|interesting|attractive|disciplined)\b/i],
    2,
    [
      "The response still contained usable observations about the profile presentation.",
      "There was enough free-form analysis to build a readable summary for the result page."
    ],
    used
  );
  const weakPoints = selectPoints(
    points,
    [/\b(weak|issue|problem|unclear|inconsistent|lacking|overthinking|trying too hard|low confidence|hurts)\b/i],
    2,
    [
      "The model did not return structured weak points, so some issues had to be inferred from the text.",
      "The response format reduced clarity, which makes the profile feedback less precise than normal."
    ],
    used
  );
  const improvements = selectPoints(
    points,
    [/\b(improve|fix|focus|work on|upgrade|build|show|add|clean up|refine)\b/i],
    2,
    [
      "Focus first on the clearest improvement themes mentioned in the response.",
      "Use the text summary as guidance for the next profile update rather than treating it as final."
    ],
    used
  );
  const confidenceTips = selectPoints(
    points,
    [/\b(confidence|presence|intentional|consistent|social|discipline|energy)\b/i],
    2,
    [
      "Aim for a more intentional and consistent presentation across the profile.",
      "Stronger confidence signals usually come from clarity, consistency, and cleaner profile choices."
    ],
    used
  );
  const finalPlan = selectPoints(
    points,
    [/\b(step|plan|next|improve|fix|focus|upgrade|start)\b/i],
    3,
    [
      "Review the strongest point from the analysis and keep that signal consistent.",
      "Address the clearest weak point before making cosmetic changes.",
      "Use the improvement suggestions as the next short list for profile updates."
    ],
    used,
    200
  );

  return judgeResultSchema.parse({
    auraScore: 62,
    confidenceScore: 58,
    profileClarityScore: 56,
    socialPresenceScore: 60,
    overallVibe: overview,
    firstImpression: ensureSentence(
      points[1] ?? normalizedText,
      "The AI returned a readable text analysis, and VibeJudge converted it into a structured result instead of failing.",
      320
    ),
    strengths,
    weakPoints,
    lowAuraFactors: weakPoints.slice(0, 2),
    bioAnalysis: ensureSentence(
      points[2] ?? normalizedText,
      "The returned text gave enough information to summarize the written and presentation cues in fallback form.",
      320
    ),
    profilePresentation: ensureSentence(
      points[3] ?? normalizedText,
      "The response came back as plain text, so VibeJudge converted the profile presentation notes into a structured fallback result.",
      360
    ),
    improvements,
    confidenceTips,
    finalPlan,
    note: "The AI returned text instead of strict JSON, so VibeJudge converted it into a fallback result.",
    rawText: clipText(normalizedText, 8000)
  });
}

function parseJudgeResult(rawContent: unknown): JudgeResult {
  if (typeof rawContent === "object" && rawContent !== null) {
    try {
      return judgeResultSchema.parse(rawContent);
    } catch (error) {
      console.error("[ollama] Structured review payload failed validation. Falling back to text result.", {
        error: getErrorMessage(error)
      });

      return buildFallbackJudgeResult(JSON.stringify(rawContent));
    }
  }

  if (typeof rawContent !== "string") {
    return buildFallbackJudgeResult("The model returned a non-text response that could not be parsed normally.");
  }

  const cleaned = cleanModelText(rawContent);
  const candidates = uniqueItems([cleaned]);
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(cleaned.slice(firstBrace, lastBrace + 1));
  }

  let lastError: unknown;

  for (const candidate of candidates) {
    try {
      return judgeResultSchema.parse(JSON.parse(candidate));
    } catch (error) {
      lastError = error;
    }
  }

  console.error("[ollama] Failed to parse streamed review JSON. Using text fallback result.", {
    error: getErrorMessage(lastError),
    responsePreview: cleaned.slice(0, 2000)
  });

  return buildFallbackJudgeResult(cleaned);
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
