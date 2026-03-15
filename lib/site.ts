import type { Route } from "next";

import type { JudgeResult } from "@/lib/types";

type NavItem = {
  href: Route;
  label: string;
};

export const siteConfig = {
  name: "VibeJudge",
  description:
    "Answer guided questions, add your bio and screenshots, and get a clear review of how your social presence comes across.",
  url: "https://vibejudge.app",
  nav: [
    { href: "/", label: "Home" },
    { href: "/judge", label: "Start Review" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/contact", label: "Contact" }
  ] as NavItem[]
};

export const heroBadges = [
  "Guided question flow",
  "Profile-focused feedback",
  "Clear improvement plan"
];

export const howItWorks = [
  {
    title: "Answer the quick intro questions",
    description: "VibeJudge asks about your lifestyle, confidence, goals, and the impression you want to give off."
  },
  {
    title: "Share the profile context",
    description: "Add your bio and any extra context so the review understands how you currently present yourself."
  },
  {
    title: "Upload screenshots",
    description: "Add profile, post, or story screenshots so the review can assess your visual presentation too."
  },
  {
    title: "Get the review",
    description: "VibeJudge returns a direct, helpful breakdown of strengths, weak spots, aura blockers, and next steps."
  }
];

export const reviewAreas = [
  "Overall vibe and first impression",
  "What looks strong and what weakens the profile",
  "What lowers your aura or makes the profile feel less polished",
  "Bio quality and profile presentation",
  "How to present yourself better online",
  "Practical next steps you can apply immediately",
  "Four shareable profile scores"
];

export const sampleResult: JudgeResult = {
  auraScore: 72,
  confidenceScore: 66,
  profileClarityScore: 63,
  socialPresenceScore: 69,
  overallVibe:
    "You come across as capable and interesting, but the profile feels more mixed than intentional.",
  firstImpression:
    "There is enough personality here to hold attention, but the presentation is not yet doing you full justice. The strongest parts suggest confidence, while the weaker parts make the account feel a little uneven.",
  strengths: [
    "Your tone has personality instead of sounding generic.",
    "There are glimpses of confidence and real-life momentum.",
    "The profile does not feel fake or over-optimized."
  ],
  weakPoints: [
    "The account lacks one clear through-line.",
    "Some visuals or captions reduce the sense of polish.",
    "The overall impression is less sharp than it could be."
  ],
  lowAuraFactors: [
    "Inconsistent photo quality or style choices.",
    "A bio that tries to say too much at once.",
    "Posts that add noise without strengthening your image."
  ],
  bioAnalysis:
    "The bio has real personality, but it is trying to carry too many ideas at once. It would land better if one clear identity came through first.",
  profilePresentation:
    "The profile looks real and human, which helps, but the presentation still feels a little mixed. The strongest posts suggest taste and confidence while the weaker ones flatten the overall impression.",
  improvements: [
    "Aim for cleaner visual consistency so the account feels more intentional.",
    "Cut the filler posts and keep only the images that raise the overall standard.",
    "Tighten the bio so one clear identity comes through immediately."
  ],
  confidenceTips: [
    "You do not need to look louder. You need to look more settled.",
    "Calm, clear presentation reads stronger than trying too hard.",
    "A profile that feels selective usually reads as more confident."
  ],
  finalPlan: [
    "Rewrite the bio into one clean idea instead of stacking multiple identities.",
    "Archive low-signal posts that make the profile feel random.",
    "Use two or three high-quality images that repeat the same level of polish.",
    "Make future stories and captions sound calmer, clearer, and more selective."
  ],
  note:
    "This sample shows the structure of the review. Real results depend on your actual bio, context, and screenshots."
};

export const faqs = [
  {
    question: "What does VibeJudge review?",
    answer:
      "It reviews the way your social presence comes across based on the guided answers you give, the bio you share, and any screenshots you upload."
  },
  {
    question: "Is the feedback insulting?",
    answer:
      "No. The tone is honest and a little bold, but it is meant to be useful, safe, and actionable rather than cruel."
  },
  {
    question: "Do I need perfect screenshots?",
    answer:
      "No. Clear screenshots help, but the app can still work with a few ordinary profile, story, or post captures."
  },
  {
    question: "Can I use this to improve my profile over time?",
    answer:
      "Yes. The result is designed to be practical so you can make changes, come back, and review the profile again."
  }
];

export const judgeSteps = [
  { number: 1, label: "Basics" },
  { number: 2, label: "Bio" },
  { number: 3, label: "Screenshots" },
  { number: 4, label: "Review" }
] as const;

export const judgeCopy = {
  basicsHelper: "Keep it simple. This just gives the review some context.",
  bioPlaceholder:
    "Example: Creative director, gym in the morning, too many tabs open, trying to be low-key but not invisible.",
  contextPlaceholder:
    "Optional: say what kind of image you want to give off, what feels off about the profile, or what kind of feedback you want most.",
  uploadHelper:
    "Upload up to 4 screenshots. Profile pages, stories, posts, and highlights are all useful.",
  previewNotes: [
    "A clear overall vibe read",
    "Honest notes on what weakens the profile",
    "Bio and profile presentation analysis",
    "Specific advice to present yourself better online",
    "Practical next steps instead of vague hype",
    "Shareable score cards"
  ]
};
