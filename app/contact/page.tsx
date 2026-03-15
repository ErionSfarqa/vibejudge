import type { Metadata } from "next";

import { ContactForm } from "@/components/site/contact-form";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send feedback, report issues, or share ideas for VibeJudge."
};

export default function ContactPage() {
  return (
    <section className="section-shell">
      <div className="page-container max-w-5xl space-y-8">
        <PageIntro
          eyebrow="Contact"
          title="Send feedback, support questions, or product ideas."
          description="Use this page if something feels unclear, broken, or ready for improvement."
        />
        <ContactForm />
      </div>
    </section>
  );
}
