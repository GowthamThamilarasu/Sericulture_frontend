"use client";

import { useEffect, useState } from "react";
import { ChartLine, FlaskConical } from "lucide-react";

import { Widget } from "@/components/dashboard/dashboard-widgets";
import { useOpenHistory } from "@/components/dashboard/history-dialog";
import { fertigationReadings, fertigationSessions } from "@/data/mock";
import type { FertigationReading } from "@/types";

type Values = Record<FertigationReading["key"], number>;

const initialValues = Object.fromEntries(fertigationReadings.map((item) => [item.key, item.value])) as Values;

// Demo feed: each reading drifts a little every two seconds; TDS follows EC (ppm ≈ EC × 640).
function nextValues(current: Values): Values {
  const next = { ...current };
  for (const item of fertigationReadings) {
    if (item.key === "tds") continue;
    const span = item.max - item.min;
    const value = current[item.key] + (Math.random() - 0.5) * span * 0.08;
    next[item.key] = Math.min(item.max + span * 0.2, Math.max(item.min - span * 0.2, value));
  }
  next.tds = next.ec * 640;
  return next;
}

export function FertigationBoard({ className }: { className?: string }) {
  const [values, setValues] = useState(initialValues);
  const session = fertigationSessions[0];
  const openHistory = useOpenHistory();

  useEffect(() => {
    const timer = window.setInterval(() => setValues(nextValues), 2000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Widget
      title="Fertigation"
      icon={FlaskConical}
      className={className}
      action={
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-accent)]">
          <span className="h-2 w-2 rounded-full bg-[var(--d-accent)] motion-safe:animate-pulse" aria-hidden="true" /> Live
          <ChartLine className="ml-1 h-4 w-4 text-[var(--d-muted)]" aria-hidden="true" />
        </span>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="rounded-full bg-[var(--d-accent-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-accent)]">{session.status}</span>
        <span className="text-[var(--d-soft)]">{session.recipe}</span>
        <span className="text-[var(--d-muted)]">
          Target EC {session.ecTarget} · Dose {session.dose} mL
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-live="off">
        {fertigationReadings.map((item) => {
          const value = values[item.key];
          const status = value < item.min ? "Low" : value > item.max ? "High" : "OK";
          const color = status === "OK" ? "var(--d-accent)" : "var(--d-warn)";
          return (
            <button
              key={item.key}
              type="button"
              onClick={() =>
                openHistory({
                  key: `fertigation-${item.key}`,
                  label: `${item.name} (${item.label})`,
                  unit: item.unit,
                  decimals: item.decimals,
                  value: Number(value.toFixed(item.decimals)),
                  icon: FlaskConical,
                  target: [item.min, item.max],
                  noise: (item.max - item.min) * 0.06,
                  floor: 0,
                })
              }
              className="rounded-md bg-[var(--d-inset)] p-3 text-left transition-colors hover:ring-2 hover:ring-[var(--d-accent)]"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold text-[var(--d-text)]">{item.label}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color }}>
                  {status}
                </span>
              </div>
              <div className="truncate text-[10px] text-[var(--d-muted)]">{item.name}</div>
              <div className="mt-2 text-2xl font-bold tabular-nums" style={{ color }}>
                {value.toFixed(item.decimals)}
                {item.unit && <span className="ml-1 text-xs font-medium text-[var(--d-muted)]">{item.unit}</span>}
              </div>
              <div className="mt-1 text-[10px] text-[var(--d-muted)]">
                Target {item.min}–{item.max}
              </div>
              <span className="sr-only">Show {item.name} history</span>
            </button>
          );
        })}
      </div>
    </Widget>
  );
}
