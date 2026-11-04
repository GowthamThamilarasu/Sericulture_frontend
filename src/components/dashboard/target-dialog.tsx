"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Pencil, Plus, X } from "lucide-react";

import { useControllerMode } from "@/components/dashboard/controller-mode";
import { useAutoRule } from "@/components/dashboard/device-automation";
import { farmValveByName, isFarmPump } from "@/components/dashboard/farm-devices";
import { type ShedDeviceType, shedDeviceByName } from "@/components/dashboard/shed-devices";
import { fertigationReadings, sensorReadings } from "@/data/mock";

/** Something a device can be told to reach when it is switched on in Semi-auto mode. */
export type TargetOption = { key: string; label: string; verb: string; unit: string; min: number; max: number; step: number; current?: number; value: number };
export type Target = { option: TargetOption; value: number };

const current = (name: string) => sensorReadings.find((sensor) => sensor.name === name)?.value ?? 0;
const nutrient = (key: string) => fertigationReadings.find((item) => item.key === key)?.value ?? 0;

const temp = (verb: string, value: number): TargetOption => ({ key: "temp", label: "Temperature", verb, unit: "°C", min: 18, max: 35, step: 0.5, current: current("Temperature"), value });
const humidity = (verb: string, value: number): TargetOption => ({ key: "rh", label: "Humidity", verb, unit: "%", min: 50, max: 95, step: 1, current: current("Relative Humidity"), value });
const nh3: TargetOption = { key: "nh3", label: "NH₃", verb: "brings ammonia down to", unit: "ppm", min: 0, max: 10, step: 0.5, current: current("NH3"), value: 2 };
const co2: TargetOption = { key: "co2", label: "CO₂", verb: "brings CO₂ down to", unit: "ppm", min: 400, max: 1500, step: 50, current: current("CO2"), value: 600 };
const soil: TargetOption = { key: "soil", label: "Soil moisture", verb: "waters the field to", unit: "%", min: 20, max: 45, step: 1, current: current("Soil Moisture"), value: 35 };
const runTime = (value = 30, max = 240): TargetOption => ({ key: "time", label: "Run time", verb: "runs for", unit: "min", min: 1, max, step: 1, value });
const fans = [temp("cools the shed to", 25), nh3, co2];
const vents = [temp("opens until the shed cools to", 25), humidity("opens until humidity drops to", 75)];

// What a shed device asks for in Semi-auto mode, by its type (set up under Settings → Shed).
const shedTargets: Record<ShedDeviceType, TargetOption[]> = {
  heater: [temp("heats the shed to", 28)],
  cooling: [temp("cools the shed to", 25)],
  humidifier: [humidity("raises humidity to", 80)],
  fogger: [humidity("raises humidity to", 85)],
  exhaustFan: fans,
  boosterFan: fans,
  circulationFan: [runTime(60)],
  ventilation: vents,
  louvers: vents,
  curtains: vents,
  lights: [{ key: "hours", label: "Light time", verb: "stays on for", unit: "h", min: 1, max: 24, step: 1, value: 16 }],
};

// What each farm and fertigation device asks for in Semi-auto mode. Anything not listed asks for a run time.
const equipmentTargets: Record<string, TargetOption[]> = {
  // Irrigation
  "Solenoid Valve": [soil],
  "Drip Irrigation": [soil],
  // Fertigation
  "Dose Pump": [{ key: "ec", label: "EC", verb: "doses until EC reaches", unit: "mS/cm", min: 0.3, max: 3, step: 0.05, current: nutrient("ec"), value: 1.05 }],
  "Tank Filling Valve": [{ key: "tank", label: "Tank level", verb: "fills the tank to", unit: "%", min: 10, max: 100, step: 5, current: current("Water Tank"), value: 90 }],
  "Mixing Tank": [runTime(15, 120)],
  Agitator: [runTime(10, 120)],
};

const valveTargets = [soil, { key: "volume", label: "Water volume", verb: "delivers", unit: "L", min: 10, max: 10000, step: 10, value: 400 }];

export function targetsFor(name: string): TargetOption[] {
  if (farmValveByName(name)) return valveTargets;
  if (isFarmPump(name)) return [soil];
  const shed = shedDeviceByName(name);
  if (shed) return shedTargets[shed.type];
  return equipmentTargets[name] ?? [runTime()];
}

export const formatTarget = (target: Target) => `${target.value} ${target.option.unit}`;

export const modeNotes = { auto: "Follows the active model", semi: "Asks for a target when switched on", manual: "Plain on/off · no target" };

/**
 * On/off for any device, by its Auto / Semi-auto / Manual mode:
 * - Auto: locked; on/off follows the active automation model (see device-automation.ts).
 * - Semi-auto: switching on opens the target window; the device starts once a target is confirmed.
 * - Manual: switches straight on and off, no target asked.
 * `on`/`setOn` are the device's saved state; `onTarget` lets a device use the confirmed target (e.g. a valve's volume).
 */
export function useDeviceControl(name: string, on: boolean, setOn: (on: boolean) => void, onTarget?: (target: Target) => void) {
  const mode = useControllerMode(name);
  const auto = useAutoRule(name, on);
  const [target, setTarget] = useState<Target | null>(null);
  const [asking, setAsking] = useState(false);
  const running = mode === "auto" ? auto.on : on;

  const onToggle = () => {
    if (mode === "auto") return;
    if (running) {
      setTarget(null);
      setOn(false);
    } else if (mode === "semi") {
      setAsking(true);
    } else {
      setOn(true);
    }
  };

  const confirm = (next: Target) => {
    setTarget(next);
    setAsking(false);
    onTarget?.(next);
    if (!running) setOn(true);
  };

  const dialog = <TargetDialog name={name} options={targetsFor(name)} open={asking} running={running} initial={target} onConfirm={confirm} onCancel={() => setAsking(false)} />;
  const note = mode === "auto" ? (auto.modelName ? `${auto.modelName}: ${auto.reason}` : auto.reason) : modeNotes[mode];

  return { mode, on: running, onToggle, locked: mode === "auto", target: mode === "semi" && running ? target : null, editTarget: () => setAsking(true), dialog, note };
}

export type DeviceControl = ReturnType<typeof useDeviceControl>;

/** Line under a device: the Auto reason, the Semi-auto target (or a prompt to set one), or the mode note. */
export function ControlNote({ control, className }: { control: DeviceControl; className?: string }) {
  if (control.target) return <TargetLine target={control.target} onEdit={control.editTarget} />;
  if (control.mode === "semi" && control.on)
    return (
      <button type="button" onClick={control.editTarget} className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-[var(--d-accent)] hover:bg-[var(--d-chip)]">
        Set a target <Pencil className="h-3 w-3" aria-hidden="true" />
      </button>
    );
  return (
    <div className={`truncate text-[11px] text-[var(--d-muted)] ${className ?? ""}`} title={control.note}>
      {control.note}
    </div>
  );
}

function TargetDialog({
  name,
  options,
  open,
  running,
  initial,
  onConfirm,
  onCancel,
}: {
  name: string;
  options: TargetOption[];
  open: boolean;
  running: boolean;
  initial: Target | null;
  onConfirm: (target: Target) => void;
  onCancel: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && onCancel()}>
      {open && <TargetForm name={name} options={options} running={running} initial={initial} onConfirm={onConfirm} />}
    </Dialog.Root>
  );
}

// Mounted only while the window is open, so it starts from the current target each time.
function TargetForm({ name, options, running, initial, onConfirm }: { name: string; options: TargetOption[]; running: boolean; initial: Target | null; onConfirm: (target: Target) => void }) {
  const [optionKey, setOptionKey] = useState(initial?.option.key ?? options[0].key);
  const option = options.find((item) => item.key === optionKey) ?? options[0];
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(options.map((item) => [item.key, String(initial?.option.key === item.key ? initial.value : item.value)])));

  const raw = values[option.key];
  const value = Number(raw);
  const valid = raw.trim() !== "" && Number.isFinite(value) && value >= option.min && value <= option.max;
  const setValue = (next: number | string) => setValues((current) => ({ ...current, [option.key]: String(next) }));
  const nudge = (direction: 1 | -1) => {
    const base = Number.isFinite(value) ? value : option.value;
    const next = Math.min(option.max, Math.max(option.min, base + direction * option.step));
    setValue(Math.round(next * 100) / 100);
  };

  return (
    <>
      <Dialog.Overlay className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-[2px]" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[66] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (valid) onConfirm({ option, value });
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-lg font-semibold">{running ? `Change ${name} target` : `Turn on ${name}`}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-[var(--d-muted)]">Semi-auto mode: set what it should reach. It turns off once the target is reached.</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Cancel" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {options.length > 1 && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-[var(--d-soft)]">Run until</div>
              <div role="radiogroup" aria-label="Target to reach" className="mt-2 flex flex-wrap gap-2">
                {options.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    role="radio"
                    aria-checked={item.key === option.key}
                    onClick={() => setOptionKey(item.key)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      item.key === option.key ? "accent-fill" : "bg-[var(--d-chip)] text-[var(--d-text)] hover:bg-[var(--d-chip-hover)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 rounded-xl bg-[var(--d-card)] p-4">
            <div className="flex items-center justify-between text-xs text-[var(--d-muted)]">
              <label htmlFor="equipment-target">Target {option.label.toLowerCase()}</label>
              {option.current !== undefined && (
                <span>
                  Now{" "}
                  <span className="font-semibold tabular-nums text-[var(--d-text)]">
                    {option.current} {option.unit}
                  </span>
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <button type="button" onClick={() => nudge(-1)} aria-label="Decrease" className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--d-chip)] hover:bg-[var(--d-chip-hover)]">
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex items-baseline gap-1.5">
                <input
                  id="equipment-target"
                  type="number"
                  inputMode="decimal"
                  autoFocus
                  min={option.min}
                  max={option.max}
                  step={option.step}
                  value={raw}
                  onChange={(event) => setValue(event.target.value)}
                  aria-invalid={!valid}
                  className="w-24 rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] px-2 py-2 text-center text-2xl font-bold tabular-nums text-[var(--d-accent)] outline-none focus:border-[var(--d-accent)]"
                />
                <span className="text-sm font-semibold text-[var(--d-muted)]">{option.unit}</span>
              </div>
              <button type="button" onClick={() => nudge(1)} aria-label="Increase" className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--d-chip)] hover:bg-[var(--d-chip-hover)]">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className={`mt-2 text-center text-[11px] ${valid ? "text-[var(--d-muted)]" : "font-semibold text-[var(--d-danger)]"}`}>
              {valid ? `${name} ${option.verb} ${value} ${option.unit}` : `Enter a value from ${option.min} to ${option.max} ${option.unit}`}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close className="rounded-lg bg-[var(--d-chip)] px-4 py-2 text-sm font-medium hover:bg-[var(--d-chip-hover)]">Cancel</Dialog.Close>
            <button type="submit" disabled={!valid} className="rounded-lg accent-fill px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {running ? "Update target" : "Turn on"}
            </button>
          </div>
        </form>
      </Dialog.Content>
    </>
  );
}

/** "Target 28 °C · Change" line shown under a running device. */
export function TargetLine({ target, onEdit }: { target: Target; onEdit: () => void }) {
  return (
    <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-[var(--d-soft)] hover:bg-[var(--d-chip)]" title="Change target">
      Target{" "}
      <span className="font-semibold tabular-nums text-[var(--d-accent)]">
        {target.option.label} {formatTarget(target)}
      </span>
      <Pencil className="h-3 w-3" aria-hidden="true" />
    </button>
  );
}
