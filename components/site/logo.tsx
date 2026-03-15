import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" aria-label="VibeJudge">
      <Image
        src="/logo.png"
        alt="VibeJudge logo"
        width={44}
        height={44}
        priority
        className={cn("h-11 w-auto", className)}
      />
    </Link>
  );
}
