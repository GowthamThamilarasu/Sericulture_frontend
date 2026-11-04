import Link from "next/link";
import { LogOut } from "lucide-react";

import { DashboardLauncher, DashboardNav, SidebarBackdrop, Wordmark } from "@/components/dashboard/dashboard-nav";
import { AccentPicker, DashboardThemeRoot, ThemeToggle } from "@/components/dashboard/dashboard-theme";
import { NotificationBell, NotificationPopups } from "@/components/dashboard/notifications";
import { TankReminders } from "@/components/dashboard/fertigation-tanks";
import { MedicationReminders } from "@/components/dashboard/silkworm-health";
import { demoFarm } from "@/data/mock";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardThemeRoot>
      <div className="flex min-h-screen">
        <aside className="dash-side sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto overscroll-contain border-r p-5 lg:block">
          <SidebarBackdrop />
          <Link href="/" className="mb-8 block" aria-label="Paari Seritech home">
            <Wordmark className="w-full" />
            <div className="mt-2.5 text-center text-[10px] uppercase tracking-[0.25em] text-[color-mix(in_srgb,var(--d-accent-bright)_80%,transparent)]">Control Center</div>
          </Link>

          <DashboardNav />
        </aside>

        <div className="min-w-0 flex-1">
          {/* Farm and shed labels only show where there is room for them, so nothing overlaps at half-screen widths. */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-[var(--d-line)] bg-[var(--d-panel)] px-3 py-3 text-[var(--d-text)] sm:gap-3 sm:px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <DashboardLauncher />
              <Link href="/" aria-label="Paari Seritech home" className="w-24 shrink-0 sm:w-36 lg:hidden">
                <Wordmark className="w-full !rounded-lg !px-1.5 !py-1 !shadow-none" />
              </Link>
              <div className="hidden min-w-0 items-center gap-2 xl:flex">
                <span className="shrink-0 text-sm font-medium text-[var(--d-muted)]">Farm</span>
                <span className="min-w-0 truncate rounded-full bg-[var(--d-accent-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-accent)]" title={demoFarm.name}>
                  {demoFarm.name}
                </span>
                <span className="shrink-0 text-sm font-medium text-[var(--d-muted)]">Shed</span>
                <span className="shrink-0 rounded-full bg-[var(--d-chip)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-text)]">A1</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              <div className="hidden items-center gap-2 2xl:flex">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--d-accent)]" />
                <span className="text-sm text-[var(--d-soft)]">Connected</span>
              </div>
              <AccentPicker />
              <ThemeToggle />
              <NotificationBell />
              <div className="flex items-center gap-2 rounded-full bg-[var(--d-chip)] p-1 md:py-1.5 md:pl-2 md:pr-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full accent-fill text-xs font-bold">FM</div>
                <div className="hidden text-left md:block">
                  <div className="whitespace-nowrap text-sm font-medium text-[var(--d-text)]">Farm Manager</div>
                  <div className="whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-[var(--d-muted)]">Demo user</div>
                </div>
              </div>
              {/* On phones Log out lives in the menu, keeping the header to one row. */}
              <Link
                href="/login"
                aria-label="Log out"
                title="Log out"
                className="hidden h-10 items-center gap-2 rounded-lg bg-[var(--d-chip)] px-3 text-sm font-medium text-[var(--d-text)] transition-colors hover:bg-[var(--d-danger-soft)] hover:text-[var(--d-danger-text)] sm:flex"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Log out</span>
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
