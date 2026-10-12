import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

import { FloatingLogin } from "@/components/floating-login";
import { MothFollower } from "@/components/moth-follower";
import { SpotEffects } from "@/components/spot-effects";

// Fraunces (expressive serif with soft, calligraphic italics) for headings; Manrope for body text.
const display = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], axes: ["SOFT", "WONK", "opsz"], variable: "--font-display" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Paari Seritech | From Green to Gold",
  description:
    "Intelligent Sericulture. Connected Farming. Better Possibilities. An integrated automation platform for mulberry cultivation and silkworm rearing.",
  openGraph: {
    title: "Paari Seritech | From Green to Gold",
    description:
      "Intelligent Sericulture. Connected Farming. Better Possibilities. An integrated automation platform for mulberry cultivation and silkworm rearing.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-slate-900">
        {children}
        <FloatingLogin />
        <MothFollower />
        <SpotEffects />
      </body>
    </html>
  );
}
