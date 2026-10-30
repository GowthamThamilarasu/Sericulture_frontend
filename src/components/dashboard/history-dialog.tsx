"use client";

import { createContext, useContext, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChartLine, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useDashboardTheme } from "@/components/dashboard/dashboard-theme";
import type { Icon } from "@/components/dashboard/dashboard-widgets";

/** A reading that can show its history. Swing is the day/night change, noise the random wander (both in the reading's unit). */
export type HistoryParam = {
  key: string;
  label: string;
  unit: string;
  decimals: number;
  value: number;
  icon?: Icon;
  target?: [number, number];
  swing?: number;
  noise: number;
  floor?: number;
  ceil?: number;
};

const ranges = [
  { key: "24h", label: "24 hours", points: 25, stepHours: 1 },
  { key: "7d", label: "7 days", points: 29, stepHours: 6 },
  { key: "30d", label: "30 days", points: 31, stepHours: 24 },
] as const;

type RangeKey = (typeof ranges)[number]["key"];

// Seeded random numbers so a parameter's history stays the same while the window is open.
function seededRandom(seed: string) {
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619) >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function timeLabel(date: Date, range: RangeKey) {
  if (range === "24h") return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (range === "7d") return `${date.toLocaleDateString([], { weekday: "short" })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

// Demo history: day/night cycle plus a wandering offset, shifted so the last point is the current reading.
function buildHistory(param: HistoryParam, rangeKey: RangeKey) {
  const range = ranges.find((item) => item.key === rangeKey) ?? ranges[0];
  const random = seededRandom(`${param.key}-${rangeKey}`);
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const noise = param.noise * (1 + range.stepHours / 12);
  let wander = 0;

  const raw = Array.from({ length: range.points }, (_, index) => {
    const time = new Date(now.getTime() - (range.points - 1 - index) * range.stepHours * 3_600_000);
    wander = wander * 0.8 + (random() - 0.5) * 2 * noise;
    const cycle = (param.swing ?? 0) * Math.sin((2 * Math.PI * (time.getHours() - 9)) / 24);
    return { time, value: param.value + cycle + wander };
  });

  const shift = param.value - raw[raw.length - 1].value;
  const factor = 10 ** param.decimals;
  return raw.map(({ time, value }) => {
    const clamped = Math.min(param.ceil ?? Infinity, Math.max(param.floor ?? -Infinity, value + shift));
    return { time: timeLabel(time, rangeKey), value: Math.round(clamped * factor) / factor };
  });
}

const HistoryContext = createContext<(param: HistoryParam) => void>(() => {});

export function useOpenHistory() {
  return useContext(HistoryContext);
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [param, setParam] = useState<HistoryParam | null>(null);
  const [range, setRange] = useState<RangeKey>("24h");

  const open = (next: HistoryParam) => {
    setRange("24h");
    setParam(next);
  };

  return (
    <HistoryContext.Provider value={open}>
      {children}
      <Dialog.Root open={param !== null} onOpenChange={(value) => !value && setParam(null)}>
        {param && <HistoryWindow param={param} range={range} onRange={setRange} />}
      </Dialog.Root>
    </HistoryContext.Provider>
  );
}

function HistoryWindow({ param, range, onRange }: { param: HistoryParam; range: RangeKey; onRange: (range: RangeKey) => void }) {
  const { palette } = useDashboardTheme();
  const data = useMemo(() => buildHistory(param, range), [param, range]);
  const values = data.map((point) => point.value);
  const stats = [
    { label: "Current", value: param.value },
    { label: "Min", value: Math.min(...values) },
    { label: "Max", value: Math.max(...values) },
    { label: "Average", value: values.reduce((sum, value) => sum + value, 0) / values.length },
  ];
  const format = (value: number) => `${value.toFixed(param.decimals)}${param.unit ? ` ${param.unit}` : ""}`;
  const ParamIcon = param.icon ?? ChartLine;
  const gradientId = `history-${param.key}`;

  return (
    <>
      <Dialog.Overlay className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-[2px]" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[66] max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--d-accent-soft)]">
              <ParamIcon className="h-5 w-5" style={{ color: "var(--d-accent)" }} aria-hidden="true" />
            </span>
            <div>
              <Dialog.Title className="text-lg font-semibold">{param.label} history</Dialog.Title>
              <Dialog.Description className="text-xs text-[var(--d-muted)]">
                {param.target ? `Target ${param.target[0]}–${param.target[1]}${param.unit ? ` ${param.unit}` : ""} · ` : ""}Demo data
              </Dialog.Description>
            </div>
          </div>
          <Dialog.Close aria-label="Close" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
            <X className="h-5 w-5" />
          </Dialog.Close>
        </div>

        <div role="tablist" aria-label="Time range" className="mt-4 inline-flex rounded-full bg-[var(--d-chip)] p-1">
          {ranges.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={item.key === range}
              onClick={() => onRange(item.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                item.key === range ? "accent-fill" : "text-[var(--d-muted)] hover:text-[var(--d-text)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-[var(--d-card)] p-3">
              <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--d-muted)]">{stat.label}</div>
              <div className="mt-1 text-lg font-bold tabular-nums">{format(stat.value)}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={palette.accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={palette.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={palette.grid} vertical={false} />
              {param.target && <ReferenceArea y1={param.target[0]} y2={param.target[1]} fill={palette.accent} fillOpacity={0.07} ifOverflow="extendDomain" />}
              <XAxis dataKey="time" tickLine={false} axisLine={false} minTickGap={24} tick={{ fill: palette.tick, fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} width={48} domain={["auto", "auto"]} tick={{ fill: palette.tick, fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [format(Number(value)), param.label]}
                contentStyle={{ backgroundColor: palette.tooltipBg, border: `1px solid ${palette.tooltipBorder}`, borderRadius: 8, color: palette.text }}
                labelStyle={{ color: palette.muted }}
              />
              <Area type="monotone" dataKey="value" stroke={palette.accent} strokeWidth={2} fill={`url(#${gradientId})`} dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {param.target && <div className="mt-2 text-[11px] text-[var(--d-muted)]">The shaded band is the target range.</div>}
      </Dialog.Content>
    </>
  );
}

/** Small chart button for a card header. */
export function HistoryButton({ param }: { param: HistoryParam }) {
  const open = useOpenHistory();
  return (
    <button
      type="button"
      onClick={() => open(param)}
      aria-label={`Show ${param.label} history`}
      title="Show history"
      className="rounded-md p-1 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-accent)]"
    >
      <ChartLine className="h-4 w-4" />
    </button>
  );
}
