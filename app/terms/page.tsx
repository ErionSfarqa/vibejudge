import type { Metadata } from "next";

import { PageIntro } from "@/components/site/page-intro";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms and usage expectations for VibeJudge."
};

export default function TermsPage() {
  return (
    <section className="section-shell">
      <div className="page-container max-w-4xl space-y-8">
        <PageIntro
          eyebrow="Terms"
          title="Clear boundaries make the review more useful."
          description="These terms are a practical starter. Replace them with your final legal language before production use."
        />
        <Reveal className="glass-panel space-y-6 p-6 sm:p-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Use of the review</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              VibeJudge provides presentation-focused feedback based on the details and screenshots
              you submit. It should not be treated as factual profiling, professional advice, or a
              statement about a person’s worth.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Acceptable use</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Do not use the service to generate hateful, explicit, abusive, discriminatory, or
              unlawful content. Abuse prevention measures may rate-limit or block requests that look
              automated or unsafe.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Service changes</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Features, prompts, integrations, and uptime can change as the product evolves. You are
              responsible for reviewing and customizing these terms to match your final deployment.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
