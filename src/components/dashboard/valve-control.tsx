"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronRight, CircleGauge, Faucet, Gauge, Infinity as InfinityIcon, Maximize2, Waves, X } from "lucide-react";

import { ModeSelector, useControllerModes } from "@/components/dashboard/controller-mode";
import { Toggle, Widget } from "@/components/dashboard/dashboard-widgets";
import { irrigationRule, setDevicePower, useActiveModel, useDevicePowers, useNow } from "@/components/dashboard/device-automation";
import { Pill, Stepper, type Tone } from "@/components/dashboard/page-kit";
import { ControlNote, type DeviceControl, useDeviceControl } from "@/components/dashboard/target-dialog";
import { type FarmPump, useFarmDevices } from "@/components/dashboard/farm-devices";
import { pumpOutletPressure } from "@/data/mock";
import type { FarmValve } from "@/types";

/**
 * Saved on/off for every pump and valve (added and removed on the Farm Monitor), and what each is actually doing:
 * a device in Auto follows the active irrigation model, otherwise it holds its saved state.
 */
function useIrrigationPower() {
  const { pumps, valves } = useFarmDevices();
  const names = [...pumps, ...valves].map((item) => item.name);
  const stored = useDevicePowers(names);
  const modes = useControllerModes(names);
  const model = useActiveModel("irrigation");
  const now = useNow();
  const running = names.map((_, index) => (modes[index] === "auto" ? irrigationRule(model.values, stored[index], now).on : stored[index]));
  const storedOf = (name: string) => stored[names.indexOf(name)] ?? false;
  const runningOf = (name: string) => running[names.indexOf(name)] ?? false;
  return { pumps, valves, stored: storedOf, running: runningOf, anyPumpOn: pumps.some((pump) => runningOf(pump.name)) };
}

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

// The valve's switch, by its mode. Lives outside the popup so the target window's overlay isn't trapped inside it.
function useValveControl(valve: FarmValve, stored: boolean, onChange: (next: Partial<FarmValve>) => void) {
  const { done } = valveStatus(valve);
  const setOpen = (open: boolean) => {
    // Reopening after a finished run starts a fresh delivery.
    if (open && done) onChange({ delivered: 0 });
    setDevicePower(valve.name, open);
  };
  // A volume target in Semi-auto becomes the valve's delivery volume.
  return useDeviceControl(valve.name, stored, setOpen, (target) => {
    if (target.option.key === "volume") onChange({ volume: target.value, infinite: false, delivered: 0 });
  });
}

function ValvePopup({ valve, stored, onChange, onClose }: { valve: FarmValve; stored: boolean; onChange: (next: Partial<FarmValve>) => void; onClose: () => void }) {
  const control = useValveControl(valve, stored, onChange);
  return (
    <>
      <ControlPopup open onClose={onClose} title={`${valve.name} controls`}>
        <ValveTile valve={valve} control={control} onChange={onChange} />
      </ControlPopup>
      {control.dialog}
    </>
  );
}

function ValveTile({ valve, control, onChange }: { valve: FarmValve; control: DeviceControl; onChange: (next: Partial<FarmValve>) => void }) {
  const { progress, status } = valveStatus(valve);

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

      <div className="mt-auto border-t border-[var(--d-line)] pt-3">
        <div className="flex items-center justify-between gap-2">
          <ModeSelector name={valve.name} />
          <Toggle size="sm" on={control.on} onChange={control.onToggle} label={`${valve.name} open`} disabled={control.locked} />
        </div>
        <ControlNote control={control} className="mt-2 text-center" />
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

// A pump's full controls, shown in its popup.
function PumpPanel({ pump, control, flow, pressure, openValves, totalValves }: { pump: FarmPump; control: DeviceControl; flow: number; pressure: number; openValves: number; totalValves: number }) {
  const stat = "rounded-lg bg-[var(--d-chip)] px-4 py-2.5";
  const on = control.on;
  return (
    <div className={`flex flex-wrap items-center gap-4 rounded-xl border border-[var(--d-card-border)] bg-[var(--d-inset)] p-4 transition-shadow hover:shadow-md ${on ? "ring-2 ring-[var(--d-tint,var(--d-accent))]" : ""}`}>
      <div className="flex min-w-[11rem] flex-1 items-center gap-3">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${on ? "bg-[var(--d-tint-soft,var(--d-accent-soft))]" : "bg-[var(--d-chip)]"}`}>
          <Waves className={`h-7 w-7 ${on ? "motion-safe:animate-pulse" : ""}`} style={{ color: on ? "var(--d-tint, var(--d-accent))" : "var(--d-muted)" }} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="text-base font-bold text-[var(--d-text)]">{pump.name}</div>
          <div className="text-[11px] text-[var(--d-muted)]">{pump.location}</div>
          <div className="mt-1">
            <Pill tone={on ? "accent" : "muted"}>{on ? "Running" : "Stopped"}</Pill>
          </div>
          <ControlNote control={control} className="mt-1 max-w-[16rem]" />
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
        <ModeSelector name={pump.name} />
        <Toggle on={on} onChange={control.onToggle} label={`${pump.name} power`} disabled={control.locked} />
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

function CompactPump({ pump, on, flow, pressure, openValves, totalValves, onOpen }: { pump: FarmPump; on: boolean; flow: number; pressure: number; openValves: number; totalValves: number; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} aria-label={`${pump.name}: ${on ? "running" : "stopped"}. Open controls`} className={`${compact} ${on ? "ring-2 ring-[var(--d-tint,var(--d-accent))]" : ""}`}>
      <span className="flex w-full items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${on ? "bg-[var(--d-tint-soft,var(--d-accent-soft))]" : "bg-[var(--d-chip)]"}`}>
          <Waves className={`h-5 w-5 ${on ? "motion-safe:animate-pulse" : ""}`} style={{ color: on ? "var(--d-tint, var(--d-accent))" : "var(--d-muted)" }} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-[var(--d-text)]">{pump.name}</span>
          <span className="block truncate text-[11px] text-[var(--d-muted)]">{pump.location}</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--d-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
      <span className="mt-3">
        <Pill tone={on ? "accent" : "muted"}>{on ? "Running" : "Stopped"}</Pill>
      </span>
      <span className="mt-3 grid w-full grid-cols-3 gap-3 border-t border-[var(--d-line)] pt-3">
        <CompactReading label="Flow" value={litres(flow)} unit="L/min" />
        <CompactReading label="Pressure" value={pressure.toFixed(1)} unit="bar" />
        <CompactReading label="Valves" value={String(openValves)} unit={`of ${totalValves}`} />
      </span>
    </button>
  );
}

// One pump: its card, its controls popup and its target window (kept outside the popup so the overlay isn't trapped).
function PumpUnit({ pump, stored, flow, openValves, totalValves }: { pump: FarmPump; stored: boolean; flow: number; openValves: number; totalValves: number }) {
  const control = useDeviceControl(pump.name, stored, (on) => setDevicePower(pump.name, on));
  const [open, setOpen] = useState(false);
  const pressure = control.on ? pumpOutletPressure : 0;
  const pumpFlow = control.on ? flow : 0;
  return (
    <>
      <CompactPump pump={pump} on={control.on} flow={pumpFlow} pressure={pressure} openValves={openValves} totalValves={totalValves} onOpen={() => setOpen(true)} />
      <ControlPopup open={open} onClose={() => setOpen(false)} title={`${pump.name} controls`} wide>
        <PumpPanel pump={pump} control={control} flow={pumpFlow} pressure={pressure} openValves={openValves} totalValves={totalValves} />
      </ControlPopup>
      {control.dialog}
    </>
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

type ValveRuntime = Partial<Pick<FarmValve, "delivered" | "volume" | "infinite">>;

// `embedded` drops the card so the tiles can sit inside another block (e.g. a tab).
export function ValveControl({ className, embedded }: { className?: string; embedded?: boolean }) {
  const power = useIrrigationPower();
  // Litres delivered and volume changes are kept here; open/closed comes from the shared device state (and the model in Auto).
  const [runtime, setRuntime] = useState<Record<string, ValveRuntime>>({});
  const valves: FarmValve[] = power.valves.map((setup) => ({
    ...setup,
    delivered: runtime[setup.id]?.delivered ?? setup.delivered ?? 0,
    volume: runtime[setup.id]?.volume ?? setup.volume,
    infinite: runtime[setup.id]?.infinite ?? setup.infinite,
    open: power.running(setup.name),
  }));
  const openValves = valves.filter((valve) => valve.open).length;
  const flow = valves.reduce((sum, valve) => sum + (valve.open ? valve.flowRate : 0), 0);
  const openList = valves.filter((valve) => valve.open);
  const openKey = openList.map((valve) => `${valve.id}:${valve.flowRate}:${valve.volume}:${valve.infinite}`).join(",");

  // Live delivery: open valves add their flow every second.
  useEffect(() => {
    if (!openKey) return;
    const open = openKey.split(",").map((part) => {
      const [id, rate, volume, infinite] = part.split(":");
      return { id, rate: Number(rate), volume: Number(volume), infinite: infinite === "true" };
    });
    const timer = window.setInterval(() => {
      setRuntime((current) => {
        const next = { ...current };
        for (const item of open) {
          const base = next[item.id]?.delivered ?? power.valves.find((valve) => valve.id === item.id)?.delivered ?? 0;
          const delivered = base + item.rate / 60;
          next[item.id] = { ...next[item.id], delivered: item.infinite ? delivered : Math.min(item.volume, delivered) };
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
    // power.valves only supplies the starting litres for a valve's first tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openKey]);

  // A valve closes itself once its volume is delivered.
  useEffect(() => {
    valves.forEach((valve) => {
      if (valve.open && power.stored(valve.name) && !valve.infinite && valve.delivered >= valve.volume) setDevicePower(valve.name, false);
    });
  });

  const [expanded, setExpanded] = useState<string | null>(null);
  const expandedValve = valves.find((valve) => valve.id === expanded);
  const update = (id: string, next: Partial<FarmValve>) => setRuntime((current) => ({ ...current, [id]: { ...current[id], ...next } }));
  const empty = (text: string) => <p className="rounded-xl border border-dashed border-[var(--d-card-border)] p-4 text-center text-xs text-[var(--d-muted)]">{text}</p>;

  const body = (
    <div className="grid gap-6 md:grid-cols-[minmax(13rem,16rem)_1fr]">
      <section aria-label="Pumps" className="flex flex-col">
        <SubHeading icon={Waves} title="Main Supply" detail={`${power.pumps.length} pump${power.pumps.length === 1 ? "" : "s"} · tap for controls`} />
        <div className="grid gap-3">
          {power.pumps.length === 0
            ? empty("No pumps. Add one under Add / remove.")
            : power.pumps.map((pump) => <PumpUnit key={pump.id} pump={pump} stored={power.stored(pump.name)} flow={flow} openValves={openValves} totalValves={valves.length} />)}
        </div>
      </section>

      <section aria-label="Field valves">
        <SubHeading icon={Faucet} title="Field Valves" detail={`${openValves} of ${valves.length} open · ${flow} L/min · tap a valve for controls`} />
        {valves.length === 0 ? (
          empty("No valves. Add one under Add / remove.")
        ) : (
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(10.5rem,1fr))]">
            {valves.map((valve) => (
              <CompactValve key={valve.id} valve={valve} onOpen={() => setExpanded(valve.id)} />
            ))}
          </div>
        )}
      </section>

      {expandedValve && <ValvePopup key={expandedValve.id} valve={expandedValve} stored={power.stored(expandedValve.name)} onChange={(next) => update(expandedValve.id, next)} onClose={() => setExpanded(null)} />}
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
  const power = useIrrigationPower();
  const open = power.valves.filter((valve) => power.running(valve.name));
  const flow = open.reduce((sum, valve) => sum + valve.flowRate, 0);
  const runningPumps = power.pumps.filter((pump) => power.running(pump.name)).length;
  const pumpLabel = power.pumps.length > 1 ? `Pumps: ${runningPumps} of ${power.pumps.length} running` : `Pump: ${power.anyPumpOn ? "Running" : "Stopped"}`;

  return (
    <div className={`dash-card flex flex-wrap items-center gap-3 rounded-xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-3 ${className ?? ""}`}>
      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--d-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--d-accent)]">
        <Waves className={`h-3.5 w-3.5 ${power.anyPumpOn ? "motion-safe:animate-pulse" : ""}`} aria-hidden="true" />
        {pumpLabel}
      </span>
      <ul className="order-last flex basis-full flex-wrap items-center gap-1.5" aria-label={`${open.length} of ${power.valves.length} valves open`}>
        {power.valves.map((valve) => {
          const valveOpen = power.running(valve.name);
          const label = `${valve.name} (${valve.zone}): ${valveOpen ? `open · ${valve.flowRate} L/min` : "closed"}`;
          return (
            <li key={valve.id} title={label} aria-label={label} className={`relative flex h-9 w-9 items-center justify-center rounded-lg ${valveOpen ? "bg-gradient-to-br from-[var(--d-accent-bright)] to-[var(--d-accent-strong)] text-white shadow-sm" : "bg-[var(--d-chip)] text-[var(--d-muted)]"}`}>
              <Faucet className="h-4 w-4" aria-hidden="true" />
              {valveOpen && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--d-card)] bg-[var(--d-accent-bright)]" />}
            </li>
          );
        })}
      </ul>
      <span className="text-xs text-[var(--d-muted)]">
        {open.length} of {power.valves.length} open · {flow} L/min
      </span>
      <Link href="/dashboard/irrigation" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--d-accent)] hover:underline">
        Irrigation <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
