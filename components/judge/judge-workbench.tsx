"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertTriangle, ImagePlus, Trash2 } from "lucide-react";

import { JudgeEmptyState } from "@/components/judge/empty-state";
import { ResultSkeleton } from "@/components/judge/result-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { storeJudgeResult } from "@/lib/result-storage";
import { judgeCopy, judgeSteps } from "@/lib/site";
import type { JudgeResult } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

type JudgeResponse = {
  result?: JudgeResult;
  error?: string;
};

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
};

const maxUploads = 4;

export function JudgeWorkbench() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [context, setContext] = useState("");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadsRef = useRef<UploadItem[]>([]);

  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);

  useEffect(() => {
    return () => {
      uploadsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const basicsComplete = name.trim().length >= 2 && Number(age) >= 13 && gender.trim().length >= 2;
  const bioComplete = bio.trim().length >= 40;
  const uploadsComplete = uploads.length > 0;
  const canSubmit = basicsComplete && bioComplete && uploadsComplete;

  const reviewSummary = [
    { label: "Name", value: name || "Not added yet" },
    { label: "Age", value: age || "Not added yet" },
    { label: "Gender", value: gender || "Not added yet" },
    { label: "Bio length", value: bio ? `${bio.trim().length} characters` : "Not added yet" },
    { label: "Screenshots", value: uploads.length ? `${uploads.length} added` : "Not added yet" }
  ];

  function clearResultState() {
    setError(null);
  }

  function handleBack() {
    clearResultState();
    setStep((current) => Math.max(1, current - 1));
  }

  function handleNext() {
    clearResultState();

    if (step === 1 && !basicsComplete) {
      setError("Please complete your name, age, and gender.");
      return;
    }

    if (step === 2 && !bioComplete) {
      setError("Add a fuller bio so the review has something real to work with.");
      return;
    }

    if (step === 3 && !uploadsComplete) {
      setError("Upload at least one screenshot before continuing.");
      return;
    }

    setError(null);
    setStep((current) => Math.min(4, current + 1));
  }

  function handleUploadChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const remainingSlots = maxUploads - uploads.length;
    const nextFiles = files.slice(0, remainingSlots);

    for (const file of nextFiles) {
      if (!file.type.startsWith("image/")) {
        setError("Only image screenshots are supported.");
        return;
      }

      if (file.size > 4 * 1024 * 1024) {
        setError("Each screenshot must be 4 MB or smaller.");
        return;
      }
    }

    const nextUploads = nextFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setUploads((current) => [...current, ...nextUploads]);
    setError(files.length > remainingSlots ? `Only ${maxUploads} screenshots can be added.` : null);
    event.target.value = "";
  }

  function removeUpload(id: string) {
    setUploads((current) => {
      const match = current.find((item) => item.id === id);
      if (match) {
        URL.revokeObjectURL(match.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setError("Complete all four steps before starting the review.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("age", age);
      formData.append("gender", gender);
      formData.append("bio", bio);
      formData.append("context", context);

      uploads.forEach((item) => formData.append("screenshots", item.file, item.file.name));

      const response = await fetch("/api/judge", {
        method: "POST",
        body: formData
      });

      const data = (await response.json()) as JudgeResponse;

      if (!data.result) {
        throw new Error(data.error ?? "The review could not be completed.");
      }

      storeJudgeResult(data.result);
      router.push("/result");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "The review could not be completed."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <form onSubmit={handleSubmit} className="glass-panel space-y-6 p-6 sm:p-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-brand">Profile review</p>
          <div className="grid gap-3 sm:grid-cols-4">
            {judgeSteps.map((item) => (
              <div
                key={item.number}
                className={`rounded-3xl border px-4 py-3 text-sm ${
                  step === item.number
                    ? "border-brand/20 bg-brand-sky text-brand"
                    : "border-line bg-background text-slate-500"
                }`}
              >
                <p className="font-medium">Step {item.number}</p>
                <p className="mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-semibold text-foreground">Start with the basics</h2>
              <p className="text-sm leading-6 text-slate-600">{judgeCopy.basicsHelper}</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-700">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="age" className="text-sm font-medium text-slate-700">
                  Age
                </label>
                <Input
                  id="age"
                  type="number"
                  min={13}
                  max={99}
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  placeholder="24"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium text-slate-700">
                  Gender
                </label>
                <Select id="gender" value={gender} onChange={(event) => setGender(event.target.value)}>
                  <option value="">Select one</option>
                  <option value="Woman">Woman</option>
                  <option value="Man">Man</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </Select>
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-semibold text-foreground">Paste your bio</h2>
              <p className="text-sm leading-6 text-slate-600">
                The clearer the bio, the more helpful the review will be.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium text-slate-700">
                Bio
              </label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder={judgeCopy.bioPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="context" className="text-sm font-medium text-slate-700">
                Extra context (optional)
              </label>
              <Textarea
                id="context"
                value={context}
                onChange={(event) => setContext(event.target.value)}
                placeholder={judgeCopy.contextPlaceholder}
                className="min-h-[120px]"
              />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-semibold text-foreground">Upload screenshots</h2>
              <p className="text-sm leading-6 text-slate-600">{judgeCopy.uploadHelper}</p>
            </div>
            <label
              htmlFor="screenshots"
              className="flex cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-line bg-background px-6 py-10 text-center transition hover:border-brand/30"
            >
              <ImagePlus className="h-6 w-6 text-brand" />
              <p className="mt-4 text-sm font-medium text-foreground">Choose screenshots</p>
              <p className="mt-2 text-sm text-slate-500">PNG, JPG, WEBP. Up to 4 files.</p>
            </label>
            <Input
              id="screenshots"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUploadChange}
            />

            {uploads.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {uploads.map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] border border-line bg-background p-4">
                    <div className="relative h-40 overflow-hidden rounded-2xl">
                      <Image
                        src={item.previewUrl}
                        alt={item.file.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{item.file.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatBytes(item.file.size)} - {item.file.type}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUpload(item.id)}
                        className="rounded-full border border-line p-2 text-slate-500 transition hover:text-foreground"
                        aria-label={`Remove ${item.file.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-semibold text-foreground">Review your details</h2>
              <p className="text-sm leading-6 text-slate-600">
                If everything looks right, start the analysis and you will be redirected to the full result page.
              </p>
            </div>
            <div className="grid gap-3">
              {reviewSummary.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.5rem] border border-line bg-background px-4 py-4"
                >
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-700">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <p>{error}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {step > 1 ? (
            <Button type="button" variant="secondary" onClick={handleBack}>
              Back
            </Button>
          ) : null}
          {step < 4 ? (
            <Button type="button" onClick={handleNext}>
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting || !canSubmit}>
              {isSubmitting ? "Reviewing..." : "Analyze and View Result"}
            </Button>
          )}
        </div>
      </form>

      <div className="xl:sticky xl:top-24 xl:self-start">
        {isSubmitting ? <ResultSkeleton /> : <JudgeEmptyState step={step} uploadCount={uploads.length} />}
      </div>
    </div>
  );
}
