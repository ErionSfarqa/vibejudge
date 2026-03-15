import type { JudgeRequest, ScreenshotMeta } from "@/lib/types";

const blockedPatterns = [
  /\bkill yourself\b/i,
  /\bself[- ]harm\b/i,
  /\bsuicide\b/i,
  /\bsexual assault\b/i,
  /\brape\b/i,
  /\bminor[s]?\b.*\b(explicit|sexual|nude)\b/i,
  /\bterroris(m|t)\b/i,
  /\bgenocide\b/i
];

function countUrls(value: string) {
  return value.match(/https?:\/\/\S+/gi)?.length ?? 0;
}

function hasRepeatedNoise(value: string) {
  return /(.)\1{14,}/.test(value) || /\b(\w+)(?:\s+\1){7,}\b/i.test(value);
}

export function inspectJudgeInput(input: JudgeRequest, screenshots: ScreenshotMeta[] = []) {
  const combined = [input.name, input.gender, input.bio, input.context, ...screenshots.map((file) => file.name)]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!combined) {
    return { blocked: false as const };
  }

  if (blockedPatterns.some((pattern) => pattern.test(combined))) {
    return {
      blocked: true as const,
      reason: "unsafe" as const
    };
  }

  if (countUrls(combined) > 2 || hasRepeatedNoise(combined)) {
    return {
      blocked: true as const,
      reason: "spam" as const
    };
  }

  return { blocked: false as const };
}
