import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { SiteShell } from "@/components/site/site-shell";
import { siteConfig } from "@/lib/site";

import "./globals.css";

const GOOGLE_SITE_VERIFICATION = "REPLACE_WITH_CODE";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Social Profile Reviews`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png"
  },
  applicationName: siteConfig.name,
  keywords: [
    "social profile review",
    "bio review",
    "profile feedback",
    "instagram profile review",
    "social presence analysis"
  ],
  openGraph: {
    title: `${siteConfig.name} | Social Profile Reviews`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Social Profile Reviews`,
    description: siteConfig.description
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8207317379058620"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${manrope.variable} ${fraunces.variable}`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
