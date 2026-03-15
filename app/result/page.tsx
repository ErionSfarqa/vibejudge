import type { Metadata } from "next";

import { ResultPageClient } from "@/components/result/result-page-client";

export const metadata: Metadata = {
  title: "Result",
  description: "View your VibeJudge result in a dedicated, clean, and shareable layout."
};

export default function ResultPage() {
  return <ResultPageClient />;
}
