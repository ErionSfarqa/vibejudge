"use client";

import { useState } from "react";
import { Check, Copy, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { JudgeResult } from "@/lib/types";

type ResultCardProps = {
  result: JudgeResult;
  onTryAgain: () => void;
};

const scoreRows = [
  { key: "auraScore", label: "Aura Score" },
  { key: "confidenceScore", label: "Confidence Score" },
  { key: "profileClarityScore", label: "Profile Clarity" },
  { key: "socialPresenceScore", label: "Social Presence" }
] as const;

export function ResultCard({ result, onTryAgain }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const strengths = Array.isArray(result.strengths) ? result.strengths : [];
  const weakPoints = Array.isArray(result.weakPoints) ? result.weakPoints : [];
  const lowAuraFactors = Array.isArray(result.lowAuraFactors) ? result.lowAuraFactors : [];
  const improvements = Array.isArray(result.improvements) ? result.improvements : [];
  const confidenceTips = Array.isArray(result.confidenceTips) ? result.confidenceTips : [];
  const finalPlan = Array.isArray(result.finalPlan) ? result.finalPlan : [];

  const reviewTextParts = [
    "Scores",
    `- Aura Score: ${result.auraScore}`,
    `- Confidence Score: ${result.confidenceScore}`,
    `- Profile Clarity: ${result.profileClarityScore}`,
    `- Social Presence: ${result.socialPresenceScore}`,
    "",
    "Overall vibe",
    result.overallVibe,
    "",
    "First impression",
    result.firstImpression,
    "",
    "Strengths",
    ...strengths.map((item) => `- ${item}`),
    "",
    "Weak points",
    ...weakPoints.map((item) => `- ${item}`),
    "",
    "Low aura factors",
    ...lowAuraFactors.map((item) => `- ${item}`),
    "",
    "Bio analysis",
    result.bioAnalysis,
    "",
    "Profile presentation",
    result.profilePresentation,
    "",
    "Improvements",
    ...improvements.map((item) => `- ${item}`),
    "",
    "Confidence tips",
    ...confidenceTips.map((item) => `- ${item}`),
    "",
    "Final plan",
    ...finalPlan.map((item) => `- ${item}`)
  ];

  if (result.note) {
    reviewTextParts.push("", "Note", result.note);
  }

  const reviewText = reviewTextParts.join("\n");

  async function handleCopy() {
    await navigator.clipboard.writeText(reviewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="glass-panel min-h-[32rem] overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand">Your review</p>
          <h3 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            {result.overallVibe}
          </h3>
        </div>
        <div className="max-w-sm rounded-[1.75rem] border border-line bg-background px-5 py-4">
          <p className="text-xs text-slate-500">First impression</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{result.firstImpression}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {scoreRows.map((item) => (
          <ScoreCard key={item.key} label={item.label} value={result[item.key]} />
        ))}
      </div>

      <div className="mt-8 grid gap-3">
        <InsightCard label="Bio analysis" value={result.bioAnalysis} />
        <InsightCard label="Profile presentation" value={result.profilePresentation} />
        <ListCard label="Strengths" items={strengths} />
        <ListCard label="Weak points" items={weakPoints} />
        <ListCard label="What lowers the aura" items={lowAuraFactors} />
        <ListCard label="What to improve" items={improvements} />
        <ListCard label="Confidence tips" items={confidenceTips} />
        <ListCard label="Final plan" items={finalPlan} />
        {result.note ? <InsightCard label="Note" value={result.note} /> : null}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button type="button" onClick={handleCopy}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? "Copied" : "Copy Review"}
        </Button>
        <Button type="button" variant="secondary" onClick={onTryAgain}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </div>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.75rem] border border-line bg-background p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold text-foreground">{value}</p>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  );
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-line bg-background p-5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="mt-3 text-sm leading-7 text-slate-700">{value}</p>
    </div>
  );
}

function ListCard({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-[1.75rem] border border-line bg-background p-5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {items.length ? (
        <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-500">No details were returned for this section.</p>
      )}
    </div>
  );
}
