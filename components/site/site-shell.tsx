"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isJudgeFlow = pathname === "/judge";

  return (
    <div className="relative isolate overflow-x-clip">
      {isJudgeFlow ? null : <Navbar />}
      <main>{children}</main>
      {isJudgeFlow ? null : <Footer />}
    </div>
  );
}
