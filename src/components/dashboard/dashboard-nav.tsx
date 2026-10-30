"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, CircleDashed, Cpu, Gauge, LayoutGrid, Leaf, LogOut, MapPinned, Menu, MonitorCog, Settings, ShieldCheck, ShieldUser, Sprout, Waves, Wind, X, Zap } from "lucide-react";

import { canUse, dashboardFeatures, useFarmUsers } from "@/components/dashboard/farm-users";

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
  { label: "Knowledge", href: "/dashboard/knowledge", icon: BookOpen },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Admin", href: "/dashboard/admin", icon: ShieldUser },
];

// Sections outside the signed-in user's package are hidden; Admin is the installer's own page and always shows.
const featureFor = (href: string) => dashboardFeatures.find((feature) => feature.href === href)?.id;

// The site is exported with trailing slashes ("/dashboard/farm/"), so compare paths without them.
const trimSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = trimSlash(usePathname() ?? "");
  const { current } = useFarmUsers();
  const items = nav.filter((item) => {
    const feature = featureFor(item.href);
    return !feature || canUse(current, feature);
  });

  return (
    <nav className="space-y-1">
      {items.map((item, index) => {
        const active = pathname === trimSlash(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            style={{ "--i": index } as React.CSSProperties}
            className={cn("side-link flex items-center gap-3 rounded-lg px-3 py-2 text-sm", active && "side-link-active")}
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
          className="side-logout flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
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
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--d-chip)] text-[var(--d-text)] hover:bg-[var(--d-chip-hover)]"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-full z-40 max-h-[75vh] overflow-y-auto dash-side border-t p-4 shadow-xl">
          <DashboardNav onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
