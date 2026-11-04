"use client";

import { useSyncExternalStore } from "react";

import { currentShedDevices } from "@/components/dashboard/shed-devices";
import { farmValves } from "@/data/mock";
import type { FarmValve } from "@/types";

// The farm's pumps (motors) and field valves, added and removed on the Farm Monitor page.
// Shared by the pump & valve controls, the irrigation scheduler, the Automation tab, the Overview strip and Reports.
// Whether each one is open or running lives in the device power store (device-automation.ts), keyed by name.

export type FarmPump = { id: string; name: string; location: string };
/** A valve's setup. Its live state (open, litres delivered) is kept by the controls, not here. */
export type FarmValveSetup = Omit<FarmValve, "open" | "delivered"> & { delivered?: number };
type FarmDevices = { pumps: FarmPump[]; valves: FarmValveSetup[] };

export const defaultFarmDevices: FarmDevices = {
  pumps: [{ id: "pump-main", name: "Water Pump", location: "Main line" }],
  valves: farmValves.map(({ id, name, zone, flowRate, pressure, volume, infinite, delivered }) => ({ id, name, zone, flowRate, pressure, volume, infinite, delivered })),
};

// Names used by fertigation equipment, which a pump or valve can't take.
const reservedNames = ["Solenoid Valve", "Drip Irrigation", "Dose Pump", "Mixing Tank", "Agitator", "Tank Filling Valve", "Climate System"];

const storageKey = "farm-devices";
const listeners = new Set<() => void>();
let devices: FarmDevices | null = null;

function read(): FarmDevices {
  if (devices) return devices;
  devices = defaultFarmDevices;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as Partial<FarmDevices> | null;
    if (saved && Array.isArray(saved.pumps) && Array.isArray(saved.valves)) devices = { pumps: saved.pumps, valves: saved.valves };
  } catch {
    // Storage blocked or unreadable: keep the default pump and valves.
  }
  return devices;
}

function write(next: FarmDevices) {
  devices = next;
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

/** Current pumps and valves without subscribing (for rules and helpers that run outside a component). */
export const currentFarmDevices = () => (typeof window === "undefined" ? defaultFarmDevices : read());
export const farmValveByName = (name: string) => currentFarmDevices().valves.find((item) => item.name === name);
export const farmValveById = (id: string) => currentFarmDevices().valves.find((item) => item.id === id);
export const isFarmPump = (name: string) => currentFarmDevices().pumps.some((item) => item.name === name);

/** Why a name can't be used for a new pump or valve, or null if it's fine. */
export function farmNameProblem(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Give it a name.";
  if (trimmed.length > 40) return "Keep the name under 40 characters.";
  const lower = trimmed.toLowerCase();
  const { pumps, valves } = read();
  if ([...pumps, ...valves].some((item) => item.name.toLowerCase() === lower)) return "A pump or valve already has this name.";
  if (reservedNames.some((item) => item.toLowerCase() === lower) || currentShedDevices().some((item) => item.name.toLowerCase() === lower)) return "That name is used by other equipment.";
  return null;
}

export function useFarmDevices() {
  const state = useSyncExternalStore(subscribe, read, () => defaultFarmDevices);
  return {
    pumps: state.pumps,
    valves: state.valves,
    addPump: (name: string, location: string) => write({ ...read(), pumps: [...read().pumps, { id: `pump-${Date.now()}`, name: name.trim(), location: location.trim() || "Field" }] }),
    removePump: (id: string) => write({ ...read(), pumps: read().pumps.filter((item) => item.id !== id) }),
    addValve: (valve: { name: string; zone: string; flowRate: number; pressure: number; volume: number }) =>
      write({ ...read(), valves: [...read().valves, { id: `valve-${Date.now()}`, name: valve.name.trim(), zone: valve.zone.trim() || "Field", flowRate: valve.flowRate, pressure: valve.pressure, volume: valve.volume, infinite: false }] }),
    removeValve: (id: string) => write({ ...read(), valves: read().valves.filter((item) => item.id !== id) }),
    reset: () => write(defaultFarmDevices),
  };
}
