export type JudgeRequest = {
  name: string;
  age: number;
  gender: string;
  bio: string;
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
};

export type FeedbackRequest = {
  name: string;
  email: string;
  message: string;
};
