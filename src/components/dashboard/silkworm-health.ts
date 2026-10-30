"use client";

import { useEffect, useSyncExternalStore } from "react";

import { addDays, daysBetween } from "@/components/dashboard/mulberry-store";
import { formatDate, stages, useBatches, useToday } from "@/components/dashboard/batch-store";
import { pushNotifications } from "@/components/dashboard/notifications";
import type { AlertItem, BatchRecord, InstarKey } from "@/types";

// Silkworm medications (manual entries and automation presets) and photo health checks, saved per browser.

export const medicationPurposes = ["Bed disinfection", "Disease treatment", "Uzi fly control", "Room disinfection", "Supplement", "Other"] as const;
export type MedicationPurpose = (typeof medicationPurposes)[number];
export type MedicationStatus = "Planned" | "Done" | "Skipped";

export interface Medication {
  id: string;
  batchId: string;
  date: string; // "YYYY-MM-DD"
  product: string;
  purpose: MedicationPurpose;
  dose: string;
  method?: string;
  instar?: InstarKey;
  status: MedicationStatus;
  notes?: string;
  presetId?: string; // set for doses planned by an automation preset
}

/** When a preset dose falls: a day within a stage, or days from brushing (negative = before). */
type PresetTiming = { stage: InstarKey; day: number } | { fromBrushing: number };

export interface MedicationPreset {
  id: string;
  name: string;
  purpose: MedicationPurpose;
  product: string;
  dose: string;
  method: string;
  description: string;
  timing: PresetTiming[];
  defaultOn: boolean;
}

// Common schedules from standard rearing practice. Products and doses are examples: follow the label and your sericulture officer.
export const medicationPresets: MedicationPreset[] = [
  {
    id: "room",
    name: "Room & appliance disinfection",
    purpose: "Room disinfection",
    product: "Bleaching powder 2% / chlorine dioxide",
    dose: "Spray walls, floor, trays and mountages",
    method: "Spray, keep the room closed for 24 h",
    description: "3 days before brushing",
    timing: [{ fromBrushing: -3 }],
    defaultOn: true,
  },
  {
    id: "bed",
    name: "Bed disinfection after each moult",
    purpose: "Bed disinfection",
    product: "Bed disinfectant (e.g. Vijetha)",
    dose: "Thin, even dusting as per label",
    method: "Dust through a muslin cloth, 30 min before the first feed",
    description: "Day 1 of instars II–V, and day 4 of instar V",
    timing: [
      { stage: "II", day: 1 },
      { stage: "III", day: 1 },
      { stage: "IV", day: 1 },
      { stage: "V", day: 1 },
      { stage: "V", day: 4 },
    ],
    defaultOn: true,
  },
  {
    id: "uzi",
    name: "Uzi fly control",
    purpose: "Uzi fly control",
    product: "Nesolynx thymus (parasitoid)",
    dose: "1 pouch per 100 DFLs",
    method: "Hang pouches near the racks",
    description: "Day 2 of instar V and day 1 of spinning",
    timing: [
      { stage: "V", day: 2 },
      { stage: "Spinning", day: 1 },
    ],
    defaultOn: true,
  },
  {
    id: "muscardine",
    name: "Muscardine prevention (humid weather)",
    purpose: "Disease treatment",
    product: "Slaked lime / fungicidal bed dust",
    dose: "Thin dusting as per label",
    method: "Dust on the bed in the morning",
    description: "Day 3 of instars IV and V, for rainy or humid seasons",
    timing: [
      { stage: "IV", day: 3 },
      { stage: "V", day: 3 },
    ],
    defaultOn: false,
  },
];

export interface HealthCheck {
  id: string;
  batchId: string;
  date: string;
  photo: string;
  finding: string;
  likely: string;
  severity: "Low" | "Moderate" | "High";
  notes?: string;
}

type Override = { status: MedicationStatus; date?: string; notes?: string };
type HealthState = {
  manual: Medication[];
  overrides: Record<string, Override>; // changes to preset doses, by dose id
  presets: Record<string, boolean>;
  remindDaysBefore: number;
  checks: HealthCheck[];
};

const storageKey = "silkworm-health";
const defaultState: HealthState = {
  manual: [
    { id: "med-1", batchId: "SB-2026-014", date: "2026-10-09", product: "Vitamin supplement", purpose: "Supplement", dose: "As per label, sprayed on leaf", instar: "III", status: "Done", notes: "Larvae looked slow after the moult." },
    { id: "med-2", batchId: "SB-2026-014", date: "2026-10-18", product: "Vitamin supplement", purpose: "Supplement", dose: "As per label, sprayed on leaf", instar: "IV", status: "Planned", notes: "Second dose." },
  ],
  // The demo batch has already had its early preset doses.
  overrides: {
    "room:SB-2026-014:0": { status: "Done" },
    "bed:SB-2026-014:0": { status: "Done" },
    "bed:SB-2026-014:1": { status: "Done" },
    "bed:SB-2026-014:2": { status: "Done" },
  },
  presets: Object.fromEntries(medicationPresets.map((preset) => [preset.id, preset.defaultOn])),
  remindDaysBefore: 1,
  checks: [],
};
const listeners = new Set<() => void>();
let state: HealthState | null = null;
let storageFull = false;

function read(): HealthState {
  if (state) return state;
  state = defaultState;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as Partial<HealthState> | null;
    if (saved && Array.isArray(saved.manual)) state = { ...defaultState, ...saved, presets: { ...defaultState.presets, ...saved.presets } };
  } catch {
    // Storage blocked or unreadable: keep the defaults.
  }
  return state;
}

function write(next: HealthState) {
  state = next;
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
    storageFull = false;
  } catch {
    storageFull = true;
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Day of the batch (1 = brushing day) on which a stage starts. */
const stageStart = (key: InstarKey) => 1 + stages.slice(0, stages.findIndex((stage) => stage.key === key)).reduce((sum, stage) => sum + stage.days, 0);

/** Doses the enabled presets plan for a batch, with any saved changes applied. */
function presetDoses(batch: BatchRecord, health: HealthState): Medication[] {
  return medicationPresets
    .filter((preset) => health.presets[preset.id])
    .flatMap((preset) =>
      preset.timing.map((timing, index) => {
        const id = `${preset.id}:${batch.id}:${index}`;
        const planned = "fromBrushing" in timing ? addDays(batch.brushedOn, timing.fromBrushing) : addDays(batch.brushedOn, stageStart(timing.stage) + timing.day - 2);
        const override = health.overrides[id];
        return {
          id,
          batchId: batch.id,
          date: override?.date ?? planned,
          product: preset.product,
          purpose: preset.purpose,
          dose: preset.dose,
          method: preset.method,
          instar: "stage" in timing ? timing.stage : undefined,
          status: override?.status ?? "Planned",
          notes: override?.notes,
          presetId: preset.id,
        } satisfies Medication;
      }),
    );
}

export function medicationsFor(batch: BatchRecord, health: HealthState) {
  const all = [...presetDoses(batch, health), ...health.manual.filter((item) => item.batchId === batch.id)];
  return all.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export function useSilkwormHealth() {
  const health = useSyncExternalStore(subscribe, read, () => defaultState);
  return {
    health,
    storageFull,
    setPreset: (id: string, on: boolean) => write({ ...read(), presets: { ...read().presets, [id]: on } }),
    setRemindDaysBefore: (days: number) => write({ ...read(), remindDaysBefore: days }),
    saveMedication: (medication: Medication) => {
      const current = read();
      if (medication.presetId) {
        write({ ...current, overrides: { ...current.overrides, [medication.id]: { status: medication.status, date: medication.date, notes: medication.notes } } });
        return;
      }
      const exists = current.manual.some((item) => item.id === medication.id);
      write({ ...current, manual: exists ? current.manual.map((item) => (item.id === medication.id ? medication : item)) : [...current.manual, medication] });
    },
    setStatus: (medication: Medication, status: MedicationStatus, today: string) => {
      const current = read();
      const date = status === "Done" && medication.date > today ? today : medication.date;
      if (medication.presetId) {
        write({ ...current, overrides: { ...current.overrides, [medication.id]: { ...current.overrides[medication.id], status, date } } });
      } else {
        write({ ...current, manual: current.manual.map((item) => (item.id === medication.id ? { ...item, status, date } : item)) });
      }
    },
    removeMedication: (id: string) => write({ ...read(), manual: read().manual.filter((item) => item.id !== id) }),
    addCheck: (check: HealthCheck) => write({ ...read(), checks: [check, ...read().checks] }),
  };
}

/** Planned doses for the batch that are due within the reminder window, or overdue. */
export function dueMedications(batch: BatchRecord, health: HealthState, today: string) {
  if (batch.status !== "Rearing") return [];
  return medicationsFor(batch, health).filter((item) => item.status === "Planned" && daysBetween(today, item.date) <= health.remindDaysBefore);
}

export const whenLabel = (date: string, today: string) => {
  const days = daysBetween(today, date);
  return days < 0 ? `${-days} day${days === -1 ? "" : "s"} overdue` : days === 0 ? "Due today" : days === 1 ? "Due tomorrow" : `Due in ${days} days`;
};

/** Sends due and overdue medication reminders for the active batch to the notification bell. Mounted once in the dashboard shell. */
export function MedicationReminders() {
  const { active } = useBatches();
  const { health } = useSilkwormHealth();
  const today = useToday();
  const due = dueMedications(active, health, today);
  const key = due.map((item) => `${item.id}@${item.date}`).join("|") + today;

  useEffect(() => {
    if (!due.length) return;
    pushNotifications(
      due.map(
        (item): AlertItem => ({
          // A new id per day, so an overdue dose reminds again each day until it is done.
          id: `med-${item.id}-${today}`,
          severity: item.presetId ? "Automation" : "Information",
          parameter: daysBetween(today, item.date) < 0 ? "Medication overdue" : "Medication due",
          value: `${item.product} · ${whenLabel(item.date, today)}`,
          timestamp: formatDate(item.date),
          location: `${active.shed} · ${active.id}`,
          recommendedAction: `${item.purpose}: ${item.dose}.${item.method ? ` ${item.method}.` : ""} Mark it done under Silkworm → Medication.`,
          status: "Open",
        }),
      ),
    );
    // `key` captures every value used here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}
