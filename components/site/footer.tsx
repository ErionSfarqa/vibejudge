import Link from "next/link";

import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <div className="page-container flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-md">
          <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-foreground">
            {siteConfig.name}
          </Link>
          <p className="mt-4 text-sm leading-6 text-slate-600">{siteConfig.description}</p>
          <p className="mt-3 text-xs text-slate-500">
            Clear profile feedback, simple inputs, practical next steps.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

