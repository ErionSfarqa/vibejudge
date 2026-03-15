import type { Metadata } from "next";

import { JudgeWorkbench } from "@/components/judge/judge-workbench";

export const metadata: Metadata = {
  title: "Start Review",
  description:
    "Answer a guided set of questions, upload screenshots, and get a sharper VibeJudge profile review."
};

export default function JudgePage() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden py-0 sm:py-6 lg:py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[4%] h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute right-[4%] top-[20%] h-72 w-72 rounded-full bg-brand-rose/30 blur-3xl" />
        <div className="absolute bottom-[6%] left-[22%] h-72 w-72 rounded-full bg-brand-sky/70 blur-3xl" />
      </div>
      <div className="page-container relative min-h-[100svh] px-0 sm:min-h-0 sm:px-6 lg:px-8">
        <JudgeWorkbench />
      </div>
    </section>
  );
}
