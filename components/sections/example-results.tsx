import { CheckCircle2 } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { sampleResult } from "@/lib/site";

export function ExampleResults() {
  return (
    <section className="section-shell">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Sample Review"
            title="The output is built to be useful on the first read."
            description="Instead of vague labels or empty hype, the result stays focused on presentation, weak spots, and next actions."
          />
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal className="glass-panel p-6 sm:p-8">
            <p className="text-sm font-semibold text-brand">Overall read</p>
            <h3 className="mt-4 font-display text-3xl font-semibold text-foreground">
              {sampleResult.overallVibe}
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">{sampleResult.firstImpression}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <MiniScore label="Aura" value={sampleResult.auraScore} />
              <MiniScore label="Confidence" value={sampleResult.confidenceScore} />
              <MiniScore label="Clarity" value={sampleResult.profileClarityScore} />
              <MiniScore label="Presence" value={sampleResult.socialPresenceScore} />
            </div>
          </Reveal>
          <Reveal delay={0.08} className="glass-panel p-6 sm:p-8">
            <p className="text-sm font-semibold text-brand">What you get back</p>
            <div className="mt-6 space-y-5">
              <PreviewTextBlock title="Bio analysis" value={sampleResult.bioAnalysis} />
              <PreviewTextBlock title="Profile presentation" value={sampleResult.profilePresentation} />
              <PreviewBlock title="What works" items={sampleResult.strengths} />
              <PreviewBlock title="What weakens the profile" items={sampleResult.weakPoints} />
              <PreviewBlock title="Final plan" items={sampleResult.finalPlan} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MiniScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-background px-4 py-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function PreviewBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-line bg-background px-4 py-3"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand" />
            <p className="text-sm leading-6 text-slate-700">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewTextBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-background px-4 py-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}
