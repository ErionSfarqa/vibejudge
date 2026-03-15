import type { JudgeResult } from "@/lib/types";

export function buildGuardrailResult(reason: "unsafe" | "spam"): JudgeResult {
  return {
    auraScore: 34,
    confidenceScore: 38,
    profileClarityScore: 32,
    socialPresenceScore: 35,
    overallVibe:
      "The request could not be reviewed properly because the content looked unsafe or overly spammy.",
    firstImpression:
      "VibeJudge only gives profile feedback when the input is clear and safe enough to analyze. This request needs a cleaner rewrite first.",
    strengths: [
      "You can still get a useful review with a normal bio and a few clean screenshots.",
      "The flow works best when the input is specific and easy to read."
    ],
    weakPoints: [
      "The current request does not provide a safe or usable basis for analysis.",
      "Spam-like or harmful content blocks the normal review."
    ],
    lowAuraFactors: [
      "Chaotic or aggressive input immediately lowers the quality of the result.",
      "Overloaded prompts make the profile harder to evaluate."
    ],
    bioAnalysis:
      "The bio or supporting text is not usable enough to judge clearly. Rewrite it in normal language with one clear idea.",
    profilePresentation:
      "The profile presentation cannot be reviewed properly when the input is spammy, unsafe, or too chaotic to trust.",
    improvements: [
      "Keep the submission straightforward. A simple bio and a few relevant screenshots are enough.",
      "Use normal language instead of trying to force a reaction out of the model.",
      "Upload only screenshots that are relevant to the profile review."
    ],
    confidenceTips: [
      "Clear presentation reads stronger than chaotic or aggressive input.",
      "A focused request gets you better feedback than trying to overwhelm the app."
    ],
    finalPlan: [
      "Rewrite the bio in normal language.",
      "Remove spammy, explicit, or harmful content.",
      "Upload only screenshots that are relevant to the profile review."
    ],
    note:
      reason === "unsafe"
        ? "Clean up the request and keep it safe, then try again."
        : "Reduce the noise and submit a more focused profile review request."
  };
}

export function addCaution(result: JudgeResult, cautionNote: string): JudgeResult {
  return {
    ...result,
    note: cautionNote
  };
}
