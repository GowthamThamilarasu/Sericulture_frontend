"use client";

import { useSyncExternalStore } from "react";

// Automation models: named sets of automation settings per area. One model per area is active.

export type AutomationArea = "irrigation" | "fertigation" | "shed";

// `short` is the label on the model cards, where space is tight.
export type ModelField =
  | { key: string; label: string; short: string; type: "number"; unit: string; min: number; max: number; step: number }
  | { key: string; label: string; short: string; type: "toggle"; detail: string }
  | { key: string; label: string; short: string; type: "time" };

export const modelFields: Record<AutomationArea, ModelField[]> = {
  irrigation: [
    { key: "startBelow", label: "Start when soil moisture is below", short: "Start below", type: "number", unit: "%", min: 10, max: 50, step: 1 },
    { key: "stopAt", label: "Stop when soil moisture reaches", short: "Stop at", type: "number", unit: "%", min: 15, max: 60, step: 1 },
    { key: "maxRun", label: "Longest run", short: "Longest run", type: "number", unit: "min", min: 5, max: 240, step: 5 },
    { key: "minTank", label: "Keep at least this much in the tank", short: "Tank reserve", type: "number", unit: "%", min: 0, max: 90, step: 5 },
    { key: "windowStart", label: "Water from", short: "From", type: "time" },
    { key: "windowEnd", label: "Water until", short: "Until", type: "time" },
    { key: "skipRain", label: "Skip when rain is expected", short: "Skip on rain", type: "toggle", detail: "Uses the rain sensor and forecast" },
  ],
  fertigation: [
    { key: "targetEc", label: "Target EC", short: "Target EC", type: "number", unit: "mS/cm", min: 0.3, max: 3, step: 0.05 },
    { key: "phMin", label: "Lowest pH", short: "pH min", type: "number", unit: "pH", min: 4.5, max: 7.5, step: 0.1 },
    { key: "phMax", label: "Highest pH", short: "pH max", type: "number", unit: "pH", min: 5, max: 8.5, step: 0.1 },
    { key: "maxDose", label: "Largest dose per run", short: "Max dose", type: "number", unit: "mL", min: 10, max: 1000, step: 10 },
    { key: "dosesPerDay", label: "Doses per day", short: "Doses / day", type: "number", unit: "", min: 1, max: 6, step: 1 },
    { key: "windowStart", label: "Dose from", short: "Dose from", type: "time" },
    { key: "flush", label: "Flush the line after dosing", short: "Flush line", type: "toggle", detail: "Runs clean water for 2 minutes" },
  ],
  shed: [
    { key: "tempMin", label: "Lowest temperature", short: "Temp min", type: "number", unit: "°C", min: 18, max: 30, step: 0.5 },
    { key: "tempMax", label: "Highest temperature", short: "Temp max", type: "number", unit: "°C", min: 22, max: 35, step: 0.5 },
    { key: "rhMin", label: "Lowest humidity", short: "Humidity min", type: "number", unit: "%", min: 50, max: 90, step: 1 },
    { key: "rhMax", label: "Highest humidity", short: "Humidity max", type: "number", unit: "%", min: 55, max: 95, step: 1 },
    { key: "nh3", label: "NH₃ limit", short: "NH₃ limit", type: "number", unit: "ppm", min: 1, max: 10, step: 0.5 },
    { key: "ventEvery", label: "Ventilate every", short: "Ventilate every", type: "number", unit: "min", min: 15, max: 240, step: 15 },
    { key: "lightHours", label: "Light hours per day", short: "Light hours", type: "number", unit: "h", min: 0, max: 24, step: 1 },
  ],
};

export type ModelValues = Record<string, number | boolean | string>;
export interface AutomationModel {
  id: string;
  area: AutomationArea;
  name: string;
  notes?: string;
  values: ModelValues;
}

const defaultModels: AutomationModel[] = [
  { id: "irr-summer", area: "irrigation", name: "Summer · moisture driven", notes: "Hot, dry months. Water early to cut evaporation.", values: { startBelow: 28, stopAt: 36, maxRun: 45, minTank: 30, windowStart: "05:30", windowEnd: "09:00", skipRain: true } },
  { id: "irr-monsoon", area: "irrigation", name: "Monsoon · rain aware", notes: "Waters only when the soil really needs it.", values: { startBelow: 22, stopAt: 30, maxRun: 25, minTank: 20, windowStart: "06:00", windowEnd: "10:00", skipRain: true } },
  { id: "irr-saver", area: "irrigation", name: "Water saver", notes: "For low bore-well yield.", values: { startBelow: 24, stopAt: 31, maxRun: 20, minTank: 40, windowStart: "05:00", windowEnd: "07:00", skipRain: true } },
  { id: "fer-growth", area: "fertigation", name: "Vegetative growth", notes: "After pruning, for fast shoot growth.", values: { targetEc: 1.05, phMin: 6, phMax: 6.8, maxDose: 120, dosesPerDay: 2, windowStart: "07:00", flush: true } },
  { id: "fer-leaf", area: "fertigation", name: "Leaf quality boost", notes: "Two weeks before leaf harvest for late-age feeding.", values: { targetEc: 0.9, phMin: 6.2, phMax: 7, maxDose: 90, dosesPerDay: 1, windowStart: "07:30", flush: true } },
  { id: "shed-chawki", area: "shed", name: "Chawki (I–III)", notes: "Young larvae: warm and humid.", values: { tempMin: 26, tempMax: 28, rhMin: 80, rhMax: 90, nh3: 3, ventEvery: 120, lightHours: 16 } },
  { id: "shed-late", area: "shed", name: "Late age (IV–V)", notes: "Cooler, drier, more air.", values: { tempMin: 24, tempMax: 26, rhMin: 70, rhMax: 75, nh3: 5, ventEvery: 60, lightHours: 16 } },
  { id: "shed-spin", area: "shed", name: "Spinning", notes: "Airy and dry for good cocoons.", values: { tempMin: 24, tempMax: 25, rhMin: 60, rhMax: 70, nh3: 5, ventEvery: 30, lightHours: 12 } },
];

type State = { models: AutomationModel[]; active: Record<AutomationArea, string> };
const storageKey = "automation-models";
const defaultState: State = { models: defaultModels, active: { irrigation: "irr-summer", fertigation: "fer-growth", shed: "shed-late" } };
const listeners = new Set<() => void>();
let state: State | null = null;

function read(): State {
  if (state) return state;
  state = defaultState;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as State | null;
    if (saved && Array.isArray(saved.models)) state = { models: saved.models, active: { ...defaultState.active, ...saved.active } };
  } catch {
    // Storage blocked or unreadable: keep the demo models.
  }
  return state;
}

function write(next: State) {
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

export function useAutomationModels() {
  const { models, active } = useSyncExternalStore(subscribe, read, () => defaultState);
  return {
    models,
    active,
    setActive: (area: AutomationArea, id: string) => write({ ...read(), active: { ...read().active, [area]: id } }),
    save: (model: AutomationModel) => {
      const current = read();
      const exists = current.models.some((item) => item.id === model.id);
      write({ ...current, models: exists ? current.models.map((item) => (item.id === model.id ? model : item)) : [...current.models, model] });
    },
    remove: (id: string) => {
      const current = read();
      const model = current.models.find((item) => item.id === id);
      const models = current.models.filter((item) => item.id !== id);
      const active = { ...current.active };
      if (model && active[model.area] === id) active[model.area] = models.find((item) => item.area === model.area)?.id ?? "";
      write({ models, active });
    },
  };
}

export const defaultValues = (area: AutomationArea): ModelValues =>
  Object.fromEntries(modelFields[area].map((field) => [field.key, field.type === "number" ? field.min : field.type === "toggle" ? false : "06:00"]));
