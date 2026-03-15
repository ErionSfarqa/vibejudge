import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/lib/site";

export function FaqSection() {
  return (
    <section className="section-shell">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title="Straight answers, without the hype."
            description="The experience is intentionally simple, so the main questions should be easy to answer too."
          />
        </Reveal>
        <div className="mt-10 space-y-4">
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} delay={index * 0.05}>
              <details className="glass-panel overflow-hidden p-6">
                <summary className="cursor-pointer list-none font-display text-xl font-semibold text-foreground">
                  {faq.question}
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{faq.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
