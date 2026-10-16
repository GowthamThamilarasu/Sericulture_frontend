"use client";

import { useEffect, useState } from "react";
import { Faucet, Infinity as InfinityIcon, Waves } from "lucide-react";

import { ModeSelector, useControllerMode } from "@/components/dashboard/controller-mode";
import { Toggle, Widget } from "@/components/dashboard/dashboard-widgets";
import { Pill, Stepper, type Tone } from "@/components/dashboard/page-kit";
import { TargetLine, useTargetedSwitch } from "@/components/dashboard/target-dialog";
import { actuators, farmValves } from "@/data/mock";
import type { FarmValve } from "@/types";

const litres = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: value < 100 ? 1 : 0 });

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

function ValveTile({ valve, onChange }: { valve: FarmValve; onChange: (next: Partial<FarmValve>) => void }) {
  const mode = useControllerMode(valve.name);
  const done = !valve.open && !valve.infinite && valve.delivered > 0 && valve.delivered >= valve.volume;
  const progress = valve.infinite ? null : Math.min(100, (valve.delivered / Math.max(valve.volume, 1)) * 100);
  const status: { tone: Tone; label: string } = valve.open ? { tone: "accent", label: "Open" } : done ? { tone: "info", label: "Completed" } : { tone: "muted", label: "Closed" };

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
            <div className="truncate text-[11px] text-[var(--d-muted)]">
              {valve.zone} · {valve.flowRate} L/min
            </div>
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
function PumpPanel({ on, flow, openValves, totalValves, mode, onToggle, target, editTarget, dialog }: { on: boolean; flow: number; openValves: number; totalValves: number; mode: string; onToggle: () => void } & Pick<ReturnType<typeof useTargetedSwitch>, "target" | "editTarget" | "dialog">) {
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
        <div className={stat}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">Flow</div>
          <div className="text-xl font-bold tabular-nums text-[var(--d-text)]">
            {flow}
            <span className="ml-1 text-xs font-medium text-[var(--d-muted)]">L/min</span>
          </div>
        </div>
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

  const update = (id: string, next: Partial<FarmValve>) => setValves((current) => current.map((valve) => (valve.id === id ? { ...valve, ...next } : valve)));

  const body = (
    <div className="space-y-6">
      <section aria-label="Water pump">
        <SubHeading icon={Waves} title="Main Supply" detail="The pump feeds every field valve below" />
        <PumpPanel on={pumpOn} flow={flow} openValves={openValves} totalValves={valves.length} mode={pumpMode} onToggle={pump.onToggle} target={pump.target} editTarget={pump.editTarget} dialog={pump.dialog} />
      </section>

      <section aria-label="Field valves">
        <SubHeading icon={Faucet} title="Field Valves" detail={`${openValves} of ${valves.length} open · ${flow} L/min`} />
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(12.5rem,1fr))]">
          {valves.map((valve) => (
            <ValveTile key={valve.id} valve={valve} onChange={(next) => update(valve.id, next)} />
          ))}
        </div>
      </section>
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
