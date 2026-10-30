"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { ChartLine, Minus, Plus } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ModeSelector } from "@/components/dashboard/controller-mode";
import { useDashboardTheme } from "@/components/dashboard/dashboard-theme";
import { type Icon, Widget } from "@/components/dashboard/dashboard-widgets";
import { HistoryProvider } from "@/components/dashboard/history-dialog";
import { type Tint, tintClass } from "@/components/dashboard/tints";

// Page-level building blocks so every dashboard tab shares the Overview's look. Colors come from the .dash-theme tokens in globals.css.

export type Tone = "accent" | "warn" | "danger" | "info" | "muted";

export const toneColor: Record<Tone, string> = {
  accent: "var(--d-tint, var(--d-accent))",
  warn: "var(--d-warn)",
  danger: "var(--d-danger)",
  info: "var(--d-info)",
  muted: "var(--d-muted)",
};

export const toneSoft: Record<Tone, string> = {
  accent: "var(--d-tint-soft, var(--d-accent-soft))",
  warn: "var(--d-warn-soft)",
  danger: "var(--d-danger-soft)",
  info: "var(--d-chip)",
  muted: "var(--d-chip)",
};

export const buttonPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-md accent-fill px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
export const buttonSecondary =
  "inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--d-chip)] px-3 py-1.5 text-xs font-medium text-[var(--d-text)] transition-colors hover:bg-[var(--d-chip-hover)] disabled:cursor-not-allowed disabled:opacity-50";

// Selected card (e.g. the Climate Control mode cards): the shared accent-fill with a larger glow. See globals.css.
export const activeHighlight = "border-transparent accent-fill accent-glow";
export const buttonGradient =
  "inline-flex items-center justify-center gap-1.5 rounded-xl accent-fill font-semibold transition-all hover:-translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--d-accent)] focus-visible:ring-offset-2";

export type PageTint = "plant" | "water" | "heat" | "soil" | "nutrient" | "air" | "light" | "alert" | "slate";

// Every tab shares the green page background; `tint` is kept so tabs can be recoloured again later.
export function DashboardPage({ tint, children }: { tint: PageTint; children: React.ReactNode }) {
  void tint;
  return (
    <HistoryProvider>
      <div className={`page-plant -m-4 min-h-[calc(100vh-65px)] space-y-8 bg-[var(--d-page)] p-4 text-[var(--d-text)] md:-m-6 md:p-6`}>{children}</div>
    </HistoryProvider>
  );
}

export function PageHeader({ icon: Icon, eyebrow, title, detail, badge = "Demo / Simulated Data" }: { icon: Icon; eyebrow: string; title: string; detail?: string; badge?: string | null }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg dash-card border border-[var(--d-card-border)] bg-[var(--d-banner)] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--d-accent-soft)]">
          <Icon className="h-5 w-5" style={{ color: "var(--d-accent)" }} aria-hidden="true" />
        </span>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--d-muted)]">{eyebrow}</div>
          <h1 className="text-lg font-semibold text-[var(--d-text)]">{title}</h1>
          {detail && <div className="text-xs text-[var(--d-muted)]">{detail}</div>}
        </div>
      </div>
      {badge && <span className="rounded-full bg-[var(--d-warn-soft)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-warn)]">{badge}</span>}
    </header>
  );
}

export function Pill({ tone = "accent", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ backgroundColor: toneSoft[tone], color: toneColor[tone] }}>
      {children}
    </span>
  );
}

// Compact reading: icon chip, label, value. Used for status values that have no history or control.
export function StatTile({ label, value, unit, icon: Icon, tone = "accent", note, tint }: { label: string; value: string | number; unit?: string; icon: Icon; tone?: Tone; note?: string; tint?: Tint | null }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg dash-card border border-[var(--d-card-border)] bg-[var(--d-card)] p-3 ${tintClass(Icon, tint)}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: toneSoft[tone] }}>
        <Icon className="h-5 w-5" style={{ color: toneColor[tone] }} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">{label}</div>
        <div className="text-lg font-bold" style={{ color: toneColor[tone] }}>
          {value}
          {unit && <span className="ml-1 text-xs font-medium text-[var(--d-muted)]">{unit}</span>}
        </div>
        {note && <div className="truncate text-[10px] text-[var(--d-muted)]">{note}</div>}
      </div>
    </div>
  );
}

// Label/value line inside a Widget.
export function InfoRow({ label, value, icon: Icon, tone }: { label: string; value: React.ReactNode; icon?: Icon; tone?: Tone }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--d-line)] py-2 last:border-b-0">
      <span className="flex items-center gap-2 text-sm text-[var(--d-soft)]">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-[var(--d-muted)]" aria-hidden="true" />}
        {label}
      </span>
      <span className="text-sm font-semibold" style={{ color: tone ? toneColor[tone] : "var(--d-text)" }}>
        {value}
      </span>
    </div>
  );
}

export type TrendSeries = { id: string; title: string; unit: string; data: { time: string; value: number }[]; tone: "accent" | "warn" | "info"; icon: Icon };

export function TrendChart({ id, title, unit, data, tone, icon, className }: TrendSeries & { className?: string }) {
  const { palette } = useDashboardTheme();
  const color = palette[tone];
  return (
    <Widget title={`${title} History`} icon={icon} className={className} action={<ChartLine className="h-4 w-4 shrink-0 text-[var(--d-muted)]" aria-hidden="true" />}>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={palette.grid} vertical={false} />
            <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: palette.tick, fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} width={44} domain={["auto", "auto"]} tick={{ fill: palette.tick, fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [`${value} ${unit}`, title]}
              contentStyle={{ backgroundColor: palette.tooltipBg, border: `1px solid ${palette.tooltipBorder}`, borderRadius: 8, color: palette.text }}
              labelStyle={{ color: palette.muted }}
            />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${id})`} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Widget>
  );
}

// A controllable device: icon, name, status line and its Auto / Semi / Manual selector.
export function ControlRow({ name, icon: Icon, status, tone = "muted" }: { name: string; icon: Icon; status?: string; tone?: Tone }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-md border border-[var(--d-card-border)] bg-[var(--d-card)] p-3 ${tintClass(Icon)}`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--d-tint-soft,var(--d-accent-soft))]">
          <Icon className="h-4 w-4" style={{ color: "var(--d-tint, var(--d-accent))" }} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[var(--d-text)]">{name}</div>
          {status && (
            <div className="truncate text-[10px] uppercase tracking-[0.15em]" style={{ color: toneColor[tone] }}>
              {status}
            </div>
          )}
        </div>
      </div>
      <ModeSelector name={name} className="shrink-0" />
    </div>
  );
}

// keepMounted: leave the panel running while another tab is shown (for panels with live internal state).
export type BlockTab = { id: string; label: string; icon: Icon; content: React.ReactNode; keepMounted?: boolean };

// A Widget whose body switches between related panels.
export function TabWidget({ title, icon, tint, action, tabs, className }: { title: string; icon: Icon; tint?: Tint | null; action?: React.ReactNode; tabs: BlockTab[]; className?: string }) {
  return (
    <Widget title={title} icon={icon} tint={tint} action={action} className={className}>
      <Tabs.Root defaultValue={tabs[0]?.id}>
        <Tabs.List aria-label={title} className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-[var(--d-chip)] p-1">
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold text-[var(--d-muted)] outline-none transition-colors hover:text-[var(--d-text)] focus-visible:ring-2 focus-visible:ring-[var(--d-accent)] data-[state=active]:accent-fill"
            >
              <tab.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Content key={tab.id} value={tab.id} forceMount={tab.keepMounted || undefined} className="outline-none data-[state=inactive]:hidden">
            {tab.content}
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Widget>
  );
}

// Number field with − / + buttons; values are clamped to [min, max] and rounded to `decimals`.
export function Stepper({ id, label, value, step, decimals, min = 0, max = Infinity, unit, onChange }: { id: string; label: string; value: number; step: number; decimals: number; min?: number; max?: number; unit?: string; onChange: (value: number) => void }) {
  const set = (next: number) => onChange(Number(Math.min(max, Math.max(min, next)).toFixed(decimals)));
  const button = "flex h-9 w-9 shrink-0 items-center justify-center text-[var(--d-muted)] transition-colors hover:bg-[var(--d-chip-hover)] hover:text-[var(--d-text)] disabled:opacity-40 disabled:hover:bg-transparent";
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">
        {label}
      </label>
      <div className="flex items-center overflow-hidden rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] focus-within:border-[var(--d-tint,var(--d-accent))]">
        <button type="button" aria-label={`Decrease ${label}`} onClick={() => set(value - step)} disabled={value - step < min} className={button}>
          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={Number.isFinite(max) ? max : undefined}
          step={step}
          value={value}
          onChange={(event) => set(Number(event.target.value) || 0)}
          className="w-full min-w-0 bg-transparent py-1.5 text-center text-sm font-bold tabular-nums text-[var(--d-text)] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {unit && <span className="pr-1 text-[10px] text-[var(--d-muted)]">{unit}</span>}
        <button type="button" aria-label={`Increase ${label}`} onClick={() => set(value + step)} disabled={value + step > max} className={button}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export type PageView<T extends string> = { id: T; label: string; icon: Icon; count?: number | null };

/** Row of buttons that switches a tab between whole views; pair each view with role="tabpanel" id={`${idPrefix}-view-${id}`}. */
export function ViewTabs<T extends string>({ label, idPrefix, views, value, onChange }: { label: string; idPrefix: string; views: readonly PageView<T>[]; value: T; onChange: (value: T) => void }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto rounded-xl bg-[var(--d-chip)] p-1">
      {views.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          id={`${idPrefix}-tab-${item.id}`}
          aria-selected={value === item.id}
          aria-controls={`${idPrefix}-view-${item.id}`}
          onClick={() => onChange(item.id)}
          className={`flex flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            value === item.id ? "accent-fill shadow-sm" : "text-[var(--d-soft)] hover:bg-[var(--d-chip-hover)] hover:text-[var(--d-text)]"
          }`}
        >
          <item.icon className="h-4 w-4" aria-hidden="true" />
          {item.label}
          {item.count ? <span className={`rounded-full px-2 py-0.5 text-[11px] ${value === item.id ? "bg-black/15" : "bg-[var(--d-chip)]"}`}>{item.count}</span> : null}
        </button>
      ))}
    </div>
  );
}
