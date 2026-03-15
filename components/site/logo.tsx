import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-surface text-sm font-semibold text-brand">
        <Image
          src="/logo.png"
          alt="VibeJudge logo"
          width={40}
          height={40}
          priority
          className="rounded-2xl"
        />
      </span>
      <span className="text-lg font-semibold tracking-tight text-foreground">VibeJudge</span>
    </Link>
  );
}
