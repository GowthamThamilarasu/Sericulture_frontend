import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bell, Gauge, Info, SlidersHorizontal } from "lucide-react";

import { Accent } from "@/components/landing/flourish";
import { contactEmail, siteShell } from "@/components/landing/landing-page";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Log in | Paari Seritech",
  description: "Log in to the Paari Seritech control center.",
};

const highlights = [
  { text: "Live farm and shed readings in one place", icon: Gauge },
  { text: "Alerts when conditions drift out of range", icon: Bell },
  { text: "Control connected equipment remotely", icon: SlidersHorizontal },
];

export default function LoginPage() {
  return (
    <div className={`${siteShell} grid min-h-screen lg:grid-cols-[1.05fr_1fr]`}>
      <aside className="relative hidden overflow-hidden bg-[#0b100d] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: "url('/landing/rearing-shed.jpg')" }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(90%_70%_at_0%_0%,rgba(63,191,95,0.35),transparent_60%),linear-gradient(180deg,rgba(11,16,13,0.55),#0b100d)]" />

        <Link href="/" className="relative flex items-center gap-3">
          <Logo plate className="h-28" />
        </Link>

        <div className="relative">
          <h2 className="max-w-md font-display text-4xl font-bold leading-[1.1] tracking-[-0.015em] xl:text-[3.25rem]">
            Your farm. Your dashboard. <Accent tone="light">Your control.</Accent>
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map((item, index) => (
              <li key={item.text} className="login-point flex items-center gap-4 text-base text-white/85" style={{ "--i": index } as React.CSSProperties}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6fe07f] to-[#00a218] text-[#0b100d]">
                  <item.icon className="h-5 w-5" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative font-display text-base italic text-white/60">From Green Leaf to Golden Silk</div>
      </aside>

      <main className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-brand">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>

          <div className="mt-8 flex items-center gap-3 lg:hidden">
            <Logo className="h-24" />
          </div>

          <h1 className="mt-8 font-display text-4xl font-bold tracking-[-0.015em] text-ink sm:text-[2.75rem]">Welcome <Accent>back</Accent></h1>
          <p className="mt-3 text-base leading-7 text-ink-soft">Log in to open your control center.</p>

          <div className="mt-6 flex gap-3 rounded-2xl bg-brand-tint px-4 py-3 text-sm leading-6 text-ink">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <p>Demo preview: sign-in isn&apos;t connected to accounts yet, so any option below opens the demo dashboard.</p>
          </div>

          <div className="mt-6">
            <LoginForm />
          </div>

          <p className="mt-8 text-center text-sm text-ink-soft">
            Need an account?{" "}
            <a href={`mailto:${contactEmail}?subject=${encodeURIComponent("Account request")}`} className="font-semibold text-brand hover:text-brand-dark">
              Contact our team
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
