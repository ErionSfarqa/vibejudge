import { Camera, ClipboardCheck, FileText, UserRound } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { howItWorks } from "@/lib/site";

const icons = [UserRound, FileText, Camera, ClipboardCheck];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-shell">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="How It Works"
            title="A short flow that stays easy to understand."
            description="The product is built around one job: reviewing how a profile looks and telling you what to improve."
          />
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {howItWorks.map((step, index) => {
            const Icon = icons[index];

            return (
              <Reveal key={step.title} delay={index * 0.08} className="glass-panel p-6 sm:p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-sky">
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <p className="mt-6 text-sm font-semibold text-brand">Step {index + 1}</p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

