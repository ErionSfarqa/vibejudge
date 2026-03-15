import type { Metadata } from "next";

import { PageIntro } from "@/components/site/page-intro";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for the VibeJudge website and judge tool."
};

export default function PrivacyPage() {
  return (
    <section className="section-shell">
      <div className="page-container max-w-4xl space-y-8">
        <PageIntro
          eyebrow="Privacy"
          title="Your inputs are used for the review, not for unnecessary tracking."
          description="This project keeps the data story simple. Review and customize this page before launching publicly."
        />
        <Reveal className="glass-panel space-y-6 p-6 sm:p-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">What we collect</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              VibeJudge sends the information you provide, including bio text, context, screenshots,
              and feedback messages, to secure server-side routes so the app can generate a profile
              review. Basic request metadata may also be used for rate limiting and abuse prevention.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">How it is used</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Submitted content is used to generate profile feedback and keep the product working
              reliably. This starter does not include user accounts or heavy tracking by default.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">What to customize</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Before production, add your hosting provider details, retention policy, analytics
              vendors, and any region-specific compliance language that applies to your audience.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
