"use client";

import { type ChangeEvent, type ReactNode, startTransition, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Loader2,
  RefreshCcw,
  Sparkles,
  Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { storeJudgeResult } from "@/lib/result-storage";
import type { JudgeApiError, JudgeApiResponse } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
};

type QuestionStepId =
  | "name"
  | "age"
  | "gender"
  | "gymStatus"
  | "trainingFrequency"
  | "lifestyle"
  | "disciplineLevel"
  | "energyLevel"
  | "socialConfidence"
  | "socialPresence"
  | "currentGoal"
  | "biggestWeakness"
  | "perceivedByOthers"
  | "desiredPerception"
  | "styleImage"
  | "socialMediaActivity"
  | "habits"
  | "improvementFocus"
  | "context"
  | "screenshots";

type ScreenState = "questions" | "loading" | "error";
type MultiSelectFieldKey =
  | "lifestyle"
  | "currentGoal"
  | "biggestWeakness"
  | "desiredPerception"
  | "habits"
  | "improvementFocus";
type AutoAdvanceFieldKey =
  | "gender"
  | "gymStatus"
  | "trainingFrequency"
  | "disciplineLevel"
  | "energyLevel"
  | "socialPresence"
  | "perceivedByOthers"
  | "styleImage"
  | "socialMediaActivity";

type JudgeFormState = {
  name: string;
  age: string;
  gender: string;
  gymStatus: string;
  trainingFrequency: string;
  lifestyle: string[];
  disciplineLevel: string;
  energyLevel: string;
  socialConfidence: number;
  socialPresence: string;
  currentGoal: string[];
  biggestWeakness: string[];
  perceivedByOthers: string;
  desiredPerception: string[];
  styleImage: string;
  socialMediaActivity: string;
  habits: string[];
  improvementFocus: string[];
  context: string;
};

const maxUploads = 4;

const initialFormState: JudgeFormState = {
  name: "",
  age: "",
  gender: "",
  gymStatus: "",
  trainingFrequency: "",
  lifestyle: [],
  disciplineLevel: "",
  energyLevel: "",
  socialConfidence: 1,
  socialPresence: "",
  currentGoal: [],
  biggestWeakness: [],
  perceivedByOthers: "",
  desiredPerception: [],
  styleImage: "",
  socialMediaActivity: "",
  habits: [],
  improvementFocus: [],
  context: ""
};

const confidenceLabels = ["Low", "Medium", "High"] as const;

const genderOptions = ["Woman", "Man", "Non-binary", "Other", "Prefer not to say"];
const gymOptions = ["Yes", "No", "Sometimes"];
const trainingOptions = ["1-2 times/week", "3-4 times/week", "5+ times/week"];
const goalOptions = [
  "Look more attractive",
  "Build confidence",
  "Improve aura",
  "Get more attention",
  "Look more disciplined",
  "Improve social presence"
];
const lifestyleOptions = [
  "Disciplined",
  "Inconsistent",
  "Social",
  "Quiet",
  "Ambitious",
  "Still figuring things out"
];
const disciplineOptions = [
  "Very disciplined",
  "Pretty disciplined",
  "Up and down",
  "I struggle with consistency"
];
const energyOptions = ["Calm and grounded", "Steady", "High energy", "Low energy"];
const socialPresenceOptions = ["Low-key", "Balanced", "Active", "Very visible"];
const weaknessOptions = [
  "Inconsistency",
  "Overthinking",
  "Low confidence",
  "Weak photos",
  "Unclear vibe",
  "Trying too hard"
];
const perceivedByOthersOptions = ["Quiet", "Friendly", "Interesting", "Unclear", "Confident", "Hard to read"];
const desiredPerceptionOptions = [
  "Confident",
  "Attractive",
  "Disciplined",
  "Successful",
  "Charismatic",
  "Mysterious"
];
const styleImageOptions = [
  "Clean and simple",
  "Streetwear",
  "Classic",
  "Trendy",
  "Athletic",
  "Still figuring it out"
];
const socialMediaActivityOptions = ["Rarely post", "Sometimes post", "Post regularly", "Very active"];
const habitsOptions = ["Very consistent", "Mostly consistent", "On and off", "Currently rebuilding"];
const improvementOptions = [
  "Profile photos",
  "Confidence",
  "Consistency",
  "Lifestyle image",
  "How I come across",
  "Social presence"
];
const multiSelectSteps: MultiSelectFieldKey[] = [
  "lifestyle",
  "currentGoal",
  "biggestWeakness",
  "desiredPerception",
  "habits",
  "improvementFocus"
];
const loadingStages = [
  "Reading your answers",
  "Reviewing your profile cues",
  "Building your upgrade plan"
];

function getQuestionSteps(form: JudgeFormState): QuestionStepId[] {
  const steps: QuestionStepId[] = ["name", "age", "gender", "gymStatus"];

  if (form.gymStatus !== "No") {
    steps.push("trainingFrequency");
  }

  steps.push(
    "lifestyle",
    "disciplineLevel",
    "energyLevel",
    "socialConfidence",
    "socialPresence",
    "currentGoal",
    "biggestWeakness",
    "perceivedByOthers",
    "desiredPerception",
    "styleImage",
    "socialMediaActivity",
    "habits",
    "improvementFocus",
    "context",
    "screenshots"
  );

  return steps;
}

function getSocialConfidenceLabel(value: number) {
  return confidenceLabels[Math.max(0, Math.min(confidenceLabels.length - 1, value))];
}

function normalizeClientError(error?: JudgeApiError): JudgeApiError {
  if (error) {
    return error;
  }

  return {
    code: "AI_UPSTREAM_ERROR",
    userMessage: "The AI review could not be completed right now.",
    retryable: true
  };
}

export function JudgeWorkbench() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<QuestionStepId | "intro">("intro");
  const [screenState, setScreenState] = useState<ScreenState>("questions");
  const [form, setForm] = useState<JudgeFormState>(initialFormState);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<JudgeApiError | null>(null);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [showAdminHint, setShowAdminHint] = useState(false);
  const uploadsRef = useRef<UploadItem[]>([]);
  const autoAdvanceTimerRef = useRef<number | null>(null);

  const questionSteps = getQuestionSteps(form);
  const currentQuestionIndex =
    activeStep === "intro" ? 0 : Math.max(questionSteps.indexOf(activeStep) + 1, 1);
  const progress =
    screenState === "loading"
      ? 100
      : activeStep === "intro"
        ? 0
        : (currentQuestionIndex / questionSteps.length) * 100;
  const isQuestionStep = activeStep !== "intro";
  const isMultiSelectStep = isQuestionStep && multiSelectSteps.includes(activeStep as MultiSelectFieldKey);
  const requiresManualAdvance =
    screenState === "error" ||
    screenState === "loading" ||
    activeStep === "intro" ||
    activeStep === "name" ||
    activeStep === "age" ||
    isMultiSelectStep ||
    activeStep === "socialConfidence" ||
    activeStep === "context" ||
    activeStep === "screenshots";

  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);

  useEffect(() => {
    return () => {
      uploadsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      if (autoAdvanceTimerRef.current) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (form.gymStatus === "No" && form.trainingFrequency) {
      setForm((current) => ({ ...current, trainingFrequency: "" }));
    }
  }, [form.gymStatus, form.trainingFrequency]);

  useEffect(() => {
    if (screenState !== "loading") {
      setLoadingStageIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setLoadingStageIndex((current) => (current + 1) % loadingStages.length);
    }, 1600);

    return () => window.clearInterval(intervalId);
  }, [screenState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hostname = window.location.hostname;
    setShowAdminHint(hostname === "localhost" || hostname === "127.0.0.1");
  }, []);

  function updateField<K extends keyof JudgeFormState>(key: K, value: JudgeFormState[K]) {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    setForm((current) => ({ ...current, [key]: value }));
    setStepError(null);
    setSubmitError(null);

    if (screenState !== "questions") {
      setScreenState("questions");
    }
  }

  function getStepErrorMessage(step: QuestionStepId | "intro", nextForm = form) {
    switch (step) {
      case "intro":
        return null;
      case "name":
        return nextForm.name.trim().length >= 2 ? null : "Add the name you want the review to use.";
      case "age": {
        const age = Number(nextForm.age);
        return Number.isInteger(age) && age >= 13 && age <= 99
          ? null
          : "Enter an age between 13 and 99.";
      }
      case "gender":
        return nextForm.gender ? null : "Choose the gender context you want reflected in the review.";
      case "gymStatus":
        return nextForm.gymStatus ? null : "Pick the option that best matches your routine right now.";
      case "trainingFrequency":
        return nextForm.trainingFrequency
          ? null
          : "Select how often you train so the review can weigh that signal correctly.";
      case "currentGoal":
        return nextForm.currentGoal.length ? null : "Pick at least one goal that matters right now.";
      case "lifestyle":
        return nextForm.lifestyle.length ? null : "Pick at least one lifestyle label that fits.";
      case "disciplineLevel":
        return nextForm.disciplineLevel ? null : "Choose the discipline level that feels most honest.";
      case "energyLevel":
        return nextForm.energyLevel ? null : "Choose the energy level that fits how you come across.";
      case "improvementFocus":
        return nextForm.improvementFocus.length ? null : "Pick at least one area you want VibeJudge to focus on.";
      case "socialConfidence":
        return null;
      case "socialPresence":
        return nextForm.socialPresence ? null : "Pick how visible you are socially right now.";
      case "biggestWeakness":
        return nextForm.biggestWeakness.length ? null : "Pick at least one thing that holds your vibe back.";
      case "perceivedByOthers":
        return nextForm.perceivedByOthers ? null : "Choose how you think other people usually read you.";
      case "desiredPerception":
        return nextForm.desiredPerception.length ? null : "Pick at least one impression you want to create.";
      case "styleImage":
        return nextForm.styleImage ? null : "Choose the style or image direction that fits best.";
      case "socialMediaActivity":
        return nextForm.socialMediaActivity ? null : "Choose how active you are on social media.";
      case "habits":
        return nextForm.habits.length ? null : "Pick at least one habit pattern that feels accurate.";
      case "context":
        return null;
      case "screenshots":
        return uploads.length > 0 ? null : "Upload at least one screenshot before starting the review.";
      default:
        return null;
    }
  }

  function getNextQuestionStep(step: QuestionStepId, nextForm = form) {
    const steps = getQuestionSteps(nextForm);
    const currentIndex = steps.indexOf(step);

    return currentIndex >= 0 ? steps[currentIndex + 1] ?? null : null;
  }

  function handleSingleChoiceSelect<K extends AutoAdvanceFieldKey>(key: K, value: JudgeFormState[K]) {
    if (screenState !== "questions" || !isQuestionStep || activeStep !== key) {
      updateField(key, value);
      return;
    }

    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
    }

    const nextForm = { ...form, [key]: value };

    setForm(nextForm);
    setStepError(null);
    setSubmitError(null);

    const nextStep = getNextQuestionStep(key, nextForm);

    if (!nextStep) {
      autoAdvanceTimerRef.current = null;
      return;
    }

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      setActiveStep(nextStep);
      autoAdvanceTimerRef.current = null;
    }, 150);
  }

  function toggleMultiSelectField(key: MultiSelectFieldKey, value: string) {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    setForm((current) => {
      const selected = current[key];
      const nextValues = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];

      return { ...current, [key]: nextValues };
    });
    setStepError(null);
    setSubmitError(null);

    if (screenState !== "questions") {
      setScreenState("questions");
    }
  }

  function handleBack() {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    setStepError(null);
    setSubmitError(null);

    if (screenState === "error") {
      setScreenState("questions");
      setActiveStep("screenshots");
      return;
    }

    if (screenState === "loading" || activeStep === "intro") {
      return;
    }

    const currentIndex = questionSteps.indexOf(activeStep);

    if (currentIndex <= 0) {
      setActiveStep("intro");
      return;
    }

    setActiveStep(questionSteps[currentIndex - 1]);
  }

  function handleNext() {
    if (screenState !== "questions") {
      return;
    }

    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    if (activeStep === "intro") {
      setActiveStep(questionSteps[0]);
      return;
    }

    const validationMessage = getStepErrorMessage(activeStep);

    if (validationMessage) {
      setStepError(validationMessage);
      return;
    }

    const currentIndex = questionSteps.indexOf(activeStep);
    const nextStep = questionSteps[currentIndex + 1];

    setStepError(null);

    if (nextStep) {
      setActiveStep(nextStep);
    }
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
        setStepError("Only image screenshots are supported.");
        return;
      }

      if (file.size > 4 * 1024 * 1024) {
        setStepError("Each screenshot must be 4 MB or smaller.");
        return;
      }
    }

    const nextUploads = nextFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setUploads((current) => [...current, ...nextUploads]);
    setStepError(files.length > remainingSlots ? `Only ${maxUploads} screenshots can be added.` : null);
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

    setStepError(null);
  }

  async function submitReview() {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    const validationMessage = getStepErrorMessage("screenshots");

    if (validationMessage) {
      setStepError(validationMessage);
      setActiveStep("screenshots");
      setScreenState("questions");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setStepError(null);
    setScreenState("loading");

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("age", form.age.trim());
      formData.append("gender", form.gender);
      formData.append("gymStatus", form.gymStatus);

      if (form.trainingFrequency) {
        formData.append("trainingFrequency", form.trainingFrequency);
      }

      form.lifestyle.forEach((value) => formData.append("lifestyle", value));
      formData.append("disciplineLevel", form.disciplineLevel);
      formData.append("energyLevel", form.energyLevel);
      formData.append("socialConfidence", getSocialConfidenceLabel(form.socialConfidence));
      formData.append("socialPresence", form.socialPresence);
      form.currentGoal.forEach((value) => formData.append("currentGoal", value));
      form.biggestWeakness.forEach((value) => formData.append("biggestWeakness", value));
      formData.append("perceivedByOthers", form.perceivedByOthers);
      form.desiredPerception.forEach((value) => formData.append("desiredPerception", value));
      formData.append("styleImage", form.styleImage);
      formData.append("socialMediaActivity", form.socialMediaActivity);
      form.habits.forEach((value) => formData.append("habits", value));
      form.improvementFocus.forEach((value) => formData.append("improvementFocus", value));
      formData.append("context", form.context.trim());

      uploads.forEach((item) => formData.append("screenshots", item.file, item.file.name));

      const response = await fetch("/api/judge", {
        method: "POST",
        body: formData
      });

      const data = (await response.json()) as JudgeApiResponse;

      if (!response.ok || !data.result) {
        setSubmitError(normalizeClientError(data.error));
        setScreenState("error");
        return;
      }

      storeJudgeResult(data.result);
      startTransition(() => router.push("/result"));
    } catch (error) {
      setSubmitError(
        normalizeClientError({
          code: "AI_UPSTREAM_ERROR",
          userMessage: "The AI review could not be completed right now. Please try again.",
          adminMessage: error instanceof Error ? error.message : "Network request failed.",
          retryable: true
        })
      );
      setScreenState("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePrimaryAction() {
    if (screenState === "error") {
      void submitReview();
      return;
    }

    if (activeStep === "screenshots") {
      void submitReview();
      return;
    }

    handleNext();
  }

  function formatSelectionSummary(values: string[], fallback: string) {
    return values.length ? values.slice(0, 2).join(" + ") : fallback;
  }

  function renderQuestionScreen() {
    if (activeStep === "intro") {
      return (
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-brand shadow-sm">
            <Sparkles className="h-4 w-4" />
            VibeJudge guided review
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-foreground sm:mt-8 sm:text-6xl">
            We&apos;ll map your vibe before we judge your profile.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-base leading-7 text-slate-600 sm:mt-6 sm:text-xl sm:leading-8">
            Answer a few quick questions about your lifestyle, confidence, and the image you want to
            give off. Then VibeJudge will break down how you come across and what to improve next.
          </p>
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 text-left sm:mt-10 sm:grid-cols-3 sm:gap-4">
            <IntroCard
              title="Personal read"
              description="Your answers make the analysis feel like feedback on you, not on a blank form."
            />
            <IntroCard
              title="Sharper results"
              description="Your answers, confidence goals, and screenshots get combined into one stronger review."
            />
            <IntroCard
              title="Quick flow"
              description="It takes about two minutes, and more detail usually means a better result."
            />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-500 sm:mt-10 sm:gap-3 sm:text-sm">
            <span className="rounded-full border border-white/60 bg-white/70 px-4 py-2">One question at a time</span>
            <span className="rounded-full border border-white/60 bg-white/70 px-4 py-2">Dedicated result page</span>
            <span className="rounded-full border border-white/60 bg-white/70 px-4 py-2">More detail = better analysis</span>
          </div>
        </div>
      );
    }

    switch (activeStep) {
      case "name":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="What&apos;s your name?"
            description="This keeps the review personal and helps the result read like direct feedback."
          >
            <Input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Your name"
              className="mx-auto h-14 max-w-md rounded-[1.75rem] border-white/60 bg-white/80 text-center text-xl font-semibold shadow-sm sm:h-16 sm:text-2xl"
            />
          </QuestionBlock>
        );
      case "age":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="How old are you?"
            description="Age gives the review a little social context. Keep it simple."
          >
            <Input
              type="number"
              min={13}
              max={99}
              value={form.age}
              onChange={(event) => updateField("age", event.target.value)}
              placeholder="24"
              className="mx-auto h-14 max-w-xs rounded-[1.75rem] border-white/60 bg-white/80 text-center text-xl font-semibold shadow-sm sm:h-16 sm:text-2xl"
            />
          </QuestionBlock>
        );
      case "gender":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="What&apos;s your gender?"
            description="Use the option that feels closest to how you want the review to frame your presentation."
          >
            <ChoiceGrid
              options={genderOptions}
              value={form.gender}
              onSelect={(value) => handleSingleChoiceSelect("gender", value)}
            />
          </QuestionBlock>
        );
      case "gymStatus":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="Do you go to the gym?"
            description="Routine and discipline can change how a profile feels, so this helps with the overall read."
          >
            <ChoiceGrid
              options={gymOptions}
              value={form.gymStatus}
              onSelect={(value) => handleSingleChoiceSelect("gymStatus", value)}
              columns={3}
            />
          </QuestionBlock>
        );
      case "trainingFrequency":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="How often do you train?"
            description="Only answer this if training is part of your routine right now."
          >
            <ChoiceGrid
              options={trainingOptions}
              value={form.trainingFrequency}
              onSelect={(value) => handleSingleChoiceSelect("trainingFrequency", value)}
            />
          </QuestionBlock>
        );
      case "lifestyle":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="How would you describe your lifestyle?"
            description="Pick every label that feels honest right now."
          >
            <ChoiceGrid
              options={lifestyleOptions}
              values={form.lifestyle}
              mode="multiple"
              onToggle={(value) => toggleMultiSelectField("lifestyle", value)}
            />
          </QuestionBlock>
        );
      case "disciplineLevel":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="How disciplined do you feel day to day?"
            description="Pick the option that matches your real habits, not your ideal version."
          >
            <ChoiceGrid
              options={disciplineOptions}
              value={form.disciplineLevel}
              onSelect={(value) => handleSingleChoiceSelect("disciplineLevel", value)}
            />
          </QuestionBlock>
        );
      case "energyLevel":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="What kind of energy do you give off?"
            description="Think about the vibe your presence carries most of the time."
          >
            <ChoiceGrid
              options={energyOptions}
              value={form.energyLevel}
              onSelect={(value) => handleSingleChoiceSelect("energyLevel", value)}
            />
          </QuestionBlock>
        );
      case "socialConfidence":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="How confident do you feel socially?"
            description="Be honest. The review should reflect where you are now, not where you wish you were."
          >
            <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-sm sm:p-8">
              <p className="text-center text-3xl font-semibold text-foreground">
                {getSocialConfidenceLabel(form.socialConfidence)}
              </p>
              <input
                type="range"
                min={0}
                max={2}
                step={1}
                value={form.socialConfidence}
                onChange={(event) => updateField("socialConfidence", Number(event.target.value))}
                className="mt-8 h-2 w-full cursor-pointer appearance-none rounded-full bg-brand/15 accent-brand"
              />
              <div className="mt-4 grid grid-cols-3 text-sm text-slate-500">
                {confidenceLabels.map((label, index) => (
                  <span
                    key={label}
                    className={cn(
                      "text-center transition",
                      form.socialConfidence === index ? "font-semibold text-foreground" : ""
                    )}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </QuestionBlock>
        );
      case "socialPresence":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="How strong is your social presence right now?"
            description="Think about how visible, noticed, or memorable you feel in social settings and online."
          >
            <ChoiceGrid
              options={socialPresenceOptions}
              value={form.socialPresence}
              onSelect={(value) => handleSingleChoiceSelect("socialPresence", value)}
            />
          </QuestionBlock>
        );
      case "currentGoal":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="What&apos;s your current goal?"
            description="Pick every result you care about right now. VibeJudge will prioritize advice around those themes."
          >
            <ChoiceGrid
              options={goalOptions}
              values={form.currentGoal}
              mode="multiple"
              onToggle={(value) => toggleMultiSelectField("currentGoal", value)}
            />
          </QuestionBlock>
        );
      case "biggestWeakness":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="What holds you back most right now?"
            description="Pick every weakness that regularly lowers your impact."
          >
            <ChoiceGrid
              options={weaknessOptions}
              values={form.biggestWeakness}
              mode="multiple"
              onToggle={(value) => toggleMultiSelectField("biggestWeakness", value)}
            />
          </QuestionBlock>
        );
      case "perceivedByOthers":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="How do you think people usually see you?"
            description="Choose the read you think you are giving off now."
          >
            <ChoiceGrid
              options={perceivedByOthersOptions}
              value={form.perceivedByOthers}
              onSelect={(value) => handleSingleChoiceSelect("perceivedByOthers", value)}
            />
          </QuestionBlock>
        );
      case "desiredPerception":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="How do you want to be seen instead?"
            description="Pick every impression you want people to feel from you."
          >
            <ChoiceGrid
              options={desiredPerceptionOptions}
              values={form.desiredPerception}
              mode="multiple"
              onToggle={(value) => toggleMultiSelectField("desiredPerception", value)}
            />
          </QuestionBlock>
        );
      case "styleImage":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="What best describes your style or image right now?"
            description="Choose the image direction that feels closest to the real version of you."
          >
            <ChoiceGrid
              options={styleImageOptions}
              value={form.styleImage}
              onSelect={(value) => handleSingleChoiceSelect("styleImage", value)}
            />
          </QuestionBlock>
        );
      case "socialMediaActivity":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="How active are you on social media?"
            description="This helps the AI judge whether the problem is visibility, quality, or consistency."
          >
            <ChoiceGrid
              options={socialMediaActivityOptions}
              value={form.socialMediaActivity}
              onSelect={(value) => handleSingleChoiceSelect("socialMediaActivity", value)}
            />
          </QuestionBlock>
        );
      case "habits":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="How consistent are your habits lately?"
            description="Think about your routines, follow-through, and how steady you have been recently. Pick all that fit."
          >
            <ChoiceGrid
              options={habitsOptions}
              values={form.habits}
              mode="multiple"
              onToggle={(value) => toggleMultiSelectField("habits", value)}
            />
          </QuestionBlock>
        );
      case "improvementFocus":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="What do you want VibeJudge to improve most?"
            description="Pick every area you want the AI to focus on instead of giving you generic advice."
          >
            <ChoiceGrid
              options={improvementOptions}
              values={form.improvementFocus}
              mode="multiple"
              onToggle={(value) => toggleMultiSelectField("improvementFocus", value)}
            />
          </QuestionBlock>
        );
      case "context":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="Anything else you want the review to know?"
            description="Optional. Add extra detail if there is something the questions did not capture."
          >
            <Textarea
              value={form.context}
              onChange={(event) => updateField("context", event.target.value)}
              placeholder="Optional: people see me as quieter than I actually am, and I want the profile to feel more confident and put together."
              className="mx-auto min-h-[150px] max-w-3xl rounded-[2rem] border border-brand/20 bg-white/80 p-5 text-sm leading-7 shadow-[0_0_0_1px_rgba(31,60,136,0.05),0_0_30px_rgba(115,132,186,0.16)] transition focus-visible:border-brand/35 focus-visible:ring-brand/20 sm:min-h-[200px] sm:p-6 sm:text-base sm:leading-8"
            />
          </QuestionBlock>
        );
      case "screenshots":
        return (
          <QuestionBlock
            eyebrow="Question"
            title="Upload your social screenshots"
            description="Profile pages, highlights, stories, and post grids all help. Keep it to the most relevant screenshots."
          >
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
              <SummaryChip label={formatSelectionSummary(form.currentGoal, "Goals")} />
              <SummaryChip label={formatSelectionSummary(form.desiredPerception, "Desired impression")} />
              <SummaryChip label={form.styleImage || "Style"} />
              <SummaryChip label={getSocialConfidenceLabel(form.socialConfidence)} />
            </div>
            <label
              htmlFor="screenshots"
              className="mx-auto mt-6 flex max-w-3xl cursor-pointer flex-col items-center justify-center rounded-[2rem] border border-dashed border-brand/25 bg-white/75 px-5 py-8 text-center shadow-sm transition hover:border-brand/45 hover:bg-white/90 sm:mt-8 sm:px-6 sm:py-10"
            >
              <ImagePlus className="h-7 w-7 text-brand" />
              <p className="mt-4 text-base font-semibold text-foreground">Choose screenshots</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                PNG, JPG, or WEBP. Upload up to 4 files and keep them focused on the profile you want judged.
              </p>
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
              <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:gap-4">
                {uploads.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.5rem] border border-white/60 bg-white/80 p-3 shadow-sm sm:rounded-[1.75rem] sm:p-4"
                  >
                    <div className="relative h-36 overflow-hidden rounded-[1.5rem] sm:h-48">
                      <Image
                        src={item.previewUrl}
                        alt={item.file.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0 text-left">
                        <p className="truncate text-xs font-semibold text-foreground sm:text-sm">{item.file.name}</p>
                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                          {formatBytes(item.file.size)} - {item.file.type}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUpload(item.id)}
                        className="rounded-full border border-line bg-white p-2 text-slate-500 transition hover:text-foreground"
                        aria-label={`Remove ${item.file.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </QuestionBlock>
        );
      default:
        return null;
    }
  }

  return (
    <div className="relative min-h-[100svh] overflow-hidden rounded-none border-y-0 border-white/60 bg-[rgba(255,255,255,0.72)] shadow-glow backdrop-blur-xl sm:min-h-[72svh] sm:rounded-[2.5rem] sm:border">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-[-8%] top-[-12%] h-72 w-72 rounded-full bg-brand/12 blur-3xl"
          animate={{ x: [0, 34, -18, 0], y: [0, -20, 14, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[-10%] top-[12%] h-80 w-80 rounded-full bg-brand-rose/30 blur-3xl"
          animate={{ x: [0, -28, 18, 0], y: [0, 16, -18, 0], scale: [1, 0.94, 1.1, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-16%] left-[12%] h-72 w-72 rounded-full bg-brand-sky/80 blur-3xl"
          animate={{ x: [0, 18, -26, 0], y: [0, -12, 22, 0], scale: [1, 1.06, 0.92, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_52%)]" />
      </div>

      <div className="relative flex min-h-[100svh] flex-col p-4 pb-4 sm:min-h-[72svh] sm:p-7 lg:p-9">
        <div className="shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">
              VibeJudge onboarding
            </p>
            <p className="mt-2 text-sm text-slate-500">Quick questions. Better answers. Sharper result.</p>
          </div>
          <div className="w-full max-w-sm">
            <div className="h-2 overflow-hidden rounded-full bg-white/75">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#1f3c88,#7384ba)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center py-4 sm:py-10">
          <AnimatePresence mode="wait">
            {screenState === "loading" ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="mx-auto w-full max-w-3xl text-center"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-brand/15 bg-brand-sky shadow-sm">
                  <Loader2 className="h-9 w-9 animate-spin text-brand" />
                </div>
                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-brand/75">
                  Building your review
                </p>
                <h2 className="mt-4 font-display text-3xl font-semibold text-foreground sm:text-5xl">
                  {loadingStages[loadingStageIndex]}
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  VibeJudge is combining your answers, context, and screenshots into one clean profile read.
                </p>
                <div className="mx-auto mt-10 grid max-w-2xl gap-3 text-left">
                  {loadingStages.map((stage, index) => (
                    <div
                      key={stage}
                      className={cn(
                        "flex items-center gap-3 rounded-[1.5rem] border px-4 py-4 transition",
                        index <= loadingStageIndex
                          ? "border-brand/15 bg-white/85 text-foreground"
                          : "border-white/60 bg-white/55 text-slate-500"
                      )}
                    >
                      {index < loadingStageIndex ? (
                        <Check className="h-5 w-5 text-brand" />
                      ) : (
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full border",
                            index === loadingStageIndex
                              ? "border-brand bg-brand/10"
                              : "border-slate-300 bg-transparent"
                          )}
                        />
                      )}
                      <span className="text-sm font-medium">{stage}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : screenState === "error" ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="mx-auto w-full max-w-2xl text-center"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-500 shadow-sm">
                  <AlertTriangle className="h-9 w-9" />
                </div>
                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-brand/75">
                  Review unavailable
                </p>
                <h2 className="mt-4 font-display text-3xl font-semibold text-foreground sm:text-5xl">
                  {submitError?.userMessage ?? "The review could not be completed."}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  Your answers are still here. You can try the review again or go back and adjust anything first.
                </p>
                {showAdminHint && submitError?.adminMessage ? (
                  <div className="mx-auto mt-8 rounded-[1.75rem] border border-amber-200 bg-amber-50/90 p-5 text-left text-sm leading-7 text-amber-900">
                    <p className="font-semibold">Admin note</p>
                    <p className="mt-2">{submitError.adminMessage}</p>
                  </div>
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="w-full"
              >
                {renderQuestionScreen()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {screenState === "questions" && stepError ? (
          <div className="mx-auto mb-5 w-full max-w-2xl rounded-[1.5rem] border border-rose-200 bg-rose-50/95 px-5 py-4 text-sm text-rose-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <p>{stepError}</p>
            </div>
          </div>
        ) : null}

        <div className="shrink-0 grid gap-3 sm:flex sm:items-center sm:justify-between">
          <div className="order-2 flex justify-end sm:order-1 sm:justify-start">
            {activeStep !== "intro" || screenState === "error" ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                disabled={isSubmitting}
                className="min-w-[108px] justify-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {screenState === "error" ? "Go Back" : "Back"}
              </Button>
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>
          <div className="order-1 flex items-center justify-center sm:order-2 sm:justify-end">
            {screenState === "error" ? (
              <Button
                type="button"
                onClick={handlePrimaryAction}
                disabled={isSubmitting}
                className="w-full justify-center sm:w-auto"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            ) : screenState === "questions" && requiresManualAdvance ? (
              <Button
                type="button"
                onClick={handlePrimaryAction}
                disabled={isSubmitting}
                className="w-full justify-center sm:w-auto"
              >
                {activeStep === "intro"
                  ? "Start"
                  : activeStep === "screenshots"
                    ? "Analyze My Vibe"
                    : activeStep === "context"
                      ? form.context.trim()
                        ? "Continue"
                        : "Skip"
                      : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function IntroCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[1.75rem] border border-white/60 bg-white/75 p-4 shadow-sm sm:p-5">
      <p className="text-sm font-semibold text-brand">{title}</p>
      <p className="mt-2.5 text-sm leading-6 text-slate-600 sm:mt-3 sm:leading-7">{description}</p>
    </div>
  );
}

function QuestionBlock({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand/75">{eyebrow}</p>
      <h2 className="mt-3 font-display text-[2rem] font-semibold tracking-tight text-foreground sm:mt-4 sm:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-balance text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
        {description}
      </p>
      <div className="mt-7 sm:mt-10">{children}</div>
    </div>
  );
}

function ChoiceGrid({
  options,
  value,
  values,
  onSelect,
  onToggle,
  mode = "single",
  columns = 2
}: {
  options: string[];
  value?: string;
  values?: string[];
  onSelect?: (value: string) => void;
  onToggle?: (value: string) => void;
  mode?: "single" | "multiple";
  columns?: 2 | 3;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      {mode === "multiple" ? (
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Pick all that apply
        </p>
      ) : null}
      <div
        className={cn(
          "grid gap-3",
          columns === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2"
        )}
      >
      {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => (mode === "multiple" ? onToggle?.(option) : onSelect?.(option))}
            className={cn(
              "rounded-[1.5rem] border px-4 py-3 text-center text-sm font-medium transition sm:px-5 sm:py-4 sm:text-base",
              mode === "multiple" ? "relative" : "",
              (mode === "multiple" ? values?.includes(option) : value === option)
                ? "border-brand/30 bg-brand-sky text-brand shadow-sm"
                : "border-white/60 bg-white/75 text-foreground hover:border-brand/20 hover:bg-white/90"
            )}
          >
            {mode === "multiple" && values?.includes(option) ? (
              <Check className="absolute right-3 top-3 h-4 w-4 text-brand" />
            ) : null}
            <span className="block text-balance">{option}</span>
          </button>
      ))}
      </div>
    </div>
  );
}

function SummaryChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/60 bg-white/75 px-4 py-2 font-medium">
      {label}
    </span>
  );
}
