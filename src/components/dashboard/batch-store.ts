"use client";

import { useSyncExternalStore } from "react";

import { batchHistory } from "@/data/mock";
import type { BatchRecord, InstarKey } from "@/types";

// Rearing stages and typical days in each (moult included) for a bivoltine hybrid at about 25 °C.
export const stages: { key: InstarKey; label: string; days: number; phase: string }[] = [
  { key: "I", label: "I", days: 4, phase: "Chawki" },
  { key: "II", label: "II", days: 3, phase: "Chawki" },
  { key: "III", label: "III", days: 4, phase: "Chawki" },
  { key: "IV", label: "IV", days: 6, phase: "Late age" },
  { key: "V", label: "V", days: 8, phase: "Late age" },
  { key: "Spinning", label: "Spin", days: 3, phase: "Cocoon" },
];
export const totalDays = stages.reduce((sum, stage) => sum + stage.days, 0);

// ---- Dates ("YYYY-MM-DD", read as local calendar days) ----

const dayNumber = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return Math.round(new Date(year, month - 1, day).getTime() / 86_400_000);
};
const isoFromDayNumber = (value: number) => {
  // dayNumber rounds to whole UTC days, so read the result back in UTC.
  const date = new Date(value * 86_400_000);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
};
const localIso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const formatDate = (iso: string | null) => {
  if (!iso) return "–";
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

// Today's date on the client; a fixed demo day while server rendering, refreshed every minute.
const demoToday = "2026-10-17";
function subscribeToday(listener: () => void) {
  const timer = window.setInterval(listener, 60_000);
  return () => window.clearInterval(timer);
}
export const useToday = () => useSyncExternalStore(subscribeToday, () => localIso(new Date()), () => demoToday);

/** Where a batch is on the way from brushing to spinning. */
export function batchProgress(batch: BatchRecord, today: string) {
  const dayOfBatch = Math.max(1, dayNumber(today) - dayNumber(batch.brushedOn) + 1);
  const expectedSpinning = formatDate(isoFromDayNumber(dayNumber(batch.brushedOn) + totalDays - stages[stages.length - 1].days));
  const finished = batch.status !== "Rearing";

  if (finished) return { dayOfBatch: totalDays, stageIndex: stages.length, dayInStage: null, manual: false, finished, expectedSpinning };

  if (batch.instar !== "Auto") {
    const stageIndex = stages.findIndex((stage) => stage.key === batch.instar);
    return { dayOfBatch, stageIndex, dayInStage: null, manual: true, finished, expectedSpinning };
  }

  let start = 1;
  for (let index = 0; index < stages.length; index++) {
    if (dayOfBatch < start + stages[index].days) return { dayOfBatch, stageIndex: index, dayInStage: dayOfBatch - start + 1, manual: false, finished, expectedSpinning };
    start += stages[index].days;
  }
  // Past the usual spinning window: hold on the last stage until the batch is marked harvested.
  return { dayOfBatch, stageIndex: stages.length - 1, dayInStage: stages[stages.length - 1].days, manual: false, finished, expectedSpinning };
}

// ---- Store: the batch list and which batch is active, shared by the Silkworm tab and Settings ----

type BatchState = { batches: BatchRecord[]; activeId: string };

const storageKey = "silkworm-batches";
const defaultState: BatchState = { batches: batchHistory, activeId: batchHistory[0].id };
const listeners = new Set<() => void>();
let state: BatchState | null = null;

function read(): BatchState {
  if (state) return state;
  state = defaultState;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as BatchState | null;
    if (saved && Array.isArray(saved.batches) && saved.batches.length > 0) {
      state = { batches: saved.batches, activeId: saved.batches.some((batch) => batch.id === saved.activeId) ? saved.activeId : saved.batches[0].id };
    }
  } catch {
    // Storage blocked or unreadable: keep the demo batches.
  }
  return state;
}

function write(next: BatchState) {
  state = next;
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // Storage blocked: the change still applies until the page is reloaded.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Next free batch number in the "SB-<year>-<NNN>" pattern. */
export function nextBatchId(batches: BatchRecord[], today: string) {
  const year = today.slice(0, 4);
  const used = batches.map((batch) => batch.id.match(new RegExp(`^SB-${year}-(\\d+)$`))?.[1]).filter(Boolean).map(Number);
  return `SB-${year}-${String((used.length ? Math.max(...used) : 0) + 1).padStart(3, "0")}`;
}

export function useBatches() {
  const { batches, activeId } = useSyncExternalStore(subscribe, read, () => defaultState);
  const active = batches.find((batch) => batch.id === activeId) ?? batches[0];

  return {
    batches,
    active,
    setActive: (id: string) => write({ ...read(), activeId: id }),
    // Saves a batch (new or edited; `previousId` is its number before the edit) and makes it the active one.
    save: (batch: BatchRecord, previousId: string | null) => {
      const current = read();
      const exists = previousId !== null && current.batches.some((item) => item.id === previousId);
      const list = exists ? current.batches.map((item) => (item.id === previousId ? batch : item)) : [batch, ...current.batches];
      write({ batches: list, activeId: batch.id });
    },
    remove: (id: string) => {
      const current = read();
      const list = current.batches.filter((item) => item.id !== id);
      if (list.length === 0) return;
      write({ batches: list, activeId: current.activeId === id ? list[0].id : current.activeId });
    },
    reset: () => write(defaultState),
  };
}
