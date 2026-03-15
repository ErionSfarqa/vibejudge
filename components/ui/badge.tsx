import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLDivElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-panel px-3 py-1 text-xs font-medium text-slate-700",
        className
      )}
      {...props}
    />
  );
}
