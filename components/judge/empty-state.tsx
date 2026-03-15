import { judgeCopy } from "@/lib/site";

type JudgeEmptyStateProps = {
  step: number;
  uploadCount: number;
};

export function JudgeEmptyState({ step, uploadCount }: JudgeEmptyStateProps) {
  return (
    <div className="glass-panel flex h-full min-h-[32rem] flex-col justify-between p-6 sm:p-8">
      <div>
        <p className="text-sm font-semibold text-brand">Review preview</p>
        <h3 className="mt-4 font-display text-3xl font-semibold text-foreground">
          Your result page starts here.
        </h3>
        <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
          Finish the steps on the left and VibeJudge will return a clear breakdown of how the profile
          comes across and what to improve next on a separate, shareable result page.
        </p>
      </div>
      <div className="space-y-4">
        <div className="rounded-[1.75rem] border border-line bg-background p-5">
          <p className="text-sm font-medium text-foreground">Current progress</p>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>Step: {step} of 4</p>
            <p>Screenshots added: {uploadCount}</p>
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-line bg-background p-5">
          <p className="text-sm font-medium text-foreground">What the review includes</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            {judgeCopy.previewNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
