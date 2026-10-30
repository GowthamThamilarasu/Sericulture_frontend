"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronRight, CircleGauge, Faucet, Gauge, Infinity as InfinityIcon, Maximize2, Waves, X } from "lucide-react";

import { ModeSelector, useControllerMode } from "@/components/dashboard/controller-mode";
import { Toggle, Widget } from "@/components/dashboard/dashboard-widgets";
import { Pill, Stepper, type Tone } from "@/components/dashboard/page-kit";
import { TargetLine, useTargetedSwitch } from "@/components/dashboard/target-dialog";
import { actuators, farmValves, pumpOutletPressure } from "@/data/mock";
import type { FarmValve } from "@/types";

const litres = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: value < 100 ? 1 : 0 });

// Flow meter and pressure sensor readings, shown on the pump panel and on every valve tile.
function SensorReadings({ flow, pressure, large }: { flow: number; pressure: number; large?: boolean }) {
  const items = [
    { label: "Flow", value: litres(flow), unit: "L/min", icon: Gauge },
    { label: "Pressure", value: pressure.toFixed(1), unit: "bar", icon: CircleGauge },
  ];
  return (
    <>
      {items.map((item) => (
        <div key={item.label} className={`rounded-lg bg-[var(--d-chip)] ${large ? "px-4 py-2.5" : "px-2.5 py-2"}`}>
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">
            <item.icon className="h-3 w-3" aria-hidden="true" />
            {item.label}
          </div>
          <div className={`font-bold tabular-nums text-[var(--d-text)] ${large ? "text-xl" : "text-base"}`}>
            {item.value}
            <span className="ml-1 text-xs font-medium text-[var(--d-muted)]">{item.unit}</span>
          </div>
        </div>
      ))}
    </>
  );
}

const tile = "flex min-h-[19rem] flex-col rounded-xl border border-[var(--d-card-border)] bg-[var(--d-inset)] p-4 transition-shadow hover:shadow-md";

// Delivery ring: share of the target volume delivered, or a spinning arc for open-ended runs.
function DeliveryRing({ progress, open, children }: { progress: number | null; open: boolean; children: React.ReactNode }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const shown = progress ?? 25;
  return (
    <div className="relative mx-auto h-28 w-28">
      <svg viewBox="0 0 100 100" className={`h-full w-full -rotate-90 ${progress === null && open ? "motion-safe:animate-spin [animation-duration:3s]" : ""}`} aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="8" style={{ stroke: "var(--d-track)" }} />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(shown / 100) * circumference} ${circumference}`}
          className="transition-[stroke-dasharray] duration-1000 ease-linear"
          style={{ stroke: open || (progress ?? 0) > 0 ? "var(--d-tint, var(--d-accent))" : "var(--d-track)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

function valveStatus(valve: FarmValve) {
  const done = !valve.open && !valve.infinite && valve.delivered > 0 && valve.delivered >= valve.volume;
  const progress = valve.infinite ? null : Math.min(100, (valve.delivered / Math.max(valve.volume, 1)) * 100);
  const status: { tone: Tone; label: string } = valve.open ? { tone: "accent", label: "Open" } : done ? { tone: "info", label: "Completed" } : { tone: "muted", label: "Closed" };
  return { done, progress, status };
}

function ValveTile({ valve, onChange }: { valve: FarmValve; onChange: (next: Partial<FarmValve>) => void }) {
  const mode = useControllerMode(valve.name);
  const { done, progress, status } = valveStatus(valve);

  const setOpen = () => {
    if (valve.open) return onChange({ open: false });
    // Reopening after a finished run starts a fresh delivery.
    onChange({ open: true, delivered: done ? 0 : valve.delivered });
  };

  return (
    <div className={`${tile} ${valve.open ? "ring-2 ring-[var(--d-tint,var(--d-accent))]" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: valve.open ? "var(--d-tint-soft, var(--d-accent-soft))" : "var(--d-chip)" }}>
            <Faucet className="h-4 w-4" style={{ color: valve.open ? "var(--d-tint, var(--d-accent))" : "var(--d-muted)" }} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-[var(--d-text)]">{valve.name}</div>
            <div className="truncate text-[11px] text-[var(--d-muted)]">{valve.zone}</div>
          </div>
        </div>
      </div>

      <div className="my-3">
        <DeliveryRing progress={progress} open={valve.open}>
          <div className="text-lg font-bold tabular-nums leading-none text-[var(--d-text)]">{litres(valve.delivered)}</div>
          <div className="mt-1 text-[10px] text-[var(--d-muted)]">{valve.infinite ? "L · no limit" : `of ${litres(valve.volume)} L`}</div>
        </DeliveryRing>
        <div className="mt-2 text-center">
          <Pill tone={status.tone}>{status.label}</Pill>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <SensorReadings flow={valve.open ? valve.flowRate : 0} pressure={valve.open ? valve.pressure : 0} />
      </div>

      <div className="flex items-end gap-2">
        <div className={`min-w-0 flex-1 transition-opacity ${valve.infinite ? "pointer-events-none opacity-40" : ""}`} aria-disabled={valve.infinite}>
          <Stepper id={`${valve.id}-volume`} label="Water volume" value={valve.volume} step={10} decimals={0} min={10} max={10000} unit="L" onChange={(volume) => onChange({ volume })} />
        </div>
        <button
          type="button"
          aria-pressed={valve.infinite}
          aria-label="Infinite: run until closed"
          onClick={() => onChange({ infinite: !valve.infinite })}
          title="Run until the valve is closed"
          className={`flex h-[38px] w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
            valve.infinite ? "border-transparent bg-[var(--d-tint,var(--d-accent))] text-[var(--d-popup)]" : "border-[var(--d-line)] bg-[var(--d-popup)] text-[var(--d-muted)] hover:text-[var(--d-text)]"
          }`}
        >
          <InfinityIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--d-line)] pt-3">
        <ModeSelector name={valve.name} />
        <Toggle size="sm" on={valve.open} onChange={setOpen} label={`${valve.name} open`} disabled={mode === "auto"} />
      </div>
    </div>
  );
}

function SubHeading({ icon: Icon, title, detail }: { icon: typeof Waves; title: string; detail: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--d-text)]">
        <Icon className="h-4 w-4" style={{ color: "var(--d-tint, var(--d-accent))" }} aria-hidden="true" />
        {title}
      </h3>
      <span className="text-[11px] text-[var(--d-muted)]">{detail}</span>
    </div>
  );
}

// The pump feeds every valve, so it gets its own wide panel above the valve grid.
function PumpPanel({ on, flow, pressure, openValves, totalValves, mode, onToggle, target, editTarget, dialog }: { on: boolean; flow: number; pressure: number; openValves: number; totalValves: number; mode: string; onToggle: () => void } & Pick<ReturnType<typeof useTargetedSwitch>, "target" | "editTarget" | "dialog">) {
  const stat = "rounded-lg bg-[var(--d-chip)] px-4 py-2.5";
  return (
    <div className={`flex flex-wrap items-center gap-4 rounded-xl border border-[var(--d-card-border)] bg-[var(--d-inset)] p-4 transition-shadow hover:shadow-md ${on ? "ring-2 ring-[var(--d-tint,var(--d-accent))]" : ""}`}>
      <div className="flex min-w-[11rem] flex-1 items-center gap-3">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${on ? "bg-[var(--d-tint-soft,var(--d-accent-soft))]" : "bg-[var(--d-chip)]"}`}>
          <Waves className={`h-7 w-7 ${on ? "motion-safe:animate-pulse" : ""}`} style={{ color: on ? "var(--d-tint, var(--d-accent))" : "var(--d-muted)" }} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="text-base font-bold text-[var(--d-text)]">Water Pump</div>
          <div className="text-[11px] text-[var(--d-muted)]">Main line</div>
          <div className="mt-1">
            <Pill tone={on ? "accent" : "muted"}>{on ? "Running" : "Stopped"}</Pill>
          </div>
          {target && <TargetLine target={target} onEdit={editTarget} />}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <SensorReadings flow={flow} pressure={pressure} large />
        <div className={stat}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">Valves open</div>
          <div className="text-xl font-bold tabular-nums text-[var(--d-text)]">
            {openValves}
            <span className="ml-1 text-xs font-medium text-[var(--d-muted)]">of {totalValves}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 border-l border-[var(--d-line)] pl-4">
        <ModeSelector name="Water Pump" />
        <Toggle on={on} onChange={onToggle} label="Water Pump power" disabled={mode === "auto"} />
        {dialog}
      </div>
    </div>
  );
}

const compact =
  "group flex w-full flex-col rounded-xl border border-[var(--d-card-border)] bg-[var(--d-inset)] p-3 text-left transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--d-accent)]";

function CompactReading({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <span className="min-w-0">
      <span className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">{label}</span>
      <span className="text-sm font-bold tabular-nums text-[var(--d-text)]">
        {value}
        <span className="ml-0.5 text-[10px] font-medium text-[var(--d-muted)]">{unit}</span>
      </span>
    </span>
  );
}

// Small summary card; clicking it opens the full controls in a popup.
function CompactValve({ valve, onOpen }: { valve: FarmValve; onOpen: () => void }) {
  const { progress, status } = valveStatus(valve);
  return (
    <button type="button" onClick={onOpen} aria-label={`${valve.name}: ${status.label}. Open controls`} className={`${compact} ${valve.open ? "ring-2 ring-[var(--d-tint,var(--d-accent))]" : ""}`}>
      <span className="flex w-full items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: valve.open ? "var(--d-tint-soft, var(--d-accent-soft))" : "var(--d-chip)" }}>
          <Faucet className="h-4 w-4" style={{ color: valve.open ? "var(--d-tint, var(--d-accent))" : "var(--d-muted)" }} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-[var(--d-text)]">{valve.name}</span>
          <span className="block truncate text-[11px] text-[var(--d-muted)]">{valve.zone}</span>
        </span>
        <Maximize2 className="h-3.5 w-3.5 shrink-0 text-[var(--d-muted)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      </span>
      <span className="mt-2.5 flex items-center justify-between gap-2">
        <Pill tone={status.tone}>{status.label}</Pill>
        <span className="text-[11px] tabular-nums text-[var(--d-muted)]">{valve.infinite ? `${litres(valve.delivered)} L` : `${litres(valve.delivered)} / ${litres(valve.volume)} L`}</span>
      </span>
      <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-[var(--d-track)]">
        <span
          className={`block h-full rounded-full transition-[width] duration-1000 ease-linear ${progress === null && valve.open ? "motion-safe:animate-pulse" : ""}`}
          style={{ width: `${progress ?? (valve.open ? 100 : 0)}%`, backgroundColor: "var(--d-tint, var(--d-accent))" }}
        />
      </span>
      <span className="mt-2.5 grid w-full grid-cols-2 gap-2">
        <CompactReading label="Flow" value={litres(valve.open ? valve.flowRate : 0)} unit="L/min" />
        <CompactReading label="Pressure" value={(valve.open ? valve.pressure : 0).toFixed(1)} unit="bar" />
      </span>
    </button>
  );
}

function CompactPump({ on, flow, pressure, openValves, totalValves, onOpen }: { on: boolean; flow: number; pressure: number; openValves: number; totalValves: number; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} aria-label={`Water Pump: ${on ? "running" : "stopped"}. Open controls`} className={`${compact} flex-1 ${on ? "ring-2 ring-[var(--d-tint,var(--d-accent))]" : ""}`}>
      <span className="flex w-full items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${on ? "bg-[var(--d-tint-soft,var(--d-accent-soft))]" : "bg-[var(--d-chip)]"}`}>
          <Waves className={`h-5 w-5 ${on ? "motion-safe:animate-pulse" : ""}`} style={{ color: on ? "var(--d-tint, var(--d-accent))" : "var(--d-muted)" }} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-[var(--d-text)]">Water Pump</span>
          <span className="block text-[11px] text-[var(--d-muted)]">Main line</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--d-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
      <span className="mt-3">
        <Pill tone={on ? "accent" : "muted"}>{on ? "Running" : "Stopped"}</Pill>
      </span>
      <span className="mt-auto grid w-full grid-cols-3 gap-3 border-t border-[var(--d-line)] pt-3">
        <CompactReading label="Flow" value={litres(flow)} unit="L/min" />
        <CompactReading label="Pressure" value={pressure.toFixed(1)} unit="bar" />
        <CompactReading label="Valves" value={String(openValves)} unit={`of ${totalValves}`} />
      </span>
    </button>
  );
}

// Popup holding a device's full controls. Not portalled, so it keeps the dashboard theme variables.
function ControlPopup({ open, onClose, title, wide, children }: { open: boolean; onClose: () => void; title: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && onClose()}>
      {open && (
        <>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]" />
          <Dialog.Content
            aria-describedby={undefined}
            className={`fixed left-1/2 top-1/2 z-[61] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--d-line)] bg-[var(--d-popup)] p-4 text-[var(--d-text)] shadow-2xl ${wide ? "max-w-3xl" : "max-w-sm"}`}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
              <Dialog.Close aria-label="Close" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>
            {children}
          </Dialog.Content>
        </>
      )}
    </Dialog.Root>
  );
}

// `embedded` drops the card so the tiles can sit inside another block (e.g. a tab).
export function ValveControl({ className, embedded }: { className?: string; embedded?: boolean }) {
  const [valves, setValves] = useState(farmValves);
  const [pumpOn, setPumpOn] = useState(() => actuators.find((item) => item.name === "Water Pump")?.status === "ON");
  const pumpMode = useControllerMode("Water Pump");
  const pump = useTargetedSwitch("Water Pump", pumpOn, () => setPumpOn((value) => !value));
  const openValves = valves.filter((valve) => valve.open).length;
  const flow = valves.reduce((sum, valve) => sum + (valve.open ? valve.flowRate : 0), 0);

  // Live delivery: open valves add their flow every second and close themselves when the volume is reached.
  useEffect(() => {
    if (!openValves) return;
    const timer = window.setInterval(() => {
      setValves((current) =>
        current.map((valve) => {
          if (!valve.open) return valve;
          const delivered = valve.delivered + valve.flowRate / 60;
          return !valve.infinite && delivered >= valve.volume ? { ...valve, delivered: valve.volume, open: false } : { ...valve, delivered };
        }),
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [openValves]);

  const [expanded, setExpanded] = useState<string | null>(null);
  const expandedValve = valves.find((valve) => valve.id === expanded);
  const pumpPressure = pumpOn ? pumpOutletPressure : 0;

  const update = (id: string, next: Partial<FarmValve>) => setValves((current) => current.map((valve) => (valve.id === id ? { ...valve, ...next } : valve)));

  const body = (
    <div className="grid gap-6 md:grid-cols-[minmax(13rem,16rem)_1fr]">
      <section aria-label="Water pump" className="flex flex-col">
        <SubHeading icon={Waves} title="Main Supply" detail="Feeds every valve · tap for controls" />
        <CompactPump on={pumpOn} flow={flow} pressure={pumpPressure} openValves={openValves} totalValves={valves.length} onOpen={() => setExpanded("pump")} />
      </section>

      <section aria-label="Field valves">
        <SubHeading icon={Faucet} title="Field Valves" detail={`${openValves} of ${valves.length} open · ${flow} L/min · tap a valve for controls`} />
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(10.5rem,1fr))]">
          {valves.map((valve) => (
            <CompactValve key={valve.id} valve={valve} onOpen={() => setExpanded(valve.id)} />
          ))}
        </div>
      </section>

      <ControlPopup open={expanded === "pump"} onClose={() => setExpanded(null)} title="Water Pump controls" wide>
        <PumpPanel on={pumpOn} flow={flow} pressure={pumpPressure} openValves={openValves} totalValves={valves.length} mode={pumpMode} onToggle={pump.onToggle} target={pump.target} editTarget={pump.editTarget} dialog={null} />
      </ControlPopup>
      <ControlPopup open={!!expandedValve} onClose={() => setExpanded(null)} title={expandedValve ? `${expandedValve.name} controls` : "Valve controls"}>
        {expandedValve && <ValveTile valve={expandedValve} onChange={(next) => update(expandedValve.id, next)} />}
      </ControlPopup>
      {/* The pump's target window sits outside the popup so its fixed overlay isn't trapped by the popup's transform. */}
      {pump.dialog}
    </div>
  );

  if (embedded) return body;
  return (
    <Widget
      title="Pump & Valves"
      icon={Faucet}
      className={className}
      action={
        <span className="text-[11px] text-[var(--d-muted)]">
          Flow <span className="font-semibold tabular-nums text-[var(--d-text)]">{flow} L/min</span>
        </span>
      }
    >
      {body}
    </Widget>
  );
}

/** One-line pump and valve status for the Overview, like the climate strip on the shed side. Controls are on the Irrigation tab. */
export function ValveStatusStrip({ className }: { className?: string }) {
  const pumpOn = actuators.find((item) => item.name === "Water Pump")?.status === "ON";
  const open = farmValves.filter((valve) => valve.open);
  const flow = open.reduce((sum, valve) => sum + valve.flowRate, 0);

  return (
    <div className={`dash-card flex flex-wrap items-center gap-3 rounded-xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-3 ${className ?? ""}`}>
      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--d-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--d-accent)]">
        <Waves className={`h-3.5 w-3.5 ${pumpOn ? "motion-safe:animate-pulse" : ""}`} aria-hidden="true" />
        Pump: {pumpOn ? "Running" : "Stopped"}
      </span>
      <ul className="flex flex-1 flex-wrap items-center gap-1.5" aria-label={`${open.length} of ${farmValves.length} valves open`}>
        {farmValves.map((valve) => {
          const label = `${valve.name} (${valve.zone}): ${valve.open ? `open · ${valve.flowRate} L/min` : "closed"}`;
          return (
            <li key={valve.id} title={label} aria-label={label} className={`relative flex h-9 w-9 items-center justify-center rounded-lg ${valve.open ? "bg-gradient-to-br from-[#6fe07f] to-[#00a218] text-white shadow-sm" : "bg-[var(--d-chip)] text-[var(--d-muted)]"}`}>
              <Faucet className="h-4 w-4" aria-hidden="true" />
              {valve.open && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--d-card)] bg-[#6fe07f]" />}
            </li>
          );
        })}
      </ul>
      <span className="text-xs text-[var(--d-muted)]">
        {open.length} of {farmValves.length} open · {flow} L/min
      </span>
      <Link href="/dashboard/irrigation" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--d-accent)] hover:underline">
        Irrigation <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
