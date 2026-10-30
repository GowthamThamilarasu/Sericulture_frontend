import Link from "next/link";
import { LogOut } from "lucide-react";

import { DashboardMobileNav, DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardThemeRoot, ThemeToggle } from "@/components/dashboard/dashboard-theme";
import { NotificationBell, NotificationPopups } from "@/components/dashboard/notifications";
import { TankReminders } from "@/components/dashboard/fertigation-tanks";
import { MedicationReminders } from "@/components/dashboard/silkworm-health";
import { demoFarm } from "@/data/mock";

// Where each floating leaf starts, how big it is, how fast it rises and how far it drifts sideways.
const leaves = [
  { left: "12%", size: 14, dur: "18s", delay: "0s", sway: "30px" },
  { left: "38%", size: 10, dur: "22s", delay: "-6s", sway: "-20px" },
  { left: "62%", size: 16, dur: "20s", delay: "-12s", sway: "26px" },
  { left: "84%", size: 11, dur: "24s", delay: "-3s", sway: "-28px" },
  { left: "26%", size: 12, dur: "26s", delay: "-16s", sway: "18px" },
];

// Decorative motion behind the sidebar links (styles in globals.css, .side-*).
function SidebarBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <span className="side-orb -left-16 top-10 h-48 w-48 bg-[#00a218]" />
      <span className="side-orb -right-20 top-1/2 h-56 w-56 bg-[#3fbf5f]/70" style={{ animationDelay: "-7s" }} />
      <span className="side-orb bottom-0 left-4 h-40 w-40 bg-[#e3b23c]/40" style={{ animationDelay: "-3s" }} />
      {leaves.map((leaf) => (
        <svg
          key={leaf.left}
          viewBox="0 0 24 24"
          className="side-leaf"
          style={{ left: leaf.left, width: leaf.size, height: leaf.size, "--dur": leaf.dur, "--delay": leaf.delay, "--sway": leaf.sway } as React.CSSProperties}
        >
          <path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16Z" fill="currentColor" opacity="0.5" />
          <path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16Zm0 0 9-9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ))}
      <span className="side-edge" />
    </div>
  );
}

// The Paari Seritech wordmark. Its lettering is dark green, so it sits on a white plate over the dark sidebar.
function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex rounded-xl bg-white px-2.5 py-2 shadow-[0_10px_30px_-10px_rgb(63_191_95_/_0.7)] ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer */}
      <img src="/paari-seritech-wordmark.png" alt="Paari Seritech" width={1200} height={223} className="h-auto w-full" />
    </span>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardThemeRoot>
      <div className="flex min-h-screen">
        <aside className="dash-side sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto overscroll-contain border-r p-5 lg:block">
          <SidebarBackdrop />
          <Link href="/" className="mb-8 block" aria-label="Paari Seritech home">
            <Wordmark className="w-full" />
            <div className="mt-2.5 text-center text-[10px] uppercase tracking-[0.25em] text-[#6fe07f]/80">Control Center</div>
          </Link>

          <DashboardNav />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="relative flex items-center justify-between gap-3 border-b border-[var(--d-line)] bg-[var(--d-panel)] px-4 py-3 text-[var(--d-text)] md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <DashboardMobileNav />
              <Link href="/" aria-label="Paari Seritech home" className="w-28 shrink-0 sm:w-40 lg:hidden">
                <Wordmark className="w-full !rounded-lg !px-1.5 !py-1 !shadow-none" />
              </Link>
              <div className="hidden min-w-0 items-center gap-2 sm:flex">
                <span className="text-sm font-medium text-[var(--d-muted)]">Farm</span>
                <span className="truncate rounded-full bg-[var(--d-accent-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-accent)]">{demoFarm.name}</span>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-sm font-medium text-[var(--d-muted)]">Shed</span>
                <span className="rounded-full bg-[var(--d-chip)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-text)]">A1</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--d-accent)]" />
                <span className="text-sm text-[var(--d-soft)]">Connected</span>
              </div>
              <ThemeToggle />
              <NotificationBell />
              <div className="flex items-center gap-2 rounded-full bg-[var(--d-chip)] px-2 py-1.5 sm:pr-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full accent-fill text-xs font-bold">FM</div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-medium text-[var(--d-text)]">Farm Manager</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--d-muted)]">Demo user</div>
                </div>
              </div>
              <Link
                href="/login"
                aria-label="Log out"
                title="Log out"
                className="flex h-10 items-center gap-2 rounded-lg bg-[var(--d-chip)] px-3 text-sm font-medium text-[var(--d-text)] transition-colors hover:bg-[var(--d-danger-soft)] hover:text-[var(--d-danger-text)]"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Log out</span>
              </Link>
            </div>
          </header>

          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
      <NotificationPopups />
      <MedicationReminders />
      <TankReminders />
    </DashboardThemeRoot>
  );
}
