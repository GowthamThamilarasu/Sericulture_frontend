"use client";

import type { Icon } from "@/components/dashboard/dashboard-widgets";
import { Pill, Stepper } from "@/components/dashboard/page-kit";

// Min / max band editor shared by the fertigation bands and the shed limits:
// a two-handle slider with the live reading marked on it, plus Low / High steppers.

export type Range = { min: number; max: number };

const round = (value: number, decimals: number) => Number(value.toFixed(decimals));
export const bandStatus = (value: number, { min, max }: Range) => (value < min ? "Low" : value > max ? "High" : "In band");

/** Drag either handle to set the low or high limit; the marker shows the live reading. */
export function BandSlider({ label, scale, step, decimals, range, value, onChange }: { label: string; scale: Range; step: number; decimals: number; range: Range; value?: number; onChange: (next: Range) => void }) {
  const pct = (x: number) => Math.min(100, Math.max(0, ((x - scale.min) / (scale.max - scale.min)) * 100));
  const out = value !== undefined && (value < range.min || value > range.max);
  // When both handles sit at the top end, lift the low handle so it can still be dragged back down.
  const lowOnTop = range.min > (scale.min + scale.max) / 2;

  return (
    <div className="pt-6">
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[var(--d-track)]" />
        <div className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full" style={{ left: `${pct(range.min)}%`, width: `${pct(range.max) - pct(range.min)}%`, backgroundColor: "var(--d-tint, var(--d-accent))", opacity: 0.55 }} />
        {value !== undefined && (
          <div className="pointer-events-none absolute -top-6 flex -translate-x-1/2 flex-col items-center transition-[left] duration-700 ease-out" style={{ left: `${pct(value)}%` }} aria-hidden="true">
            <span className="rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[var(--d-popup)] shadow-sm" style={{ backgroundColor: out ? "var(--d-warn)" : "var(--d-text)" }}>
              {value.toFixed(decimals)}
            </span>
            <span className="h-0 w-0 border-x-4 border-t-4 border-x-transparent" style={{ borderTopColor: out ? "var(--d-warn)" : "var(--d-text)" }} />
          </div>
        )}
        <input
          type="range"
          aria-label={`${label} low limit`}
          min={scale.min}
          max={scale.max}
          step={step}
          value={range.min}
          onChange={(event) => onChange({ ...range, min: round(Math.min(Number(event.target.value), range.max - step), decimals + 1) })}
          className="dual-range"
          style={{ zIndex: lowOnTop ? 3 : 2 }}
        />
        <input
          type="range"
          aria-label={`${label} high limit`}
          min={scale.min}
          max={scale.max}
          step={step}
          value={range.max}
          onChange={(event) => onChange({ ...range, max: round(Math.max(Number(event.target.value), range.min + step), decimals + 1) })}
          className="dual-range"
          style={{ zIndex: lowOnTop ? 2 : 3 }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] tabular-nums text-[var(--d-muted)]">
        <span>{scale.min}</span>
        <span>{scale.max}</span>
      </div>
    </div>
  );
}

/** A labelled band: name, unit and status, the slider, and Min / Max steppers. */
export function RangeCard({
  id,
  label,
  detail,
  unit,
  icon: Icon,
  scale,
  step,
  decimals,
  range,
  value,
  onChange,
  lowLabel = "Min",
  highLabel = "Max",
}: {
  id: string;
  label: string;
  detail?: string;
  unit?: string;
  icon?: Icon;
  scale: Range;
  step: number;
  decimals: number;
  range: Range;
  value?: number;
  onChange: (next: Range) => void;
  lowLabel?: string;
  highLabel?: string;
}) {
  const status = value === undefined ? null : bandStatus(value, range);
  return (
    <div className="min-w-0 rounded-xl border border-[var(--d-card-border)] bg-[var(--d-inset)] p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          {Icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--d-accent-soft)]">
              <Icon className="h-4 w-4 text-[var(--d-accent)]" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <div className="truncate text-base font-bold text-[var(--d-text)]">
              {label} {unit && <span className="text-xs font-medium text-[var(--d-muted)]">{unit}</span>}
            </div>
            {detail && <div className="text-[11px] text-[var(--d-muted)]">{detail}</div>}
          </div>
        </div>
        {status && <Pill tone={status === "In band" ? "accent" : "warn"}>{status}</Pill>}
      </div>

      <BandSlider label={label} scale={scale} step={step} decimals={decimals} range={range} value={value} onChange={onChange} />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stepper id={`${id}-min`} label={lowLabel} value={range.min} step={step} decimals={decimals + 1} min={scale.min} max={range.max - step} onChange={(min) => onChange({ ...range, min })} />
        <Stepper id={`${id}-max`} label={highLabel} value={range.max} step={step} decimals={decimals + 1} min={range.min + step} max={scale.max} onChange={(max) => onChange({ ...range, max })} />
      </div>
    </div>
  );
}
