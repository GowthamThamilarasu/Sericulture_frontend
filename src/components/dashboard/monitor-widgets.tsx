"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight, Layers, SlidersVertical } from "lucide-react";

import { type Icon, Widget } from "@/components/dashboard/dashboard-widgets";
import { type HistoryParam } from "@/components/dashboard/history-dialog";
import { type AutomationArea } from "@/components/dashboard/automation-models";
import { alertItems, sensorReadings } from "@/data/mock";

// Monitoring widgets shared by the Overview and the Farm Monitor tab. Colors come from the .dash-theme tokens in globals.css.

// Normal-state colour: the box's section tint when it has one, else the accent green.
export const green = "var(--d-tint, var(--d-accent))";
export const muted = "var(--d-muted)";
export const amber = "var(--d-warn)";

/** Link to an area on the Automation tab. Irrigation has no set points there (its models drive it), so it links to the models. */
export function SetpointsLink({ area, className }: { area: AutomationArea; className?: string }) {
  const Icon = area === "irrigation" ? Layers : SlidersVertical;
  return (
    <Link
      href={`/dashboard/automation/?area=${area}`}
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-[var(--d-accent-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--d-accent)] transition-colors hover:accent-fill ${className ?? ""}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" /> {area === "irrigation" ? "Models" : "Set points"}
      <ChevronRight className="h-3 w-3" aria-hidden="true" />
    </Link>
  );
}

export const formatCoordinate = (value: number, positive: string, negative: string) => `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;

export const reading = (name: string) => sensorReadings.find((sensor) => sensor.name === name);

// How each reading behaves in its demo history: day/night swing, random wander, limits and target band.
const historySpec: Record<string, Pick<HistoryParam, "swing" | "noise" | "floor" | "ceil" | "target">> = {
  "Water Tank": { noise: 3, floor: 0, ceil: 100, target: [30, 100] },
  "Soil Moisture": { swing: -2, noise: 1, floor: 0, ceil: 100, target: [20, 45] },
  "Soil Temperature": { swing: 3, noise: 0.4, target: [20, 32] },
  "Soil EC": { noise: 0.04, floor: 0, target: [0.6, 1.2] },
  "Soil pH": { noise: 0.06, floor: 0, ceil: 14, target: [6, 7.5] },
  Temperature: { swing: 2.5, noise: 0.4, target: [23, 28] },
  "Relative Humidity": { swing: -6, noise: 1.5, floor: 0, ceil: 100, target: [70, 85] },
  NH3: { swing: 0.6, noise: 0.4, floor: 0, target: [0, 5] },
  CO2: { swing: 60, noise: 40, floor: 350, target: [400, 1000] },
  Light: { swing: 4, noise: 1, floor: 0, target: [10, 30] },
};

export function historyFor(sensor: ReturnType<typeof reading>, label: string, icon: Icon): HistoryParam | undefined {
  if (!sensor) return undefined;
  return {
    key: sensor.id,
    label,
    unit: sensor.unit,
    value: sensor.value,
    decimals: (String(sensor.value).split(".")[1] ?? "").length,
    icon,
    ...(historySpec[sensor.name] ?? { noise: 1 }),
  };
}

export const farmAlerts = alertItems.filter((alert) => !alert.location.startsWith("Shed"));
export const shedAlerts = alertItems.filter((alert) => alert.location.startsWith("Shed"));

const severityColor: Record<string, string> = {
  Warning: amber,
  "Sensor Failure": "var(--d-danger)",
  Information: "var(--d-info)",
  "AI Recommendation": "var(--d-accent)",
};

export function SectionHeader({ icon: Icon, title, detail, action }: { icon: Icon; title: string; detail: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3 border-b border-[var(--d-line)] pb-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--d-accent-soft)" }}>
        <Icon className="h-5 w-5" style={{ color: green }} aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-base font-semibold text-[var(--d-text)]">{title}</h2>
        <div className="text-xs text-[var(--d-muted)]">{detail}</div>
      </div>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}

export function ReadingTile({ sensor, label, icon }: { sensor: ReturnType<typeof reading>; label: string; icon: Icon }) {
  const warn = sensor?.status === "Warning";
  return (
    <Widget title={label} icon={icon} history={historyFor(sensor, label, icon)}>
      <div className="flex flex-1 flex-col items-center justify-center py-3 text-center">
        <div className="text-2xl font-bold sm:text-3xl" style={{ color: warn ? amber : green }}>
          {sensor?.value}
        </div>
        <div className="mt-1 text-xs text-[var(--d-muted)]">{sensor?.unit}</div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.15em]" style={{ color: warn ? amber : muted }}>
          {sensor?.status}
        </div>
      </div>
    </Widget>
  );
}

export function AlertList({ items, className }: { items: typeof alertItems; className?: string }) {
  return (
    <Widget title="Alerts" icon={AlertTriangle} className={className}>
      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-6 text-xs text-[var(--d-muted)]">No open alerts</div>
      ) : (
        <div className="space-y-3">
          {items.map((alert) => (
            <div key={alert.id} className="rounded-md bg-[var(--d-inset)] p-3" style={{ borderLeft: `3px solid ${severityColor[alert.severity] ?? muted}` }}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: severityColor[alert.severity] ?? muted }}>
                  {alert.severity}
                </div>
                <div className="text-[10px] text-[var(--d-muted)]">
                  {alert.timestamp} · {alert.location}
                </div>
              </div>
              <div className="mt-1 text-sm font-semibold text-[var(--d-text)]">
                {alert.parameter}: {alert.value}
              </div>
              <div className="mt-1 text-xs leading-5 text-[var(--d-soft)]">{alert.recommendedAction}</div>
            </div>
          ))}
        </div>
      )}
    </Widget>
  );
}
