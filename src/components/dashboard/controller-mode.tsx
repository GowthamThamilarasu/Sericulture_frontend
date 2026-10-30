"use client";

import { useSyncExternalStore } from "react";
import { Bot, Hand, UserCog } from "lucide-react";

import { actuators } from "@/data/mock";

export type ControllerMode = "auto" | "semi" | "manual";

export const controllerModes: { value: ControllerMode; label: string; detail: string; icon: typeof Bot }[] = [
  { value: "auto", label: "Auto", detail: "Runs on its own from the set points", icon: Bot },
  { value: "semi", label: "Semi-auto", detail: "Suggests actions, you approve them", icon: UserCog },
  { value: "manual", label: "Manual", detail: "You switch it on and off", icon: Hand },
];

// Equipment that starts in manual when the demo data doesn't say otherwise.
const manualByDefault = new Set(["Fogger", "Foggers", "Cooling", "Curtains", "Louvers"]);

function defaultMode(name: string): ControllerMode {
  const actuator = actuators.find((item) => item.name === name);
  if (actuator) return actuator.mode === "MANUAL" ? "manual" : "auto";
  return manualByDefault.has(name) ? "manual" : "auto";
}

// One shared store so a controller shows the same mode on every dashboard page; saved per browser.
const storageKey = "controller-modes";
const listeners = new Set<() => void>();
const emptyModes: Record<string, ControllerMode> = {};
let modes: Record<string, ControllerMode> | null = null;

function loadModes() {
  if (modes) return modes;
  try {
    modes = JSON.parse(localStorage.getItem(storageKey) ?? "{}") as Record<string, ControllerMode>;
  } catch {
    modes = {};
  }
  return modes;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setControllerMode(name: string, mode: ControllerMode) {
  modes = { ...loadModes(), [name]: mode };
  try {
    localStorage.setItem(storageKey, JSON.stringify(modes));
  } catch {
    // Storage blocked: the choice still holds until the page reloads.
  }
  listeners.forEach((listener) => listener());
}

export function useControllerMode(name: string): ControllerMode {
  const saved = useSyncExternalStore(subscribe, loadModes, () => emptyModes);
  return saved[name] ?? defaultMode(name);
}

// Modes for a list of controllers at once.
export function useControllerModes(names: string[]): ControllerMode[] {
  const saved = useSyncExternalStore(subscribe, loadModes, () => emptyModes);
  return names.map((name) => saved[name] ?? defaultMode(name));
}

export function ModeSelector({ name, className }: { name: string; className?: string }) {
  const mode = useControllerMode(name);
  const current = controllerModes.find((item) => item.value === mode) ?? controllerModes[0];

  return (
    <div className={`flex flex-col items-center gap-1 ${className ?? ""}`}>
      <div role="radiogroup" aria-label={`${name} control mode`} className="inline-flex rounded-full bg-[var(--d-chip)] p-1">
        {controllerModes.map((item) => {
          const active = item.value === mode;
          return (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${item.label}: ${item.detail}`}
              title={`${item.label}: ${item.detail}`}
              onClick={() => setControllerMode(name, item.value)}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                active ? "accent-fill" : "text-[var(--d-muted)] hover:bg-[var(--d-chip-hover)] hover:text-[var(--d-text)]"
              }`}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">{current.label}</div>
    </div>
  );
}
