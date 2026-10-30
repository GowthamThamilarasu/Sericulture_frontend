"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Pencil, Plus, X } from "lucide-react";

import { useControllerMode } from "@/components/dashboard/controller-mode";
import { sensorReadings } from "@/data/mock";

/** Something a piece of equipment can be told to reach when it is switched on by hand. */
export type TargetOption = { key: string; label: string; verb: string; unit: string; min: number; max: number; step: number; current: number; value: number };
export type Target = { option: TargetOption; value: number };

const current = (name: string) => sensorReadings.find((sensor) => sensor.name === name)?.value ?? 0;

// What each piece of equipment asks for when it is turned on in manual mode.
export const equipmentTargets: Record<string, TargetOption[]> = {
  Heater: [{ key: "temp", label: "Temperature", verb: "heats the shed to", unit: "°C", min: 18, max: 35, step: 0.5, current: current("Temperature"), value: 28 }],
  Humidifier: [{ key: "rh", label: "Humidity", verb: "raises humidity to", unit: "%", min: 50, max: 95, step: 1, current: current("Relative Humidity"), value: 80 }],
  "Exhaust Fans": [
    { key: "temp", label: "Temperature", verb: "cools the shed to", unit: "°C", min: 18, max: 35, step: 0.5, current: current("Temperature"), value: 25 },
    { key: "nh3", label: "NH₃", verb: "brings ammonia down to", unit: "ppm", min: 0, max: 10, step: 0.5, current: current("NH3"), value: 2 },
    { key: "co2", label: "CO₂", verb: "brings CO₂ down to", unit: "ppm", min: 400, max: 1500, step: 50, current: current("CO2"), value: 600 },
  ],
  "Water Pump": [{ key: "soil", label: "Soil moisture", verb: "waters the field to", unit: "%", min: 20, max: 45, step: 1, current: current("Soil Moisture"), value: 35 }],
};

export const formatTarget = (target: Target) => `${target.value} ${target.option.unit}`;

/**
 * On/off handling for equipment that asks for a target in manual mode.
 * Switching on in manual opens the target window; the device turns on once a target is confirmed.
 */
export function useTargetedSwitch(name: string, on: boolean, toggle: () => void) {
  const mode = useControllerMode(name);
  const options = equipmentTargets[name];
  const [target, setTarget] = useState<Target | null>(null);
  const [asking, setAsking] = useState(false);

  const onToggle = () => {
    if (on) {
      setTarget(null);
      toggle();
    } else if (mode === "manual" && options) {
      setAsking(true);
    } else {
      toggle();
    }
  };

  const confirm = (next: Target) => {
    setTarget(next);
    setAsking(false);
    if (!on) toggle();
  };

  const dialog = options ? <TargetDialog name={name} options={options} open={asking} running={on} initial={target} onConfirm={confirm} onCancel={() => setAsking(false)} /> : null;
  const shownTarget = on ? target : null;

  return { onToggle, target: shownTarget, editTarget: () => setAsking(true), dialog };
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
              <Dialog.Description className="mt-1 text-xs text-[var(--d-muted)]">Manual mode: set what it should reach. It turns off once the target is reached.</Dialog.Description>
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
              <span>
                Now{" "}
                <span className="font-semibold tabular-nums text-[var(--d-text)]">
                  {option.current} {option.unit}
                </span>
              </span>
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
