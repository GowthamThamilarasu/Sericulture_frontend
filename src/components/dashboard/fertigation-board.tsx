"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ChartLine, Check, Droplets, FlaskConical, Flower2, Leaf, Link2, RotateCcw, Sprout, Zap } from "lucide-react";

import { type Icon, Widget } from "@/components/dashboard/dashboard-widgets";
import { SetpointsLink } from "@/components/dashboard/monitor-widgets";
import { Pill, Stepper, buttonSecondary } from "@/components/dashboard/page-kit";
import { RangeCard, bandStatus } from "@/components/dashboard/range-card";
import { type ChipMotion, SensorChipGrid, type SensorChipProps, overviewGrid } from "@/components/dashboard/sensor-chip";
import { SoilPhIcon } from "@/components/dashboard/sensor-icons";
import type { Tint } from "@/components/dashboard/tints";
import { fertigationReadings, fertigationSessions } from "@/data/mock";
import type { FertigationReading } from "@/types";

type Key = FertigationReading["key"];
type Values = Record<Key, number>;
type Range = { min: number; max: number };

// TDS is not set directly: it follows EC (ppm ≈ EC mS/cm × 640).
const tdsFactor = 640;
const settable = fertigationReadings.filter((item) => item.key !== "tds");
const steps: Record<Key, number> = { ph: 0.1, ec: 0.05, tds: 10, n: 5, p: 5, k: 5 };

const initialValues = Object.fromEntries(fertigationReadings.map((item) => [item.key, item.value])) as Values;

// Demo feed: each reading drifts a little every two seconds; TDS follows EC.
function nextValues(current: Values): Values {
  const next = { ...current };
  for (const item of fertigationReadings) {
    if (item.key === "tds") continue;
    const span = item.max - item.min;
    const value = current[item.key] + (Math.random() - 0.5) * span * 0.08;
    next[item.key] = Math.min(item.max + span * 0.2, Math.max(item.min - span * 0.2, value));
  }
  next.tds = next.ec * tdsFactor;
  return next;
}

// Fertigation set points: one shared store so every page shows the same targets; saved per browser.
type Setpoints = { ranges: Record<Key, Range>; dose: number; dosesPerDay: number };

const defaultSetpoints: Setpoints = {
  ranges: Object.fromEntries(fertigationReadings.map((item) => [item.key, { min: item.min, max: item.max }])) as Record<Key, Range>,
  dose: fertigationSessions[0].dose,
  dosesPerDay: 2,
};

const storageKey = "fertigation-setpoints";
const listeners = new Set<() => void>();
let setpoints: Setpoints | null = null;

function loadSetpoints(): Setpoints {
  if (setpoints) return setpoints;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as Partial<Setpoints> | null;
    setpoints = saved ? { ...defaultSetpoints, ...saved, ranges: { ...defaultSetpoints.ranges, ...saved.ranges } } : defaultSetpoints;
  } catch {
    setpoints = defaultSetpoints;
  }
  return setpoints;
}

function saveSetpoints(next: Setpoints) {
  // TDS band always follows the EC band.
  setpoints = { ...next, ranges: { ...next.ranges, tds: { min: Math.round(next.ranges.ec.min * tdsFactor), max: Math.round(next.ranges.ec.max * tdsFactor) } } };
  try {
    localStorage.setItem(storageKey, JSON.stringify(setpoints));
  } catch {
    // Storage blocked: the change still holds until the page reloads.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useFertigationSetpoints() {
  return useSyncExternalStore(subscribe, loadSetpoints, () => defaultSetpoints);
}

const round = (value: number, decimals: number) => Number(value.toFixed(decimals));

// Icon, colour and idle motion for each reading's card.
const readingLook: Record<Key, { label: string; icon: Icon; tint?: Tint; motion: ChipMotion }> = {
  ph: { label: "Water pH", icon: SoilPhIcon, tint: "soil", motion: "sway" },
  tds: { label: "TDS", icon: Droplets, tint: "water", motion: "bob" },
  ec: { label: "EC", icon: Zap, tint: "nutrient", motion: "spark" },
  n: { label: "Nitrogen · N", icon: Leaf, motion: "sway" },
  p: { label: "Phosphorus · P", icon: Sprout, tint: "nutrient", motion: "pulse" },
  k: { label: "Potassium · K", icon: Flower2, tint: "heat", motion: "glow" },
};

function LiveReadings({ values, ranges, compact }: { values: Values; ranges: Record<Key, Range>; compact?: boolean }) {
  const session = fertigationSessions[0];

  return (
    <>
      <div className={`mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${compact ? "hidden" : ""}`}>
        <span className="rounded-full bg-[var(--d-accent-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-accent)]">{session.status}</span>
        <span className="text-[var(--d-soft)]">{session.recipe}</span>
        <span className="text-[var(--d-muted)]">
          Target EC {session.ecTarget} · Dose {session.dose} mL
        </span>
      </div>

      <SensorChipGrid
        className={compact ? `${overviewGrid} lg:grid-cols-6` : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6"}
        size={compact ? "sm" : "md"}
        items={fertigationReadings.map((item): SensorChipProps => {
          const value = values[item.key];
          const { min, max } = ranges[item.key];
          const status = value < min ? "Low" : value > max ? "High" : "In band";
          const look = readingLook[item.key];
          return {
            label: look.label,
            value: value.toFixed(item.decimals),
            unit: item.unit || undefined,
            icon: look.icon,
            tint: look.tint,
            motion: look.motion,
            warn: status !== "In band",
            status: `${status} · ${min}–${max}`,
            history: {
              key: `fertigation-${item.key}`,
              label: `${item.name} (${item.label})`,
              unit: item.unit,
              decimals: item.decimals,
              value: round(value, item.decimals),
              icon: look.icon,
              target: [min, max],
              noise: (item.max - item.min) * 0.06,
              floor: 0,
            },
          };
        })}
      />
    </>
  );
}

// Slider scale for each reading: wide enough to show the band with room either side.
const scales: Record<Key, Range> = { ph: { min: 4, max: 9 }, ec: { min: 0, max: 2.5 }, tds: { min: 0, max: 1600 }, n: { min: 0, max: 300 }, p: { min: 0, max: 120 }, k: { min: 0, max: 400 } };

const statusOf = bandStatus;


function ReadingCard({ item, range, value, onChange }: { item: FertigationReading; range: Range; value: number; onChange: (next: Range) => void }) {
  return <RangeCard id={`fert-${item.key}`} label={item.label} detail={item.name} unit={item.unit} scale={scales[item.key]} step={steps[item.key]} decimals={item.decimals} range={range} value={value} onChange={onChange} lowLabel="Low" highLabel="High" />;
}

function SetpointEditor({ values, current }: { values: Values; current: Setpoints }) {
  const [saved, setSaved] = useState({ show: false, tick: 0 });
  const save = (next: Setpoints) => {
    saveSetpoints(next);
    setSaved((current) => ({ show: true, tick: current.tick + 1 }));
  };
  const setRange = (key: Key, range: Range) => save({ ...current, ranges: { ...current.ranges, [key]: range } });
  const inBand = settable.filter((item) => statusOf(values[item.key], current.ranges[item.key]) === "In band").length;
  const tds = current.ranges.tds;
  const tdsStatus = statusOf(values.tds, tds);

  // Hide the "Saved" note again shortly after the last change.
  useEffect(() => {
    if (!saved.show) return;
    const timer = window.setTimeout(() => setSaved((current) => ({ ...current, show: false })), 1800);
    return () => window.clearTimeout(timer);
  }, [saved.show, saved.tick]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone={inBand === settable.length ? "accent" : "warn"}>
            {inBand} of {settable.length} in band
          </Pill>
          <span className="text-xs text-[var(--d-muted)]">Drag the handles or use − / + to set each target band.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold text-[var(--d-accent)] transition-opacity duration-300 ${saved.show ? "opacity-100" : "opacity-0"}`} aria-live="polite">
            <Check className="h-3.5 w-3.5" aria-hidden="true" /> {saved.show ? "Saved" : ""}
          </span>
          <button type="button" onClick={() => save(defaultSetpoints)} className={buttonSecondary}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset to recommended
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {settable.map((item) => (
          <ReadingCard key={item.key} item={item} range={current.ranges[item.key]} value={values[item.key]} onChange={(range) => setRange(item.key, range)} />
        ))}

        <div className="flex flex-col rounded-xl border border-dashed border-[var(--d-card-border)] bg-[var(--d-inset)] p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-base font-bold text-[var(--d-text)]">
                TDS <span className="text-xs font-medium text-[var(--d-muted)]">ppm</span>
              </div>
              <div className="text-[11px] text-[var(--d-muted)]">Total dissolved solids</div>
            </div>
            <Pill tone={tdsStatus === "In band" ? "accent" : "warn"}>{tdsStatus}</Pill>
          </div>
          <div className="mt-4 text-3xl font-bold tabular-nums text-[var(--d-text)]">
            {values.tds.toFixed(0)}
            <span className="ml-1 text-xs font-medium text-[var(--d-muted)]">ppm now</span>
          </div>
          <div className="mt-1 text-sm text-[var(--d-soft)]">
            Band{" "}
            <span className="font-semibold tabular-nums text-[var(--d-text)]">
              {tds.min}–{tds.max}
            </span>{" "}
            ppm
          </div>
          <div className="mt-auto flex items-center gap-1.5 pt-4 text-[11px] text-[var(--d-muted)]">
            <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Follows the EC band (EC × {tdsFactor}). Set EC to change it.
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 rounded-xl border border-[var(--d-card-border)] bg-[var(--d-inset)] p-4 sm:grid-cols-3">
        <Stepper id="fert-dose" label="Dose per run" value={current.dose} step={5} decimals={0} min={5} max={1000} unit="mL" onChange={(dose) => save({ ...current, dose })} />
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">Max doses per day</div>
          <div role="radiogroup" aria-label="Max doses per day" className="flex gap-1 rounded-lg bg-[var(--d-chip)] p-1">
            {[1, 2, 3, 4, 6].map((count) => (
              <button
                key={count}
                type="button"
                role="radio"
                aria-checked={current.dosesPerDay === count}
                onClick={() => save({ ...current, dosesPerDay: count })}
                className={`h-7 flex-1 rounded-md text-xs font-bold transition-colors ${current.dosesPerDay === count ? "bg-[var(--d-tint,var(--d-accent))] text-[var(--d-popup)] shadow-sm" : "text-[var(--d-muted)] hover:text-[var(--d-text)]"}`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-lg bg-[var(--d-tint-soft,var(--d-accent-soft))] px-4 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">Daily dosing limit</div>
          <div className="text-2xl font-bold tabular-nums text-[var(--d-text)]">
            {(current.dose * current.dosesPerDay).toLocaleString()}
            <span className="ml-1 text-xs font-medium text-[var(--d-muted)]">mL / day</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Demo live feed, shared by the readings panel and the set point editor.
function useLiveValues() {
  const [values, setValues] = useState(initialValues);
  useEffect(() => {
    const timer = window.setInterval(() => setValues(nextValues), 2000);
    return () => window.clearInterval(timer);
  }, []);
  return values;
}

/** Fertigation target bands and dosing limits. Shown on the Automation tab only. */
export function FertigationSetpoints() {
  const values = useLiveValues();
  const current = useFertigationSetpoints();
  return <SetpointEditor values={values} current={current} />;
}

/** Live nutrient readings against their target bands. The bands are set on the Automation tab. */
/** `compact` (Overview) shows the six readings in one row of small tiles. */
export function FertigationBoard({ className, compact }: { className?: string; compact?: boolean }) {
  const values = useLiveValues();
  const current = useFertigationSetpoints();

  // Overview: just the small cards; the page gives the column its own header.
  if (compact) return <LiveReadings values={values} ranges={current.ranges} compact />;

  return (
    <Widget
      title="Fertigation"
      icon={FlaskConical}
      className={className}
      action={
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-accent)]">
            <span className="h-2 w-2 rounded-full bg-[var(--d-accent)] motion-safe:animate-pulse" aria-hidden="true" /> Live
            <ChartLine className="ml-1 h-4 w-4 text-[var(--d-muted)]" aria-hidden="true" />
          </span>
          <SetpointsLink area="fertigation" />
        </span>
      }
    >
      <LiveReadings values={values} ranges={current.ranges} />
    </Widget>
  );
}
