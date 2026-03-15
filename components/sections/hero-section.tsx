"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { heroBadges, reviewAreas, sampleResult } from "@/lib/site";

export function HeroSection() {
  return (
    <section className="section-shell pt-10 sm:pt-14 lg:pt-16">
      <div className="page-container grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="max-w-3xl">
          <Reveal>
            <Badge>Built for social profile reviews</Badge>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
              See how your profile comes across, and what to fix next.
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-2xl text-balance text-lg leading-8 text-slate-600 sm:text-xl">
              VibeJudge gives you a clear review of your social presence. Answer a few guided
              questions, add your bio, upload screenshots, and get direct feedback on what looks
              strong, what weakens the profile, and how to improve it.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/judge">
                  Start Your Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href="#how-it-works">How it works</a>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap gap-3">
              {heroBadges.map((badge) => (
                <Badge key={badge}>{badge}</Badge>
              ))}
            </div>
          </Reveal>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="glass-panel p-6 sm:p-8">
            <p className="text-sm font-semibold text-brand">What the review looks at</p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-foreground">
              Practical notes, not vague hype.
            </h2>
            <div className="mt-6 space-y-3">
              {reviewAreas.map((item) => (
                <div key={item} className="rounded-3xl border border-line bg-background px-4 py-4">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-3xl border border-line bg-background p-5">
              <p className="text-sm font-medium text-slate-500">Example score snapshot</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <ScoreBadge label="Aura" value={sampleResult.auraScore} />
                <ScoreBadge label="Confidence" value={sampleResult.confidenceScore} />
                <ScoreBadge label="Clarity" value={sampleResult.profileClarityScore} />
                <ScoreBadge label="Presence" value={sampleResult.socialPresenceScore} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-800">{value}</p>
    </div>
  );
}
