"use client";

import { useSyncExternalStore } from "react";

import { type AutomationArea, type ModelValues, useAutomationModels } from "@/components/dashboard/automation-models";
import { type LimitRange, useClimateState } from "@/components/dashboard/climate-store";
import { shedDeviceByName } from "@/components/dashboard/shed-devices";
import { actuators, farmValves, fertigationReadings, sensorReadings } from "@/data/mock";

// What a device does in Auto mode: every device follows the active automation model of its area
// (Irrigation, Fertigation or Shed). Shed devices also respect the shed limits as hard caps.

export type AutoDecision = { on: boolean; reason: string };

const sensor = (name: string) => sensorReadings.find((item) => item.name === name)?.value ?? 0;
const nutrient = (key: string) => fertigationReadings.find((item) => item.key === key)?.value ?? 0;
const num = (values: ModelValues, key: string, fallback: number) => (typeof values[key] === "number" ? (values[key] as number) : fallback);
const text = (values: ModelValues, key: string, fallback: string) => (typeof values[key] === "string" && values[key] ? (values[key] as string) : fallback);
const on = (reason: string): AutoDecision => ({ on: true, reason });
const off = (reason: string): AutoDecision => ({ on: false, reason });

// ---- Which area's model runs each device ----

const fertigationDevices = new Set(["Dose Pump", "Mixing Tank", "Agitator", "Tank Filling Valve"]);

export function areaOf(name: string): AutomationArea {
  if (shedDeviceByName(name)) return "shed";
  if (fertigationDevices.has(name)) return "fertigation";
  return "irrigation";
}

// ---- Clock: minutes since midnight, refreshed every 30 s. Null while rendering on the server. ----

const clockListeners = new Set<() => void>();
let clockTimer: number | undefined;

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  clockTimer ??= window.setInterval(() => clockListeners.forEach((item) => item()), 30_000);
  return () => {
    clockListeners.delete(listener);
    if (!clockListeners.size) {
      window.clearInterval(clockTimer);
      clockTimer = undefined;
    }
  };
}

const minutesNow = () => {
  const date = new Date();
  return date.getHours() * 60 + date.getMinutes();
};

export function useNow(): number | null {
  return useSyncExternalStore(subscribeClock, minutesNow, () => null);
}

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};
const clockText = (minutes: number) => `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
const inWindow = (now: number | null, start: number, end: number) => now === null || (start <= end ? now >= start && now < end : now >= start || now < end);

// ---- Rules ----

/** Pump and field valves: water when the soil is dry, keep going until the stop point, inside the watering window. */
export function irrigationRule(values: ModelValues, running: boolean, now: number | null): AutoDecision {
  const soil = sensor("Soil Moisture");
  const tank = sensor("Water Tank");
  const startBelow = num(values, "startBelow", 28);
  const stopAt = num(values, "stopAt", 36);
  const minTank = num(values, "minTank", 30);
  const from = text(values, "windowStart", "05:30");
  const until = text(values, "windowEnd", "09:00");

  if (tank <= minTank) return off(`Tank ${tank}% is at the ${minTank}% reserve`);
  if (!inWindow(now, toMinutes(from), toMinutes(until))) return off(`Waits for the ${from}–${until} watering window`);
  if (soil < startBelow) return on(`Soil ${soil}% is below the ${startBelow}% start point`);
  if (running && soil < stopAt) return on(`Watering until soil reaches ${stopAt}% (now ${soil}%)`);
  return off(`Soil ${soil}% · starts below ${startBelow}%`);
}

/** Dosing equipment: dose toward the model's EC target while pH is inside its band. */
export function fertigationRule(name: string, values: ModelValues): AutoDecision {
  const ec = nutrient("ec");
  const ph = nutrient("ph");
  const target = num(values, "targetEc", 1);
  const phMin = num(values, "phMin", 6);
  const phMax = num(values, "phMax", 7);
  const phOk = ph >= phMin && ph <= phMax;
  const dosing = phOk && ec < target - 0.02;

  if (name === "Tank Filling Valve") {
    const tank = sensor("Water Tank");
    return tank < 40 ? on(`Tank ${tank}% · refilling`) : off(`Tank ${tank}% is full enough`);
  }
  if (name === "Agitator" || name === "Mixing Tank") return dosing ? on("Mixing while the dose pump runs") : off("Idle until the next dose");
  if (!phOk) return off(`pH ${ph} is outside ${phMin}–${phMax} · dosing paused`);
  return dosing ? on(`EC ${ec} is below the ${target} mS/cm target`) : off(`EC ${ec} is at the ${target} mS/cm target`);
}

/** Shed equipment, by its type: the model's targets, kept inside the shed limits (min and max per reading). */
export function shedRule(name: string, values: ModelValues, limits: Record<string, LimitRange>, now: number | null): AutoDecision {
  const temp = sensor("Temperature");
  const rh = sensor("Relative Humidity");
  const nh3 = sensor("NH3");
  const co2 = sensor("CO2");
  const lux = sensor("Light");
  const tempMin = Math.max(num(values, "tempMin", 24), limits.temp?.min ?? -Infinity);
  const tempMax = Math.min(num(values, "tempMax", 28), limits.temp?.max ?? Infinity);
  const rhMin = Math.max(num(values, "rhMin", 70), limits.rh?.min ?? -Infinity);
  const rhMax = Math.min(num(values, "rhMax", 85), limits.rh?.max ?? Infinity);
  const nh3Limit = Math.min(num(values, "nh3", 5), limits.nh3?.max ?? Infinity);
  const co2Limit = limits.co2?.max ?? 1000;
  const luxMin = limits.light?.min ?? 0;
  const lightHours = num(values, "lightHours", 12);
  const hot = temp > tempMax;
  const humid = rh > rhMax;
  const airBad = nh3 > nh3Limit * 0.7 || co2 > co2Limit * 0.85;

  switch (shedDeviceByName(name)?.type) {
    case "exhaustFan":
      if (nh3 > nh3Limit * 0.7) return on(`NH₃ ${nh3} ppm is near the ${nh3Limit} ppm limit`);
      if (co2 > co2Limit * 0.85) return on(`CO₂ ${co2} ppm is near the ${co2Limit} ppm limit`);
      if (hot) return on(`Temperature ${temp} °C is above ${tempMax} °C`);
      if (humid) return on(`Humidity ${rh}% is above ${rhMax}%`);
      return off("Air quality and temperature are fine");
    case "boosterFan":
      return nh3 > nh3Limit || co2 > co2Limit || temp > tempMax + 1 ? on("Readings past their limits: full ventilation") : off("Only needed when readings pass their limits");
    case "circulationFan":
      return on("Keeps air moving over the beds during rearing");
    case "fogger":
      return rh < rhMin - 8 ? on(`Humidity ${rh}% is well below ${rhMin}%`) : off(`Humidity ${rh}% is high enough`);
    case "humidifier":
      return rh < rhMin ? on(`Humidity ${rh}% is below ${rhMin}%`) : off(`Humidity ${rh}% is at least ${rhMin}%`);
    case "heater":
      return temp < tempMin ? on(`Temperature ${temp} °C is below ${tempMin} °C`) : off(`Temperature ${temp} °C is warm enough`);
    case "cooling":
      return temp > tempMax + 1 ? on(`Temperature ${temp} °C is above ${tempMax + 1} °C`) : off(`Temperature ${temp} °C is not above ${tempMax + 1} °C`);
    case "ventilation":
    case "louvers":
    case "curtains":
      return hot || humid || airBad ? on(hot ? `Open: temperature ${temp} °C is above ${tempMax} °C` : humid ? `Open: humidity ${rh}% is above ${rhMax}%` : "Open: letting stale air out") : off("Closed: conditions are in range");
    case "lights": {
      const start = 6 * 60;
      const end = start + lightHours * 60;
      const window = `${clockText(start)}–${clockText(end)}`;
      if (!lightHours) return off("Model sets no light hours");
      const lightTime = lightHours >= 24 || (now !== null && inWindow(now, start, end % 1440));
      if (!lightTime) return off(`Light hours ${window}`);
      return lux < luxMin ? on(`Light ${lux} lux is below ${luxMin} lux · light hours ${window}`) : off(`Daylight ${lux} lux is enough · light hours ${window}`);
    }
    default:
      return off("No automatic rule for this device");
  }
}

// ---- Hooks ----

export function useActiveModel(area: AutomationArea) {
  const { models, active } = useAutomationModels();
  const model = models.find((item) => item.id === active[area]);
  return { name: model?.name ?? null, values: model?.values ?? {} };
}

/** What Auto mode does with this device right now. `running` is its saved on/off state (for hold-on rules). */
export function useAutoRule(name: string, running: boolean): AutoDecision & { modelName: string | null } {
  const area = areaOf(name);
  const model = useActiveModel(area);
  const { limits } = useClimateState();
  const now = useNow();
  if (!model.name) return { on: false, reason: "No active model for this area", modelName: null };
  const decision = area === "shed" ? shedRule(name, model.values, limits, now) : area === "fertigation" ? fertigationRule(name, model.values) : irrigationRule(model.values, running, now);
  return { ...decision, modelName: model.name };
}

// ---- Saved on/off for devices without their own store (pump, valves, dosing equipment, extra shed devices) ----

const powerKey = "device-power";
const powerListeners = new Set<() => void>();
const emptyPower: Record<string, boolean> = {};
let power: Record<string, boolean> | null = null;

function loadPower() {
  if (power) return power;
  try {
    power = JSON.parse(localStorage.getItem(powerKey) ?? "{}") as Record<string, boolean>;
  } catch {
    power = {};
  }
  return power;
}

function subscribePower(listener: () => void) {
  powerListeners.add(listener);
  return () => powerListeners.delete(listener);
}

function defaultPower(name: string) {
  const valve = farmValves.find((item) => item.name === name);
  if (valve) return valve.open;
  return actuators.find((item) => item.name === name)?.status === "ON";
}

export function setDevicePower(name: string, value: boolean) {
  power = { ...loadPower(), [name]: value };
  try {
    localStorage.setItem(powerKey, JSON.stringify(power));
  } catch {
    // Storage blocked: the change still holds until the page reloads.
  }
  powerListeners.forEach((listener) => listener());
}

export function useDevicePowers(names: string[]): boolean[] {
  const saved = useSyncExternalStore(subscribePower, loadPower, () => emptyPower);
  return names.map((name) => saved[name] ?? defaultPower(name));
}

export function useDevicePower(name: string): [boolean, (value: boolean) => void] {
  const [value] = useDevicePowers([name]);
  return [value, (next: boolean) => setDevicePower(name, next)];
}
