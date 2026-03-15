import type { JudgeResult } from "@/lib/types";
import { clampScore } from "@/lib/utils";

const RESULT_STORAGE_KEY = "vibejudge:last-result";

function asText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asTextList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return normalized.length ? normalized : fallback;
}

function asScore(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? clampScore(value) : fallback;
}

export function normalizeJudgeResult(value: unknown): JudgeResult | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;

  return {
    auraScore: asScore(raw.auraScore, 50),
    confidenceScore: asScore(raw.confidenceScore, 50),
    profileClarityScore: asScore(raw.profileClarityScore, 50),
    socialPresenceScore: asScore(raw.socialPresenceScore, 50),
    overallVibe: asText(raw.overallVibe, "A clear overall vibe was not returned."),
    firstImpression: asText(raw.firstImpression, "A first impression summary was not returned."),
    strengths: asTextList(raw.strengths, ["No strengths were returned."]),
    weakPoints: asTextList(raw.weakPoints, ["No weak points were returned."]),
    lowAuraFactors: asTextList(raw.lowAuraFactors, ["No low-aura factors were returned."]),
    bioAnalysis: asText(raw.bioAnalysis, "No bio analysis was returned."),
    profilePresentation: asText(raw.profilePresentation, "No profile presentation notes were returned."),
    improvements: asTextList(raw.improvements, ["No improvements were returned."]),
    confidenceTips: asTextList(raw.confidenceTips, ["No confidence tips were returned."]),
    finalPlan: asTextList(raw.finalPlan, ["No final plan was returned."]),
    note: typeof raw.note === "string" && raw.note.trim() ? raw.note.trim() : undefined
  };
}

export function storeJudgeResult(result: JudgeResult) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    RESULT_STORAGE_KEY,
    JSON.stringify({
      savedAt: new Date().toISOString(),
      result
    })
  );
}

export function loadJudgeResult() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(RESULT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { result?: unknown; savedAt?: string };

    return {
      result: normalizeJudgeResult(parsed.result),
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : null
    };
  } catch {
    return null;
  }
}

export function clearJudgeResult() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(RESULT_STORAGE_KEY);
}

export function buildResultCopy(result: JudgeResult) {
  const lines = [
    "VibeJudge Result",
    "",
    `Aura Score: ${result.auraScore}`,
    `Confidence Score: ${result.confidenceScore}`,
    `Profile Clarity: ${result.profileClarityScore}`,
    `Social Presence: ${result.socialPresenceScore}`,
    "",
    "Overall Vibe",
    result.overallVibe,
    "",
    "First Impression",
    result.firstImpression,
    "",
    "Strengths",
    ...result.strengths.map((item) => `- ${item}`),
    "",
    "Weak Points",
    ...result.weakPoints.map((item) => `- ${item}`),
    "",
    "Low Aura Factors",
    ...result.lowAuraFactors.map((item) => `- ${item}`),
    "",
    "Bio Analysis",
    result.bioAnalysis,
    "",
    "Profile Presentation",
    result.profilePresentation,
    "",
    "Improvements",
    ...result.improvements.map((item) => `- ${item}`),
    "",
    "Confidence Tips",
    ...result.confidenceTips.map((item) => `- ${item}`),
    "",
    "Final Aura Upgrade Plan",
    ...result.finalPlan.map((item) => `- ${item}`)
  ];

  if (result.note) {
    lines.push("", "Note", result.note);
  }

  return lines.join("\n");
}
