import Link from "next/link";
import { Bell, LogOut } from "lucide-react";

import { DashboardMobileNav, DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Logo } from "@/components/logo";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dash-dark min-h-screen">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#171918] p-5 text-[#c5cbc7] lg:block">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <Logo plate className="h-20" />
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#8d948f]">Control Center</div>
          </Link>

          <DashboardNav />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="relative flex items-center justify-between gap-3 border-b border-white/10 bg-[#1e201f] px-4 py-3 text-white md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <DashboardMobileNav />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#9aa09c]">Farm</span>
                <span className="rounded-full bg-[#3fbf5f]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#3fbf5f]">Kallakurichi</span>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-sm font-medium text-[#9aa09c]">Shed</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">A1</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3fbf5f]" />
                <span className="text-sm text-[#c5cbc7]">Connected</span>
              </div>
              <Link href="/dashboard/alerts" aria-label="Alerts" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20">
                <Bell className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-2 py-1.5 sm:pr-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3fbf5f] text-xs font-bold text-[#0d140f]">FM</div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-medium text-white">Farm Manager</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#8d948f]">Demo user</div>
                </div>
              </div>
              <Link
                href="/login"
                aria-label="Log out"
                title="Log out"
                className="flex h-10 items-center gap-2 rounded-lg bg-white/10 px-3 text-sm font-medium text-white transition-colors hover:bg-[#ef5a5a]/25 hover:text-[#ffb3b3]"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Log out</span>
              </Link>
            </div>
          </header>

          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
