"use client";

import { ChartLine, DoorClosed, DoorOpen } from "lucide-react";

import type { Icon } from "@/components/dashboard/dashboard-widgets";
import { type HistoryParam, useOpenHistory } from "@/components/dashboard/history-dialog";
import { historyFor, reading } from "@/components/dashboard/monitor-widgets";
import { Co2Icon, HumidityIcon, LightSensorIcon, Nh3Icon, SoilEcIcon, SoilMoistureIcon, SoilPhIcon, SoilTemperatureIcon, TemperatureIcon, WaterLevelIcon } from "@/components/dashboard/sensor-icons";
import { type Tint, tintFor } from "@/components/dashboard/tints";
import { doorSensor } from "@/data/mock";

// Small icon-led reading card. The icon badge takes the colour of what it measures (water, heat, soil, ...)
// through the .tint-<name> tokens in globals.css; the card itself stays on the page's normal card colour.
// Each icon has a slow idle motion that speeds up on hover (.chip-* in globals.css, off for reduced motion).

export type ChipMotion = "bob" | "pulse" | "sway" | "spark" | "drift" | "glow" | "tick" | "swing";

const motionForTint: Record<Tint, ChipMotion> = {
  water: "bob",
  heat: "pulse",
  soil: "sway",
  nutrient: "spark",
  air: "drift",
  light: "glow",
  alert: "pulse",
};

export type SensorChipProps = {
  label: string;
  value: string | number;
  unit?: string;
  icon: Icon;
  tint?: Tint;
  motion?: ChipMotion;
  status?: string;
  warn?: boolean;
  note?: string;
  history?: HistoryParam;
};

/** Card props for a live sensor from the demo feed, with its history chart. */
export function chipFromReading(name: string, label: string, icon: Icon, tint: Tint, options: { historyLabel?: string; motion?: ChipMotion } = {}): SensorChipProps {
  const sensor = reading(name);
  return {
    label,
    value: sensor?.value ?? "–",
    unit: sensor?.unit === "pH" ? undefined : sensor?.unit,
    icon,
    tint,
    motion: options.motion,
    status: sensor ? `${sensor.status} · ${sensor.location}` : undefined,
    warn: sensor?.status === "Warning",
    history: historyFor(sensor, options.historyLabel ?? label, icon),
  };
}

/** Live field sensors, shared by the Overview and Farm Monitor. */
export const farmSensorChips = (): SensorChipProps[] => [
  chipFromReading("Water Tank", "Water Tank", WaterLevelIcon, "water", { historyLabel: "Water Tank 01" }),
  chipFromReading("Soil Moisture", "Soil Moisture", SoilMoistureIcon, "water"),
  chipFromReading("Soil Temperature", "Soil Temp.", SoilTemperatureIcon, "heat"),
  chipFromReading("Soil EC", "Soil EC", SoilEcIcon, "nutrient"),
  chipFromReading("Soil pH", "Soil pH", SoilPhIcon, "soil"),
];

/** Live shed sensors plus the door contact, shared by the Overview and Shed Monitor. */
export const shedSensorChips = (): SensorChipProps[] => {
  const doorOpen = doorSensor.state === "Open";
  return [
    chipFromReading("Temperature", "Temperature", TemperatureIcon, "heat", { historyLabel: "Shed Temperature" }),
    chipFromReading("Relative Humidity", "Humidity", HumidityIcon, "water", { historyLabel: "Shed Humidity" }),
    chipFromReading("NH3", "NH₃ Ammonia", Nh3Icon, "air"),
    chipFromReading("CO2", "CO₂", Co2Icon, "air"),
    chipFromReading("Light", "Light", LightSensorIcon, "light"),
    {
      label: "Door",
      value: doorSensor.state,
      icon: doorOpen ? DoorOpen : DoorClosed,
      tint: "soil",
      motion: "swing",
      status: doorSensor.state,
      warn: doorOpen,
      note: `Since ${doorSensor.since} · ${doorSensor.openedToday}× today`,
    },
  ];
};

// Small-card grid shared by the three Overview columns (Shed, Farm, Fertigation).
export const overviewGrid = "grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3";

// "sm" is the compact card used on the Overview, where three sections share the width.
type ChipSize = "md" | "sm";
const sizes = {
  md: { card: "px-3 pb-3.5 pt-4", badge: "h-14 w-14 rounded-2xl", icon: "h-7 w-7", gap: "mt-3", label: "text-[10px]", value: "text-2xl", status: "mt-2.5 text-[10px]" },
  sm: { card: "px-2 pb-2.5 pt-3", badge: "h-10 w-10 rounded-xl", icon: "h-5 w-5", gap: "mt-2", label: "text-[9px]", value: "text-lg", status: "mt-1.5 text-[9px]" },
};

export function SensorChip({ label, value, unit, icon: Icon, tint, motion, status, warn, note, history, index = 0, size = "md" }: SensorChipProps & { index?: number; size?: ChipSize }) {
  const openHistory = useOpenHistory();
  const tone = tint ?? tintFor(Icon);
  const tintCls = tone ? `tint-${tone}` : "";
  const s = sizes[size];
  const anim = warn ? "alert" : (motion ?? (tone ? motionForTint[tone] : "bob"));

  const iconColor = warn ? "var(--d-warn)" : "var(--d-tint, var(--d-accent))";
  const softColor = warn ? "var(--d-warn-soft)" : "var(--d-tint-soft, var(--d-accent-soft))";

  // Everything is centred: a soft glowing icon, the label, the value with its unit, then its bar and status.
  const body = (
    <>
      <span className="absolute right-2.5 top-2.5">
        {history ? (
          <ChartLine className="h-3.5 w-3.5 text-[var(--d-muted)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
        ) : (
          status && <StatusDot warn={warn} />
        )}
      </span>

      <span className={`relative mx-auto flex shrink-0 items-center justify-center ${s.badge} ${tintCls}`}>
        {/* Slow-breathing glow behind the icon. */}
        <span className="chip-halo absolute inset-0 rounded-full blur-md" style={{ backgroundColor: softColor }} aria-hidden="true" />
        <span
          className={`chip-badge relative flex items-center justify-center ${s.badge} ${warn ? "chip-badge-warn" : ""}`}
          style={{ background: `radial-gradient(circle at 30% 25%, color-mix(in srgb, ${iconColor} 22%, transparent), ${softColor} 70%)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${iconColor} 18%, transparent)` }}
        >
          <Icon className={`chip-icon chip-anim-${anim} ${s.icon}`} style={{ color: iconColor }} aria-hidden="true" />
        </span>
      </span>

      <div className={`w-full min-w-0 text-center ${s.gap}`}>
        <div className={`truncate font-semibold uppercase tracking-[0.14em] text-[var(--d-muted)] ${s.label}`}>{label}</div>
        <div className="mt-1 flex items-baseline justify-center gap-1 leading-none">
          <span key={String(value)} className={`chip-value font-bold tabular-nums ${s.value}`} style={{ color: warn ? "var(--d-warn)" : "var(--d-text)" }}>
            {value}
          </span>
          {unit && <span className="text-xs font-medium text-[var(--d-muted)]">{unit}</span>}
        </div>
      </div>

      {(note || (history && status)) && (
        <div className={`flex w-full min-w-0 items-center justify-center gap-1.5 text-[var(--d-muted)] ${s.status}`}>
          {history && status && <StatusDot warn={warn} />}
          <span className="truncate">{history && status ? status : note}</span>
        </div>
      )}
    </>
  );

  const card = `chip-card group relative flex min-w-0 flex-col items-center justify-center rounded-2xl dash-card border border-[var(--d-card-border)] bg-[var(--d-card)] text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${s.card}`;
  const style = { "--i": index } as React.CSSProperties;

  return history ? (
    <button type="button" onClick={() => openHistory(history)} style={style} className={`${card} hover:border-[var(--d-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--d-accent)] active:translate-y-0 active:scale-[0.98]`}>
      {body}
      <span className="sr-only">Show {history.label} history</span>
    </button>
  ) : (
    <div style={style} className={card}>
      {body}
    </div>
  );
}

/** Responsive grid of chips with a staggered entrance. */
export function SensorChipGrid({ items, className, size }: { items: SensorChipProps[]; className?: string; size?: ChipSize }) {
  return (
    <div className={`grid gap-3 ${className ?? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"}`}>
      {items.map((item, index) => (
        <SensorChip key={item.label} {...item} index={index} size={size} />
      ))}
    </div>
  );
}

function StatusDot({ warn }: { warn?: boolean }) {
  const color = warn ? "var(--d-warn)" : "var(--d-accent)";
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full rounded-full opacity-40 motion-safe:animate-ping" style={{ backgroundColor: color }} />
      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}
