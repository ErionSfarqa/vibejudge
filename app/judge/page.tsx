import type { Metadata } from "next";

import { JudgeWorkbench } from "@/components/judge/judge-workbench";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = {
  title: "Judge Tool",
  description: "Get a clear profile review with a simple step-by-step flow and a dedicated results page."
};

export default function JudgePage() {
  return (
    <section className="section-shell">
      <div className="page-container space-y-10">
        <PageIntro
          eyebrow="Start Review"
          title="A simple profile review, one step at a time."
          description="Enter your basics, add your bio, upload screenshots, and get redirected to a clean result page with direct feedback on how your social presence reads."
        />
        <JudgeWorkbench />
      </div>
    </section>
  );
}
