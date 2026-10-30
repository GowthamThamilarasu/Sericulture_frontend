"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Droplets, PackagePlus, Plus, Settings2, Trash2, X } from "lucide-react";

import { useToday } from "@/components/dashboard/batch-store";
import { pushNotifications } from "@/components/dashboard/notifications";
import { Pill, buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";

// Stock tanks feeding the fertigation dose pump, saved per browser (demo mode: no level sensors yet).

export interface NutrientTank {
  id: string;
  label: string; // short name on the tank, e.g. "Urea"
  product: string;
  capacityL: number;
  levelL: number;
  dailyUseL: number;
  lowPct: number; // remind below this level
  lastFilled?: string; // "YYYY-MM-DD"
}

const defaultTanks: NutrientTank[] = [
  { id: "urea", label: "Urea", product: "Urea solution (46% N)", capacityL: 500, levelL: 160, dailyUseL: 12, lowPct: 20, lastFilled: "2026-10-04" },
  { id: "n", label: "N", product: "Calcium nitrate", capacityL: 500, levelL: 340, dailyUseL: 9, lowPct: 20, lastFilled: "2026-10-10" },
  { id: "p", label: "P", product: "Mono-ammonium phosphate", capacityL: 300, levelL: 210, dailyUseL: 5, lowPct: 20, lastFilled: "2026-10-08" },
  { id: "k", label: "K", product: "Potassium nitrate", capacityL: 300, levelL: 48, dailyUseL: 6, lowPct: 20, lastFilled: "2026-09-26" },
  { id: "bio", label: "Bio", product: "Bio-fertiliser (Azospirillum + PSB)", capacityL: 200, levelL: 120, dailyUseL: 3, lowPct: 25, lastFilled: "2026-10-01" },
];

const storageKey = "fertigation-tanks";
const listeners = new Set<() => void>();
let state: NutrientTank[] | null = null;

function read(): NutrientTank[] {
  if (state) return state;
  state = defaultTanks;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (Array.isArray(saved) && saved.length) state = saved;
  } catch {
    // Storage blocked or unreadable: keep the demo levels.
  }
  return state;
}

function write(next: NutrientTank[]) {
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

export function useNutrientTanks() {
  const tanks = useSyncExternalStore(subscribe, read, () => defaultTanks);
  return {
    tanks,
    save: (tank: NutrientTank) => write(read().map((item) => (item.id === tank.id ? tank : item))),
    add: (tank: NutrientTank) => write([...read(), tank]),
    // An empty list would bring the demo tanks back on reload, so the last tank stays.
    remove: (id: string) => read().length > 1 && write(read().filter((item) => item.id !== id)),
  };
}

const pct = (tank: NutrientTank) => Math.max(0, Math.min(100, (tank.levelL / Math.max(tank.capacityL, 1)) * 100));
const daysLeft = (tank: NutrientTank) => (tank.dailyUseL > 0 ? Math.floor(tank.levelL / tank.dailyUseL) : null);
const isLow = (tank: NutrientTank) => pct(tank) < tank.lowPct;
const litres = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });
const field = "w-full rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] px-3 py-2 text-sm font-semibold text-[var(--d-text)] outline-none focus:border-[var(--d-accent)]";
const fieldLabel = "mb-1.5 block text-xs font-semibold text-[var(--d-soft)]";

// Tank drawing: the liquid rises with the level, with a slow wave on its surface.
function TankGauge({ tank }: { tank: NutrientTank }) {
  const level = pct(tank);
  const low = isLow(tank);
  return (
    <div className="relative mx-auto h-40 w-24" role="meter" aria-valuemin={0} aria-valuemax={tank.capacityL} aria-valuenow={tank.levelL} aria-label={`${tank.label} tank ${Math.round(level)}% full`}>
      <div className="absolute inset-x-6 -top-1 h-2 rounded-t-md bg-[var(--d-track)]" />
      <div className="absolute inset-0 top-1 overflow-hidden rounded-[22px] border-2 border-[var(--d-card-border)] bg-[var(--d-inset)]">
        <div className="absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-out" style={{ height: `${level}%` }}>
          <svg viewBox="0 0 200 20" preserveAspectRatio="none" className="tank-wave absolute -top-3 left-0 h-4 w-[200%]" aria-hidden="true">
            <path d="M0 10 Q 25 0 50 10 T 100 10 T 150 10 T 200 10 V20 H0 Z" fill={low ? "#f5b942" : "#3fbf5f"} />
          </svg>
          <div className={`h-full w-full ${low ? "bg-gradient-to-b from-[#f5b942] to-[#b45309]" : "bg-gradient-to-b from-[#3fbf5f] to-[#0f5c2e]"}`} />
        </div>
        {[25, 50, 75].map((mark) => (
          <span key={mark} className="absolute right-0 h-px w-3 bg-[var(--d-muted)] opacity-40" style={{ bottom: `${mark}%` }} />
        ))}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* The number sits mid-tank: white over liquid, dark over the empty part. */}
          <span className={`text-xl font-extrabold tabular-nums ${level >= 55 ? "text-white drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.55)]" : "text-[var(--d-text)]"}`}>{Math.round(level)}%</span>
        </div>
      </div>
    </div>
  );
}

function TankDialog({ tank, onClose }: { tank: NutrientTank; onClose: () => void }) {
  const { tanks, save, remove } = useNutrientTanks();
  const today = useToday();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [add, setAdd] = useState("");
  const [capacity, setCapacity] = useState(String(tank.capacityL));
  const [level, setLevel] = useState(String(tank.levelL));
  const [dailyUse, setDailyUse] = useState(String(tank.dailyUseL));
  const [lowPct, setLowPct] = useState(String(tank.lowPct));
  const [product, setProduct] = useState(tank.product);
  const space = Math.max(0, tank.capacityL - tank.levelL);
  const label = fieldLabel;
  const added = Number(add);
  const settingsValid = Number(capacity) > 0 && Number(level) >= 0 && Number(level) <= Number(capacity) && Number(dailyUse) >= 0 && Number(lowPct) >= 0 && Number(lowPct) <= 90;

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <Dialog.Title className="text-lg font-semibold">{tank.label} tank</Dialog.Title>
            <Dialog.Description className="mt-0.5 text-xs text-[var(--d-muted)]">
              {tank.product} · {litres(tank.levelL)} of {litres(tank.capacityL)} L
            </Dialog.Description>
          </div>
          <Dialog.Close aria-label="Close" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
            <X className="h-5 w-5" />
          </Dialog.Close>
        </div>

        <div className="rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <PackagePlus className="h-4 w-4 text-[var(--d-accent)]" aria-hidden="true" /> Refill
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex flex-1 items-center rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] focus-within:border-[var(--d-accent)]">
              <input type="number" inputMode="decimal" min={0} max={space} value={add} onChange={(event) => setAdd(event.target.value)} placeholder={`Up to ${litres(space)}`} aria-label="Litres added" className="w-full bg-transparent px-3 py-2 text-sm font-semibold outline-none" />
              <span className="pr-3 text-xs text-[var(--d-muted)]">L</span>
            </div>
            <button
              type="button"
              disabled={!(added > 0 && added <= space)}
              onClick={() => {
                save({ ...tank, levelL: tank.levelL + added, lastFilled: today });
                onClose();
              }}
              className={buttonPrimary}
            >
              Add
            </button>
          </div>
          <button
            type="button"
            disabled={space === 0}
            onClick={() => {
              save({ ...tank, levelL: tank.capacityL, lastFilled: today });
              onClose();
            }}
            className={`${buttonSecondary} mt-2 w-full`}
          >
            Fill to full (+{litres(space)} L)
          </button>
        </div>

        <form
          className="mt-4 rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!settingsValid) return;
            save({ ...tank, product: product.trim() || tank.product, capacityL: Number(capacity), levelL: Number(level), dailyUseL: Number(dailyUse), lowPct: Number(lowPct) });
            onClose();
          }}
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Settings2 className="h-4 w-4 text-[var(--d-accent)]" aria-hidden="true" /> Tank settings
          </div>
          <label className="block">
            <span className={label}>Product</span>
            <input value={product} onChange={(event) => setProduct(event.target.value)} className={field} />
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { name: "Capacity (L)", value: capacity, set: setCapacity },
              { name: "Current level (L)", value: level, set: setLevel },
              { name: "Daily use (L)", value: dailyUse, set: setDailyUse },
              { name: "Remind below (%)", value: lowPct, set: setLowPct },
            ].map((item) => (
              <label key={item.name} className="block">
                <span className={label}>{item.name}</span>
                <input type="number" inputMode="decimal" min={0} value={item.value} onChange={(event) => item.set(event.target.value)} className={field} />
              </label>
            ))}
          </div>
          {!settingsValid && <div className="mt-2 text-xs font-semibold text-[var(--d-danger-text)]">Level must be between 0 and the capacity; reminder 0–90%.</div>}
          <div className="mt-3 flex justify-end">
            <button type="submit" disabled={!settingsValid} className={buttonPrimary}>
              Save settings
            </button>
          </div>
        </form>

        {tanks.length > 1 && (
          <div className="mt-4 flex items-center justify-end gap-2">
            {confirmRemove && <span className="mr-auto text-xs font-semibold text-[var(--d-danger-text)]">Remove the {tank.label} tank?</span>}
            {confirmRemove && (
              <button type="button" onClick={() => setConfirmRemove(false)} className={buttonSecondary}>
                Keep
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (!confirmRemove) return setConfirmRemove(true);
                remove(tank.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--d-danger-text)] hover:bg-[var(--d-chip)]"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" /> {confirmRemove ? "Remove" : "Remove tank"}
            </button>
          </div>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}

function AddTankDialog({ onClose }: { onClose: () => void }) {
  const { tanks, add } = useNutrientTanks();
  const today = useToday();
  const [name, setName] = useState("");
  const [product, setProduct] = useState("");
  const [capacity, setCapacity] = useState("");
  const [level, setLevel] = useState("");
  const [dailyUse, setDailyUse] = useState("");
  const [lowPct, setLowPct] = useState("20");
  const label = name.trim();
  const taken = tanks.some((tank) => tank.label.toLowerCase() === label.toLowerCase());
  const cap = Number(capacity);
  const lvl = Number(level || 0);
  const error = !label
    ? "Give the tank a name."
    : taken
      ? `A tank called ${label} already exists.`
      : !(cap > 0)
        ? "Capacity must be more than 0 L."
        : lvl < 0 || lvl > cap
          ? "Current level must be between 0 and the capacity."
          : Number(dailyUse || 0) < 0 || Number(lowPct) < 0 || Number(lowPct) > 90
            ? "Daily use can't be negative; reminder 0–90%."
            : null;

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <Dialog.Title className="text-lg font-semibold">Add a tank</Dialog.Title>
            <Dialog.Description className="mt-0.5 text-xs text-[var(--d-muted)]">A new stock tank feeding the dose pump</Dialog.Description>
          </div>
          <Dialog.Close aria-label="Close" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
            <X className="h-5 w-5" />
          </Dialog.Close>
        </div>

        <form
          className="rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (error) return;
            add({
              id: `tank-${Date.now().toString(36)}`,
              label,
              product: product.trim() || label,
              capacityL: cap,
              levelL: lvl,
              dailyUseL: Number(dailyUse || 0),
              lowPct: Number(lowPct),
              lastFilled: lvl > 0 ? today : undefined,
            });
            onClose();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={fieldLabel}>Tank name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Mg" maxLength={12} autoFocus className={field} />
            </label>
            <label className="block">
              <span className={fieldLabel}>Product</span>
              <input value={product} onChange={(event) => setProduct(event.target.value)} placeholder="e.g. Magnesium sulphate" className={field} />
            </label>
            {[
              { name: "Capacity (L)", value: capacity, set: setCapacity, placeholder: "e.g. 300" },
              { name: "Current level (L)", value: level, set: setLevel, placeholder: "0" },
              { name: "Daily use (L)", value: dailyUse, set: setDailyUse, placeholder: "0" },
              { name: "Remind below (%)", value: lowPct, set: setLowPct, placeholder: "20" },
            ].map((item) => (
              <label key={item.name} className="block">
                <span className={fieldLabel}>{item.name}</span>
                <input type="number" inputMode="decimal" min={0} value={item.value} onChange={(event) => item.set(event.target.value)} placeholder={item.placeholder} className={field} />
              </label>
            ))}
          </div>
          {error && (name || capacity) && <div className="mt-2 text-xs font-semibold text-[var(--d-danger-text)]">{error}</div>}
          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close className={buttonSecondary}>Cancel</Dialog.Close>
            <button type="submit" disabled={!!error} className={buttonPrimary}>
              Add tank
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export function NutrientTanks() {
  const { tanks } = useNutrientTanks();
  const [editing, setEditing] = useState<NutrientTank | null>(null);
  const [adding, setAdding] = useState(false);
  const total = tanks.reduce((sum, tank) => sum + tank.levelL, 0);
  const capacity = tanks.reduce((sum, tank) => sum + tank.capacityL, 0);
  const low = tanks.filter(isLow);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--d-accent-soft)] px-3 py-1.5 font-semibold text-[var(--d-accent)]">
          <Droplets className="h-3.5 w-3.5" aria-hidden="true" /> {litres(total)} L available of {litres(capacity)} L
        </span>
        {low.length > 0 && <Pill tone="warn">{`${low.map((tank) => tank.label).join(", ")} running low`}</Pill>}
      </div>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(11.5rem,1fr))]">
        {tanks.map((tank) => {
          const days = daysLeft(tank);
          const warn = isLow(tank);
          return (
            <button
              key={tank.id}
              type="button"
              onClick={() => setEditing(tank)}
              className={`dash-card group flex flex-col items-center rounded-2xl border bg-[var(--d-card)] p-4 text-center transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-md ${warn ? "border-[var(--d-warn)]" : "border-[var(--d-card-border)]"}`}
            >
              <div className="mb-3 flex w-full items-center justify-between gap-2">
                <span className="text-base font-extrabold text-[var(--d-text)]">{tank.label}</span>
                {warn ? <Pill tone="warn">Low</Pill> : <Pill>OK</Pill>}
              </div>
              <TankGauge tank={tank} />
              <div className="mt-3 w-full">
                <div className="truncate text-[11px] text-[var(--d-muted)]" title={tank.product}>
                  {tank.product}
                </div>
                <div className="mt-1 text-lg font-bold tabular-nums text-[var(--d-text)]">
                  {litres(tank.levelL)} <span className="text-xs font-medium text-[var(--d-muted)]">/ {litres(tank.capacityL)} L</span>
                </div>
                <div className={`text-xs font-semibold ${warn ? "text-[var(--d-warn)]" : "text-[var(--d-soft)]"}`}>{days === null ? "No daily use set" : `≈ ${days} day${days === 1 ? "" : "s"} left`}</div>
              </div>
              <span className="mt-3 w-full rounded-lg bg-[var(--d-chip)] py-1.5 text-xs font-semibold text-[var(--d-soft)] transition-colors group-hover:accent-fill">Refill / settings</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--d-line)] p-4 text-center text-[var(--d-soft)] transition-colors hover:border-[var(--d-accent)] hover:text-[var(--d-accent)]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--d-chip)]">
            <Plus className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold">Add tank</span>
          <span className="text-xs text-[var(--d-muted)]">Set up another stock tank</span>
        </button>
      </div>
      {editing && <TankDialog tank={editing} onClose={() => setEditing(null)} />}
      {adding && <AddTankDialog onClose={() => setAdding(false)} />}
    </div>
  );
}

/** Sends a reminder to the notification bell when a tank falls below its level. Mounted once in the dashboard shell. */
export function TankReminders() {
  const { tanks } = useNutrientTanks();
  const today = useToday();
  const low = tanks.filter(isLow);
  const key = low.map((tank) => `${tank.id}:${Math.round(tank.levelL)}`).join("|") + today;

  useEffect(() => {
    if (!low.length) return;
    pushNotifications(
      low.map((tank) => ({
        id: `tank-${tank.id}-${today}`,
        severity: "Automation",
        parameter: `${tank.label} tank low`,
        value: `${Math.round(pct(tank))}% · ${litres(tank.levelL)} L left`,
        timestamp: "Today",
        location: "Fertigation unit",
        recommendedAction: `Refill the ${tank.product} tank${daysLeft(tank) !== null ? `: about ${daysLeft(tank)} days left at ${tank.dailyUseL} L a day` : ""}. Update it under Fertigation → Nutrient Tanks.`,
        status: "Open",
      })),
    );
    // `key` captures every value used here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}
