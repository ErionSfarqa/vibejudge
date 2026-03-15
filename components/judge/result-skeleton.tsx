export function ResultSkeleton() {
  return (
    <div className="glass-panel min-h-[32rem] overflow-hidden p-6 sm:p-8">
      <div className="h-5 w-28 rounded-full bg-slate-200" />
      <div className="mt-4 h-10 w-3/4 rounded-2xl bg-slate-200" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-line bg-background p-4">
            <div className="h-4 w-20 rounded-full bg-slate-200" />
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent)] bg-[length:200%_100%]" />
            </div>
            <div className="mt-4 h-8 w-14 rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="mt-8 space-y-4">
        <div className="h-16 rounded-3xl bg-slate-200" />
        <div className="h-20 rounded-3xl bg-slate-200" />
        <div className="h-24 rounded-3xl bg-slate-200" />
      </div>
    </div>
  );
}

