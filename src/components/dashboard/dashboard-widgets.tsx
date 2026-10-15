"use client";

import { ChartLine } from "lucide-react";

import { type HistoryParam, useOpenHistory } from "@/components/dashboard/history-dialog";

// Building blocks shared by the dashboard overview panels. Colors come from the .dash-theme tokens in globals.css.

export type Icon = React.ComponentType<{ className?: string; style?: React.CSSProperties; "aria-hidden"?: boolean | "true" | "false" }>;

// With `history`, clicking the card body opens that reading's history window.
export function Widget({ title, icon: Icon, action, className, children, history }: { title: string; icon?: Icon; action?: React.ReactNode; className?: string; children: React.ReactNode; history?: HistoryParam }) {
  const openHistory = useOpenHistory();
  const hint = history && <ChartLine className="h-4 w-4 shrink-0 text-[var(--d-muted)]" aria-hidden="true" />;

  return (
    <section className={`flex flex-col overflow-hidden rounded-lg border border-[var(--d-card-border)] bg-[var(--d-card)] ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
        <h2 className="flex min-w-0 items-center gap-2 text-[15px] font-semibold text-[var(--d-text)]">
          {Icon && <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--d-accent)" }} aria-hidden="true" />}
          <span className="truncate">{title}</span>
        </h2>
        {action ?? hint}
      </div>
      {history ? (
        <button type="button" onClick={() => openHistory(history)} className="flex flex-1 flex-col px-4 pb-4 text-left transition-colors hover:bg-[var(--d-chip)]">
          {children}
          <span className="sr-only">Show {history.label} history</span>
        </button>
      ) : (
        <div className="flex flex-1 flex-col px-4 pb-4">{children}</div>
      )}
    </section>
  );
}

export function Toggle({ on, onChange, label, disabled, size = "md" }: { on: boolean; onChange: () => void; label: string; disabled?: boolean; size?: "sm" | "md" }) {
  const track = size === "sm" ? "h-7 w-12" : "h-11 w-20";
  const knob = size === "sm" ? `top-1 h-5 w-5 ${on ? "left-6" : "left-1"}` : `top-1.5 h-8 w-8 ${on ? "left-[2.6rem]" : "left-1.5"}`;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      className={`relative shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${track}`}
      style={{ backgroundColor: on ? "var(--d-accent)" : "var(--d-track)" }}
    >
      <span className={`absolute rounded-full bg-white shadow transition-all ${knob}`} />
    </button>
  );
}
