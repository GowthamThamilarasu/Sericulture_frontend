"use client";

import { useEffect, useState } from "react";
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

function useNavItems() {
  const pathname = trimSlash(usePathname() ?? "");
  const { current } = useFarmUsers();
  const items = nav.filter((item) => {
    const feature = featureFor(item.href);
    return !feature || canUse(current, feature);
  });
  return { items, isActive: (href: string) => pathname === trimSlash(href) };
}

// Where each floating leaf starts, how big it is, how fast it rises and how far it drifts sideways.
const leaves = [
  { left: "12%", size: 14, dur: "18s", delay: "0s", sway: "30px" },
  { left: "38%", size: 10, dur: "22s", delay: "-6s", sway: "-20px" },
  { left: "62%", size: 16, dur: "20s", delay: "-12s", sway: "26px" },
  { left: "84%", size: 11, dur: "24s", delay: "-3s", sway: "-28px" },
  { left: "26%", size: 12, dur: "26s", delay: "-16s", sway: "18px" },
];

/** Decorative motion behind the sidebar and the full-screen menu (styles in globals.css, .side-*). */
export function SidebarBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <span className="side-orb -left-16 top-10 h-48 w-48 bg-[var(--d-accent-strong)]" />
      <span className="side-orb -right-20 top-1/2 h-56 w-56 bg-[color-mix(in_srgb,var(--d-accent)_70%,transparent)]" style={{ animationDelay: "-7s" }} />
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

/** The Paari Agritech Automations logo. Its lettering is dark green, so it sits on a white plate over the dark sidebar. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex rounded-xl bg-[#fff] px-2.5 py-2 shadow-[0_10px_30px_-10px_color-mix(in_srgb,var(--d-accent)_70%,transparent)] ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer */}
      <img src="/paari-agritech-logo.png" alt="Paari Agritech Automations" width={1400} height={423} className="h-auto w-full" />
    </span>
  );
}

/** Sidebar links (large screens). */
export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const { items, isActive } = useNavItems();

  return (
    <nav className="space-y-1">
      {items.map((item, index) => {
        const active = isActive(item.href);
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
        <Link href="/login" onClick={onNavigate} className="side-logout flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors">
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </Link>
      </div>
    </nav>
  );
}

/** Menu button plus a full-window menu of icon tiles, on phones, tablets and desktops alike. */
export function DashboardLauncher() {
  const [open, setOpen] = useState(false);
  const { items, isActive } = useNavItems();
  const close = () => setOpen(false);

  // While open: Esc closes it and the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--d-chip)] text-[var(--d-text)] hover:bg-[var(--d-chip-hover)]"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Menu" className="launcher dash-side fixed inset-0 z-[90] flex flex-col overflow-y-auto overscroll-contain">
          <SidebarBackdrop />
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 backdrop-blur-md sm:px-6">
            <Link href="/dashboard" onClick={close} aria-label="Overview" className="w-32 shrink-0 sm:w-40">
              <Wordmark className="w-full !rounded-lg !px-1.5 !py-1" />
            </Link>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--d-accent-bright)] sm:block">Control Center</span>
            <button type="button" onClick={close} autoFocus aria-label="Close menu" className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Dashboard sections" className="mx-auto grid w-full max-w-6xl flex-1 content-center grid-cols-2 gap-3 px-4 pb-6 pt-2 min-[480px]:grid-cols-3 sm:gap-4 sm:px-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item, index) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  style={{ "--i": index } as React.CSSProperties}
                  className={cn("launch-tile group flex aspect-[5/4] flex-col items-center justify-center gap-2.5 rounded-2xl border p-3 text-center", active ? "launch-tile-active" : "border-white/10 bg-white/[0.06]")}
                >
                  <span className="launch-icon flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14">
                    <item.icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold leading-tight sm:text-sm">{item.label}</span>
                </Link>
              );
            })}
            <Link href="/login" onClick={close} style={{ "--i": items.length } as React.CSSProperties} className="launch-tile flex aspect-[5/4] flex-col items-center justify-center gap-2.5 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-center text-[#ffb4b4] hover:bg-red-500/20">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 sm:h-14 sm:w-14">
                <LogOut className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold sm:text-sm">Log out</span>
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
