"use client";

import { useSyncExternalStore } from "react";

import type { Icon } from "@/components/dashboard/dashboard-widgets";
import { Co2Icon, HumidityIcon, LightSensorIcon, Nh3Icon, TemperatureIcon } from "@/components/dashboard/sensor-icons";
import { defaultShedDevices } from "@/components/dashboard/shed-devices";

// Saved climate state shared by every tab: each shed device's on/off and the shed limits (a min and max per reading).
// Kept apart from climate-control.tsx so the automation rules can read the limits without an import loop.

export type LimitRange = { min: number; max: number };
export type ShedLimitSpec = { key: string; label: string; unit: string; icon: Icon; sensor: string; scale: LimitRange; step: number; decimals: number; value: LimitRange; detail: string };

/** The shed limits: hard floors and caps on the active shed model's targets. Set under Settings → Shed or Automation → Shed. */
export const shedLimitSpecs: ShedLimitSpec[] = [
  { key: "temp", label: "Temperature", unit: "°C", icon: TemperatureIcon, sensor: "Temperature", scale: { min: 15, max: 40 }, step: 0.5, decimals: 1, value: { min: 22, max: 28 }, detail: "Heater below the min, fans and cooling above the max" },
  { key: "rh", label: "Humidity", unit: "%", icon: HumidityIcon, sensor: "Relative Humidity", scale: { min: 40, max: 100 }, step: 1, decimals: 0, value: { min: 65, max: 85 }, detail: "Humidifier and fogger below the min, ventilation above the max" },
  { key: "nh3", label: "NH₃ (ammonia)", unit: "ppm", icon: Nh3Icon, sensor: "NH3", scale: { min: 0, max: 15 }, step: 0.5, decimals: 1, value: { min: 0, max: 5 }, detail: "Fans run as ammonia nears the max" },
  { key: "co2", label: "CO₂", unit: "ppm", icon: Co2Icon, sensor: "CO2", scale: { min: 300, max: 2000 }, step: 50, decimals: 0, value: { min: 400, max: 1000 }, detail: "Fans run as CO₂ nears the max" },
  { key: "light", label: "Light", unit: "Lux", icon: LightSensorIcon, sensor: "Light", scale: { min: 0, max: 60 }, step: 1, decimals: 0, value: { min: 10, max: 30 }, detail: "Lights come on below the min during light hours" },
];

export type ClimateState = { on: Record<string, boolean>; limits: Record<string, LimitRange> };

const storageKey = "climate-control";
export const defaultClimateState: ClimateState = {
  on: Object.fromEntries(defaultShedDevices.map((device) => [device.name, ["Fan Stage 1", "Circulation Fan"].includes(device.name)])),
  limits: Object.fromEntries(shedLimitSpecs.map((item) => [item.key, item.value])),
};
const listeners = new Set<() => void>();
let state: ClimateState | null = null;

// Older saves kept one number per limit (the max); keep it as the max and use the default min.
function migrateLimits(saved: Record<string, unknown> | undefined): Record<string, LimitRange> {
  const limits = { ...defaultClimateState.limits };
  for (const spec of shedLimitSpecs) {
    const value = saved?.[spec.key];
    if (typeof value === "number") limits[spec.key] = { min: Math.min(spec.value.min, value), max: value };
    else if (value && typeof value === "object" && typeof (value as LimitRange).min === "number" && typeof (value as LimitRange).max === "number") limits[spec.key] = value as LimitRange;
  }
  return limits;
}

function read(): ClimateState {
  if (state) return state;
  state = defaultClimateState;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as { on?: Record<string, boolean>; limits?: Record<string, unknown> } | null;
    if (saved) state = { on: { ...defaultClimateState.on, ...saved.on }, limits: migrateLimits(saved.limits) };
  } catch {
    // Storage blocked or unreadable: keep the defaults.
  }
  return state;
}

function write(next: ClimateState) {
  state = next;
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // Storage blocked: the change still applies until the page reloads.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useClimateState() {
  return useSyncExternalStore(subscribe, read, () => defaultClimateState);
}

export const setClimateOn = (name: string, value: boolean) => write({ ...read(), on: { ...read().on, [name]: value } });
export const setClimateLimit = (key: string, value: LimitRange) => write({ ...read(), limits: { ...read().limits, [key]: value } });
export const resetClimateLimits = () => write({ ...read(), limits: defaultClimateState.limits });
