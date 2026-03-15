"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Copy } from "lucide-react";

import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import type { JudgeResult } from "@/lib/types";
import { buildResultCopy, clearJudgeResult, loadJudgeResult } from "@/lib/result-storage";

type StoredState = {
  result: JudgeResult | null;
  savedAt: string | null;
};

const scoreRows = [
  { key: "auraScore", label: "Aura Score" },
  { key: "confidenceScore", label: "Confidence Score" },
  { key: "socialPresenceScore", label: "Social Presence" }
] as const;

export function ResultPageClient() {
  const [stored, setStored] = useState<StoredState | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const nextStored = loadJudgeResult();
    setStored(nextStored);
  }, []);

  const result = stored?.result ?? null;
  const copyText = useMemo(() => (result ? buildResultCopy(result) : ""), [result]);

  async function handleCopy() {
    if (!copyText) {
      return;
    }

    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function handleAnalyzeAnother() {
    clearJudgeResult();
  }

  if (stored === null) {
    return (
      <section className="section-shell">
        <div className="page-container max-w-5xl">
          <div className="glass-panel p-8 sm:p-10">
            <div className="h-5 w-28 rounded-full bg-slate-200" />
            <div className="mt-5 h-12 w-2/3 rounded-3xl bg-slate-200" />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-[1.75rem] border border-line bg-background p-5">
                  <div className="h-4 w-20 rounded-full bg-slate-200" />
                  <div className="mt-4 h-8 w-16 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-4">
              <div className="h-20 rounded-[1.75rem] bg-slate-200" />
              <div className="h-24 rounded-[1.75rem] bg-slate-200" />
              <div className="h-24 rounded-[1.75rem] bg-slate-200" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="section-shell">
        <div className="page-container max-w-4xl">
          <div className="glass-panel p-8 text-center sm:p-10">
            <p className="text-sm font-semibold text-brand">No saved result</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-foreground">
              There is no analysis ready to show.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Start a new review from the judge page. Once the AI finishes, VibeJudge will bring you
              back here automatically.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/judge" onClick={handleAnalyzeAnother}>
                Analyze a profile
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell">
      <div className="page-container max-w-5xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo className="scale-90 origin-left" />
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={handleCopy}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied" : "Copy Result"}
            </Button>
            <Button asChild size="lg">
              <Link href="/judge" onClick={handleAnalyzeAnother}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Analyze another profile
              </Link>
            </Button>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="glass-panel overflow-hidden p-8 sm:p-10"
        >
          <div className="rounded-[2rem] border border-brand/10 bg-[linear-gradient(135deg,rgba(31,60,136,0.12),rgba(255,255,255,0.7))] p-8 text-center sm:p-10">
            <p className="text-sm font-semibold text-brand">Result Summary</p>
            <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {result.overallVibe}
            </h1>
            <div className="mx-auto mt-8 grid max-w-3xl gap-4 md:grid-cols-3">
              {scoreRows.map((item) => (
                <ScoreCard key={item.key} label={item.label} value={result[item.key]} />
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4">
          <TextSection
            title="First Impression"
            description="How the profile likely lands in the first few seconds."
            value={result.firstImpression}
          />
          <ListSection title="Strengths" items={result.strengths} />
          <ListSection title="Weak Points" items={result.weakPoints} />
          <ListSection title="Low Aura Factors" items={result.lowAuraFactors} />
          <div className="grid gap-4 lg:grid-cols-2">
            <TextSection
              title="Bio Analysis"
              description="Clarity, personality, and impact of the bio."
              value={result.bioAnalysis}
            />
            <TextSection
              title="Profile Presentation"
              description="How the profile structure and screenshot evidence come across."
              value={result.profilePresentation}
            />
          </div>
          <ListSection title="Improvement Suggestions" items={result.improvements} />
          <ListSection title="Confidence Tips" items={result.confidenceTips} />
          <ListSection title="Final Aura Upgrade Plan" items={result.finalPlan} />
          {result.note ? (
            <TextSection
              title="Note"
              description="Extra context about how the review was interpreted."
              value={result.note}
            />
          ) : null}
        </div>

        <footer className="pb-2 text-center text-sm text-slate-500">
          {stored.savedAt ? `Saved to this browser session.` : "Saved to this browser session."}
        </footer>
      </div>
    </section>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.75rem] border border-line bg-white/70 p-5 text-left shadow-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-4xl font-semibold text-foreground">{value}</p>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  );
}

function TextSection({
  title,
  description,
  value
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <section className="glass-panel p-6 sm:p-7">
      <p className="text-sm font-semibold text-brand">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <p className="mt-5 text-base leading-8 text-slate-700">{value}</p>
    </section>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  const safeItems = Array.isArray(items) && items.length ? items : ["No details were returned for this section."];

  return (
    <section className="glass-panel p-6 sm:p-7">
      <p className="text-sm font-semibold text-brand">{title}</p>
      <div className="mt-5 grid gap-3">
        {safeItems.map((item) => (
          <div key={item} className="rounded-[1.5rem] border border-line bg-background px-4 py-4">
            <p className="text-sm leading-7 text-slate-700">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
