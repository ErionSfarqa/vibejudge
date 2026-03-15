import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { judgeCopy } from "@/lib/site";

export function PublicResults() {
  return (
    <section className="section-shell">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="What You Get"
            title="The result is structured around improvement."
            description="The review focuses on the parts people actually want help with: confidence, polish, clarity, attraction, and social presence."
          />
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="glass-panel p-6 sm:p-7">
            <p className="text-sm font-semibold text-brand">The review covers</p>
            <div className="mt-6 space-y-3">
              {judgeCopy.previewNotes.map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-line bg-background px-4 py-4 text-sm leading-6 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="mt-8">
              <Link href="/judge">
                Start your review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
          <Reveal delay={0.08} className="glass-panel p-6 sm:p-7">
            <p className="text-sm font-semibold text-brand">Who it helps most</p>
            <div className="mt-6 space-y-4">
              <UseCaseCard
                title="People refining their Instagram or dating presence"
                description="Useful when you know the profile feels off, but you cannot tell what is lowering the impression."
              />
              <UseCaseCard
                title="Anyone who wants actionable profile feedback"
                description="Useful when vague compliments are not helping and you want direct suggestions instead."
              />
              <UseCaseCard
                title="Anyone testing changes over time"
                description="You can update the bio, remove weak screenshots, and run the review again to see if the profile reads stronger."
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function UseCaseCard({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-line bg-background p-4">
      <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

