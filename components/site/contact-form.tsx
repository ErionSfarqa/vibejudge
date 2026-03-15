"use client";

import { FormEvent, useState } from "react";
import { Mail, MessageSquareText, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FormState = {
  name: string;
  email: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  message: ""
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send feedback right now.");
      }

      setStatus(payload.message ?? "Message sent.");
      setForm(initialState);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to send feedback right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="glass-panel p-6 sm:p-8">
        <p className="text-sm font-semibold text-brand">Why write in</p>
        <h2 className="mt-4 font-display text-3xl font-semibold text-foreground">
          Help improve the review experience.
        </h2>
        <div className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
          <div className="flex items-start gap-3">
            <User className="mt-1 h-4 w-4 text-brand" />
            <p>Report bugs, confusing flow, or places where the review quality should be sharper.</p>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-4 w-4 text-brand" />
            <p>Share support questions, partnership ideas, or rollout plans for the product.</p>
          </div>
          <div className="flex items-start gap-3">
            <MessageSquareText className="mt-1 h-4 w-4 text-brand" />
            <p>Suggest new review angles, clearer outputs, or ways to make the advice more useful.</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="glass-panel space-y-5 p-6 sm:p-8">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Name
          </label>
          <Input
            id="name"
            placeholder="Your name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-slate-700">
            Message
          </label>
          <Textarea
            id="message"
            placeholder="Tell us what feels off, what should improve, or what you want added."
            value={form.message}
            onChange={(event) =>
              setForm((current) => ({ ...current, message: event.target.value }))
            }
          />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {status ? <p className="text-sm text-brand">{status}</p> : null}
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Feedback"}
        </Button>
      </form>
    </div>
  );
}

