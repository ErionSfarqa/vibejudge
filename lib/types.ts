export type JudgeRequest = {
  name: string;
  age: number;
  gender: string;
  gymStatus: string;
  trainingFrequency?: string;
  currentGoal: string[];
  lifestyle: string[];
  disciplineLevel: string;
  energyLevel: string;
  socialConfidence: string;
  socialPresence: string;
  biggestWeakness: string[];
  perceivedByOthers: string;
  desiredPerception: string[];
  styleImage: string;
  socialMediaActivity: string;
  habits: string[];
  improvementFocus: string[];
  context?: string;
};

export type ScreenshotMeta = {
  name: string;
  type: string;
  size: number;
};

export type JudgeResult = {
  auraScore: number;
  confidenceScore: number;
  profileClarityScore: number;
  socialPresenceScore: number;
  overallVibe: string;
  firstImpression: string;
  strengths: string[];
  weakPoints: string[];
  lowAuraFactors: string[];
  bioAnalysis: string;
  profilePresentation: string;
  improvements: string[];
  confidenceTips: string[];
  finalPlan: string[];
  note?: string;
  rawText?: string;
};

export type JudgeApiErrorCode =
  | "AI_NOT_CONFIGURED"
  | "AI_AUTH_FAILED"
  | "AI_MODEL_UNAVAILABLE"
  | "AI_UPSTREAM_ERROR"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "BAD_REQUEST";

export type JudgeApiError = {
  code: JudgeApiErrorCode;
  userMessage: string;
  adminMessage?: string;
  retryable?: boolean;
};

export type JudgeApiResponse = {
  result?: JudgeResult;
  error?: JudgeApiError;
  meta?: {
    guardrailed?: boolean;
  };
};

export type FeedbackRequest = {
  name: string;
  email: string;
  message: string;
};
