"use client";

import { useSyncExternalStore } from "react";

import { fieldActivities, mulberryBlocks } from "@/data/mock";
import type { FieldActivity, MulberryBlock } from "@/types";

// Mulberry blocks and the field log, saved per browser (demo mode: no server yet).
type MulberryState = { blocks: MulberryBlock[]; activities: FieldActivity[] };

const storageKey = "mulberry-field";
const defaultState: MulberryState = { blocks: mulberryBlocks, activities: fieldActivities };
const listeners = new Set<() => void>();
let state: MulberryState | null = null;
let storageFull = false;

function read(): MulberryState {
  if (state) return state;
  state = defaultState;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as MulberryState | null;
    if (saved && Array.isArray(saved.blocks) && Array.isArray(saved.activities)) state = saved;
  } catch {
    // Storage blocked or unreadable: keep the demo data.
  }
  return state;
}

function write(next: MulberryState) {
  state = next;
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
    storageFull = false;
  } catch {
    // Usually the browser's storage limit (leaf photos); the change still applies until reload.
    storageFull = true;
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const byDateDesc = (a: FieldActivity, b: FieldActivity) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id);

export function useMulberry() {
  const { blocks, activities } = useSyncExternalStore(subscribe, read, () => defaultState);
  return {
    blocks,
    activities,
    storageFull,
    saveBlock: (block: MulberryBlock) => {
      const current = read();
      const exists = current.blocks.some((item) => item.id === block.id);
      write({ ...current, blocks: exists ? current.blocks.map((item) => (item.id === block.id ? block : item)) : [...current.blocks, block] });
    },
    removeBlock: (id: string) => {
      const current = read();
      write({ blocks: current.blocks.filter((item) => item.id !== id), activities: current.activities.filter((item) => item.blockId !== id) });
    },
    saveActivity: (activity: FieldActivity) => {
      const current = read();
      const exists = current.activities.some((item) => item.id === activity.id);
      const list = exists ? current.activities.map((item) => (item.id === activity.id ? activity : item)) : [activity, ...current.activities];
      write({ ...current, activities: [...list].sort(byDateDesc) });
    },
    removeActivity: (id: string) => {
      const current = read();
      write({ ...current, activities: current.activities.filter((item) => item.id !== id) });
    },
    reset: () => write(defaultState),
  };
}

// ---- Date helpers ("YYYY-MM-DD" calendar days) ----

const toDay = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
};
const fromDay = (value: number) => new Date(value * 86_400_000).toISOString().slice(0, 10);

export const addDays = (iso: string, days: number) => fromDay(toDay(iso) + days);
export const daysBetween = (from: string, to: string) => toDay(to) - toDay(from);

/** When each block can next be manured: last manuring done + its interval. */
export function nextManuring(block: MulberryBlock, activities: FieldActivity[]) {
  const last = activities.find((item) => item.type === "Manuring" && item.status === "Done" && (item.blockId === block.id || item.blockId === "all"));
  const planned = activities
    .filter((item) => item.type === "Manuring" && item.status === "Planned" && (item.blockId === block.id || item.blockId === "all"))
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  return { last: last?.date ?? null, due: planned?.date ?? (last ? addDays(last.date, block.manuringEveryDays) : null), planned: !!planned };
}

/** The spray that decides whether a block's leaf can be fed: the one whose waiting period ends last. */
export function feedingSafety(block: MulberryBlock, activities: FieldActivity[], today: string) {
  const sprays = activities.filter((item) => item.status === "Done" && item.waitDays && (item.blockId === block.id || item.blockId === "all"));
  const latest = sprays.map((item) => ({ item, safeFrom: addDays(item.date, item.waitDays ?? 0) })).sort((a, b) => b.safeFrom.localeCompare(a.safeFrom))[0];
  if (!latest) return { safe: true, spray: null, safeFrom: null, daysLeft: 0 };
  const daysLeft = daysBetween(today, latest.safeFrom);
  return { safe: daysLeft <= 0, spray: latest.item, safeFrom: latest.safeFrom, daysLeft: Math.max(0, daysLeft) };
}
