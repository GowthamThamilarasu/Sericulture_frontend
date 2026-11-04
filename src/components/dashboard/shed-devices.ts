"use client";

import { useSyncExternalStore } from "react";
import { Blinds, CloudDrizzle, Droplets, Fan, Heater, Lightbulb, PanelTop, Snowflake, Wind } from "lucide-react";

import type { Icon } from "@/components/dashboard/dashboard-widgets";
import { currentFarmDevices } from "@/components/dashboard/farm-devices";

// The shed's controllable equipment, set up under Settings → Shed and shared by Climate Control,
// the Automation tab, the Shed Monitor and Reports. Each device has a type, which decides its icon,
// its group, its Auto rule and what Semi-auto asks for.

export type ShedGroup = "Ventilation" | "Humidity" | "Temperature" | "Lighting";

export type ShedDeviceType = "exhaustFan" | "boosterFan" | "circulationFan" | "ventilation" | "louvers" | "curtains" | "fogger" | "humidifier" | "heater" | "cooling" | "lights";
type ShedTypeInfo = { label: string; detail: string; group: ShedGroup; icon: Icon; spins?: boolean };

export const shedDeviceTypes: Record<ShedDeviceType, ShedTypeInfo> = {
  exhaustFan: { label: "Exhaust fan", detail: "First ventilation stage", group: "Ventilation", icon: Fan, spins: true },
  boosterFan: { label: "Booster fan", detail: "Second stage, past the limits", group: "Ventilation", icon: Fan, spins: true },
  circulationFan: { label: "Circulation fan", detail: "Keeps air moving over the beds", group: "Ventilation", icon: Wind, spins: true },
  ventilation: { label: "Motorized ventilation", detail: "Vents that open and close", group: "Ventilation", icon: PanelTop },
  louvers: { label: "Louvers", detail: "Adjustable wall slats", group: "Ventilation", icon: Blinds },
  curtains: { label: "Curtains", detail: "Side curtains", group: "Ventilation", icon: Blinds },
  fogger: { label: "Fogger", detail: "Fine mist, big humidity lift", group: "Humidity", icon: CloudDrizzle },
  humidifier: { label: "Humidifier", detail: "Gentle humidity lift", group: "Humidity", icon: Droplets },
  heater: { label: "Heater", detail: "Warms the shed", group: "Temperature", icon: Heater },
  cooling: { label: "Cooling", detail: "Cooling pad or AC", group: "Temperature", icon: Snowflake },
  lights: { label: "Lights", detail: "Follows the model's light hours", group: "Lighting", icon: Lightbulb },
};

export type ShedDevice = { id: string; name: string; type: ShedDeviceType };

export const shedGroups: { group: ShedGroup; icon: Icon }[] = [
  { group: "Ventilation", icon: Wind },
  { group: "Humidity", icon: CloudDrizzle },
  { group: "Temperature", icon: Heater },
  { group: "Lighting", icon: Lightbulb },
];

export const defaultShedDevices: ShedDevice[] = [
  { id: "sd-fan1", name: "Fan Stage 1", type: "exhaustFan" },
  { id: "sd-fan2", name: "Fan Stage 2", type: "boosterFan" },
  { id: "sd-circ", name: "Circulation Fan", type: "circulationFan" },
  { id: "sd-fog", name: "Fogger", type: "fogger" },
  { id: "sd-hum", name: "Humidifier", type: "humidifier" },
  { id: "sd-heat", name: "Heater", type: "heater" },
  { id: "sd-cool", name: "Cooling", type: "cooling" },
  { id: "sd-vent", name: "Motorized Ventilation", type: "ventilation" },
  { id: "sd-louver", name: "Louvers", type: "louvers" },
  { id: "sd-curtain", name: "Curtains", type: "curtains" },
  { id: "sd-light", name: "Lights", type: "lights" },
];

// Names already used by farm and fertigation equipment, which a shed device can't take.
const reservedNames = ["Water Pump", "Solenoid Valve", "Drip Irrigation", "Dose Pump", "Mixing Tank", "Agitator", "Tank Filling Valve", "Climate System"];

const storageKey = "shed-devices";
const listeners = new Set<() => void>();
let devices: ShedDevice[] | null = null;

function read(): ShedDevice[] {
  if (devices) return devices;
  devices = defaultShedDevices;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as ShedDevice[] | null;
    if (Array.isArray(saved)) devices = saved.filter((item) => item && typeof item.name === "string" && item.type in shedDeviceTypes);
  } catch {
    // Storage blocked or unreadable: keep the default equipment.
  }
  return devices;
}

function write(next: ShedDevice[]) {
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

/** Current shed devices without subscribing (for rules that run inside other hooks). */
export const currentShedDevices = () => (typeof window === "undefined" ? defaultShedDevices : read());
export const shedDeviceByName = (name: string) => currentShedDevices().find((item) => item.name === name);

/** Why a name can't be used, or null if it's fine. */
export function nameProblem(name: string, ignoreId?: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Give the device a name.";
  if (trimmed.length > 40) return "Keep the name under 40 characters.";
  const lower = trimmed.toLowerCase();
  const farm = currentFarmDevices();
  if (reservedNames.some((item) => item.toLowerCase() === lower) || [...farm.pumps, ...farm.valves].some((item) => item.name.toLowerCase() === lower)) return "That name is used by farm or fertigation equipment.";
  if (read().some((item) => item.id !== ignoreId && item.name.toLowerCase() === lower)) return "A shed device already has this name.";
  return null;
}

export function useShedDevices() {
  const list = useSyncExternalStore(subscribe, read, () => defaultShedDevices);
  return {
    devices: list,
    add: (name: string, type: ShedDeviceType) => write([...read(), { id: `sd-${Date.now()}`, name: name.trim(), type }]),
    remove: (id: string) => write(read().filter((item) => item.id !== id)),
    reset: () => write(defaultShedDevices),
  };
}

/** Devices with their type details (icon, group, spinning icon), in setup order. */
export function useShedEquipment() {
  const { devices: list } = useShedDevices();
  return list.map((device) => ({ ...device, ...shedDeviceTypes[device.type], typeLabel: shedDeviceTypes[device.type].label }));
}
