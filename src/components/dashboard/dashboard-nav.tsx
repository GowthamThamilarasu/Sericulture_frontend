"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, CircleDashed, Cpu, Gauge, LayoutGrid, Leaf, LogOut, MapPinned, Menu, MonitorCog, ShieldCheck, Sprout, UserRound, Waves, Wind, X, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const nav = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Farm Monitor", href: "/dashboard/farm", icon: Sprout },
  { label: "Shed Monitor", href: "/dashboard/shed", icon: Wind },
  { label: "Silkworm", href: "/dashboard/silkworm", icon: ShieldCheck },
  { label: "Mulberry", href: "/dashboard/mulberry", icon: Leaf },
  { label: "Irrigation", href: "/dashboard/irrigation", icon: Waves },
  { label: "Fertigation", href: "/dashboard/fertigation", icon: Gauge },
  { label: "Climate Control", href: "/dashboard/climate", icon: MonitorCog },
  { label: "Automation", href: "/dashboard/automation", icon: Zap },
  { label: "AI Insights", href: "/dashboard/ai", icon: Cpu },
  { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { label: "Cameras", href: "/dashboard/cameras", icon: MapPinned },
  { label: "Reports", href: "/dashboard/reports", icon: CircleDashed },
  { label: "Knowledge", href: "/dashboard/knowledge", icon: UserRound },
  { label: "Settings", href: "/dashboard/settings", icon: ChevronDown },
];

export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {nav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-[#3fbf5f] font-semibold text-[#0d140f]" : "text-[#c5cbc7] hover:bg-white/10 hover:text-white",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <div className="!mt-4 border-t border-white/10 pt-4">
        <Link
          href="/login"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#ff9c9c] transition-colors hover:bg-[#ef5a5a]/15 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </Link>
      </div>
    </nav>
  );
}

export function DashboardMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-full z-40 max-h-[75vh] overflow-y-auto border-t border-white/10 bg-[#171918] p-4 shadow-xl">
          <DashboardNav onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
