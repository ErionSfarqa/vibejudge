import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "min-h-[140px] w-full rounded-[1.5rem] border border-line bg-surface px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-brand/30 focus:ring-2 focus:ring-brand/10",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
