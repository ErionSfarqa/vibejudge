import Link from "next/link";
import type { Route } from "next";

import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Home" },
  { href: "/judge", label: "Start Review" },
  { href: "/contact", label: "Contact" }
] satisfies Array<{ href: Route; label: string }>;

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-background/90 backdrop-blur-xl">
      <div className="page-container flex items-center justify-between gap-4 py-4">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-600 transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button asChild size="sm">
          <Link href="/judge">Start Review</Link>
        </Button>
      </div>
    </header>
  );
}

