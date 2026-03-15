import { z } from "zod";

const MAX_UPLOAD_SIZE = 4 * 1024 * 1024;
const MAX_UPLOAD_COUNT = 4;
const multiSelectFieldSchema = z.array(z.string().trim().min(2).max(120)).min(1).max(6);

export const judgeRequestSchema = z.object({
  name: z.string().trim().min(2).max(40),
  age: z.coerce.number().int().min(13).max(99),
  gender: z.string().trim().min(2).max(40),
  gymStatus: z.string().trim().min(2).max(20),
  trainingFrequency: z.string().trim().max(40).optional(),
  currentGoal: multiSelectFieldSchema,
  lifestyle: multiSelectFieldSchema,
  disciplineLevel: z.string().trim().min(3).max(40),
  energyLevel: z.string().trim().min(3).max(40),
  socialConfidence: z.string().trim().min(3).max(20),
  socialPresence: z.string().trim().min(3).max(40),
  biggestWeakness: multiSelectFieldSchema,
  perceivedByOthers: z.string().trim().min(4).max(120),
  desiredPerception: multiSelectFieldSchema,
  styleImage: z.string().trim().min(4).max(120),
  socialMediaActivity: z.string().trim().min(4).max(120),
  habits: multiSelectFieldSchema,
  improvementFocus: multiSelectFieldSchema,
  context: z.string().trim().max(1000).optional()
}).superRefine((value, ctx) => {
  if (value.gymStatus !== "No" && !value.trainingFrequency?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["trainingFrequency"],
      message: "Add your training frequency so the review understands that part of your routine."
    });
  }
});

export const feedbackRequestSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(120),
  message: z.string().trim().min(12).max(1000)
});

export const judgeResultSchema = z.object({
  auraScore: z.number().int().min(1).max(99),
  confidenceScore: z.number().int().min(1).max(99),
  profileClarityScore: z.number().int().min(1).max(99),
  socialPresenceScore: z.number().int().min(1).max(99),
  overallVibe: z.string().min(20).max(280),
  firstImpression: z.string().min(20).max(320),
  strengths: z.array(z.string().min(8).max(180)).min(2).max(5),
  weakPoints: z.array(z.string().min(8).max(180)).min(2).max(5),
  lowAuraFactors: z.array(z.string().min(8).max(180)).min(2).max(5),
  bioAnalysis: z.string().min(20).max(320),
  profilePresentation: z.string().min(20).max(360),
  improvements: z.array(z.string().min(8).max(180)).min(2).max(5),
  confidenceTips: z.array(z.string().min(8).max(180)).min(2).max(5),
  finalPlan: z.array(z.string().min(8).max(200)).min(3).max(5),
  note: z.string().max(220).optional(),
  rawText: z.string().max(8000).optional()
});

export function validateUploads(files: File[]) {
  if (files.length === 0) {
    throw new Error("Upload at least one screenshot before starting the review.");
  }

  if (files.length > MAX_UPLOAD_COUNT) {
    throw new Error(`Upload up to ${MAX_UPLOAD_COUNT} screenshots at a time.`);
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are supported.");
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      throw new Error("Each screenshot must be 4 MB or smaller.");
    }
  }
}
