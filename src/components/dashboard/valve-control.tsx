"use client";

import { useEffect, useState } from "react";
import { Faucet, Infinity as InfinityIcon, Waves } from "lucide-react";

import { ModeSelector, useControllerMode } from "@/components/dashboard/controller-mode";
import { Toggle, Widget } from "@/components/dashboard/dashboard-widgets";
import { TargetLine, useTargetedSwitch } from "@/components/dashboard/target-dialog";
import { actuators, farmValves } from "@/data/mock";
import type { FarmValve } from "@/types";

const litres = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: value < 100 ? 1 : 0 });

function ValveRow({ valve, onChange }: { valve: FarmValve; onChange: (next: Partial<FarmValve>) => void }) {
  const mode = useControllerMode(valve.name);
  const done = !valve.open && !valve.infinite && valve.delivered > 0 && valve.delivered >= valve.volume;
  const progress = valve.infinite ? null : Math.min(100, (valve.delivered / Math.max(valve.volume, 1)) * 100);

  const setOpen = () => {
    if (valve.open) return onChange({ open: false });
    // Reopening after a finished run starts a fresh delivery.
    onChange({ open: true, delivered: done ? 0 : valve.delivered });
  };

  return (
    <div className="rounded-md bg-[var(--d-inset)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Faucet className="h-5 w-5 shrink-0" style={{ color: valve.open ? "var(--d-accent)" : "var(--d-muted)" }} aria-hidden="true" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[var(--d-text)]">
              {valve.name} <span className="font-normal text-[var(--d-muted)]">· {valve.zone}</span>
            </div>
            <div className="text-[11px] text-[var(--d-muted)]">
              {valve.flowRate} L/min ·{" "}
              <span style={{ color: valve.open ? "var(--d-accent)" : undefined }} className="font-semibold">
                {valve.open ? "Open" : done ? "Completed" : "Closed"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ModeSelector name={valve.name} />
          <Toggle size="sm" on={valve.open} onChange={setOpen} label={`${valve.name} open`} disabled={mode === "auto"} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <label htmlFor={`${valve.id}-volume`} className="text-[var(--d-muted)]">
          Water volume
        </label>
        <div className={`flex items-center rounded-md border border-[var(--d-line)] bg-[var(--d-popup)] ${valve.infinite ? "opacity-50" : ""}`}>
          <input
            id={`${valve.id}-volume`}
            type="number"
            inputMode="numeric"
            min={1}
            step={10}
            value={valve.volume}
            disabled={valve.infinite}
            onChange={(event) => onChange({ volume: Math.max(0, Number(event.target.value) || 0) })}
            onBlur={() => valve.volume < 1 && onChange({ volume: 1 })}
            className="w-20 bg-transparent px-2 py-1.5 text-right font-semibold text-[var(--d-text)] outline-none disabled:cursor-not-allowed"
          />
          <span className="pr-2 text-[var(--d-muted)]">L</span>
        </div>
        <button
          type="button"
          aria-pressed={valve.infinite}
          onClick={() => onChange({ infinite: !valve.infinite })}
          title="Run until the valve is closed"
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-semibold transition-colors ${
            valve.infinite ? "bg-[var(--d-accent)] text-[var(--d-on-accent)]" : "bg-[var(--d-chip)] text-[var(--d-text)] hover:bg-[var(--d-chip-hover)]"
          }`}
        >
          <InfinityIcon className="h-4 w-4" aria-hidden="true" /> Infinite
        </button>
      </div>

      <div className="mt-3">
        {progress !== null && (
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--d-track)]" role="progressbar" aria-label={`${valve.name} delivered`} aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-[var(--d-accent)] transition-[width] duration-1000 ease-linear" style={{ width: `${progress}%` }} />
          </div>
        )}
        <div className="mt-1.5 text-[11px] text-[var(--d-muted)]">
          <span className="font-semibold tabular-nums text-[var(--d-text)]">{litres(valve.delivered)} L</span>
          {valve.infinite ? " delivered · runs until closed" : ` of ${litres(valve.volume)} L delivered`}
        </div>
      </div>
    </div>
  );
}

export function ValveControl({ className }: { className?: string }) {
  const [valves, setValves] = useState(farmValves);
  const [pumpOn, setPumpOn] = useState(() => actuators.find((item) => item.name === "Water Pump")?.status === "ON");
  const pumpMode = useControllerMode("Water Pump");
  const pump = useTargetedSwitch("Water Pump", pumpOn, () => setPumpOn((value) => !value));
  const anyOpen = valves.some((valve) => valve.open);
  const flow = valves.reduce((sum, valve) => sum + (valve.open ? valve.flowRate : 0), 0);

  // Live delivery: open valves add their flow every second and close themselves when the volume is reached.
  useEffect(() => {
    if (!anyOpen) return;
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
  }, [anyOpen]);

  const update = (id: string, next: Partial<FarmValve>) => setValves((current) => current.map((valve) => (valve.id === id ? { ...valve, ...next } : valve)));

  return (
    <Widget
      title="Valve Control"
      icon={Faucet}
      className={className}
      action={
        <span className="text-[11px] text-[var(--d-muted)]">
          Flow <span className="font-semibold tabular-nums text-[var(--d-text)]">{flow} L/min</span>
        </span>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-[var(--d-inset)] p-3">
          <div className="flex items-center gap-2.5">
            <Waves className="h-5 w-5" style={{ color: pumpOn ? "var(--d-accent)" : "var(--d-muted)" }} aria-hidden="true" />
            <div>
              <div className="text-sm font-semibold text-[var(--d-text)]">Water Pump</div>
              <div className="text-[11px] text-[var(--d-muted)]">{pumpOn ? "Running" : "Stopped"}</div>
              {pump.target && <TargetLine target={pump.target} onEdit={pump.editTarget} />}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModeSelector name="Water Pump" />
            <Toggle size="sm" on={pumpOn} onChange={pump.onToggle} label="Water Pump power" disabled={pumpMode === "auto"} />
            {pump.dialog}
          </div>
        </div>
        {valves.map((valve) => (
          <ValveRow key={valve.id} valve={valve} onChange={(next) => update(valve.id, next)} />
        ))}
      </div>
    </Widget>
  );
}
