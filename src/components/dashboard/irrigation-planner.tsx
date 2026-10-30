"use client";

import { useState, useSyncExternalStore } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Clock, Maximize2, Plus, RotateCcw, Trash2, X } from "lucide-react";

import { Toggle } from "@/components/dashboard/dashboard-widgets";
import { InfoRow, Pill, buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";
import { farmValves, irrigationSchedules, volumeSettings as initialVolumes } from "@/data/mock";
import type { IrrigationSchedule, VolumeSettings, Weekday } from "@/types";

const weekdays: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const valveById = Object.fromEntries(farmValves.map((valve) => [valve.id, valve]));

// Litres a run delivers: its volume limit, or duration × the valve's flow rate.
const runLitres = (schedule: IrrigationSchedule) => (schedule.limit === "volume" ? schedule.volume : schedule.duration * (valveById[schedule.valveId]?.flowRate ?? 0));
const runMinutes = (schedule: IrrigationSchedule) => (schedule.limit === "duration" ? schedule.duration : schedule.volume / Math.max(valveById[schedule.valveId]?.flowRate ?? 1, 1));

// Current minute on the client (null while server rendering), refreshed every 30 s.
function subscribeMinute(listener: () => void) {
  const timer = window.setInterval(listener, 30_000);
  return () => window.clearInterval(timer);
}
const useNowMinute = () => useSyncExternalStore(subscribeMinute, () => Math.floor(Date.now() / 60_000), () => null);

function nextRun(schedules: IrrigationSchedule[], minute: number | null) {
  if (minute === null) return null;
  const now = new Date(minute * 60_000);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const today = (now.getDay() + 6) % 7; // Monday = 0
  for (let offset = 0; offset < 8; offset++) {
    const day = weekdays[(today + offset) % 7];
    const candidates = schedules
      .filter((schedule) => schedule.enabled && schedule.days.includes(day))
      .map((schedule) => ({ schedule, at: Number(schedule.start.slice(0, 2)) * 60 + Number(schedule.start.slice(3)) }))
      .filter(({ at }) => offset > 0 || at > nowMinutes)
      .sort((a, b) => a.at - b.at);
    if (candidates[0]) return { schedule: candidates[0].schedule, day: offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : day };
  }
  return null;
}

function NumberField({ id, label, value, unit, min = 0, max, step = 1, onChange }: { id: string; label: string; value: number; unit: string; min?: number; max?: number; step?: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--d-line)] py-2 last:border-b-0">
      <label htmlFor={id} className="text-sm text-[var(--d-soft)]">
        {label}
      </label>
      <div className="flex items-center rounded-md border border-[var(--d-line)] bg-[var(--d-popup)]">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Math.min(max ?? Infinity, Math.max(min, Number(event.target.value) || 0)))}
          className="w-20 bg-transparent px-2 py-1.5 text-right text-sm font-semibold text-[var(--d-text)] outline-none"
        />
        <span className="pr-2 text-xs text-[var(--d-muted)]">{unit}</span>
      </div>
    </div>
  );
}

function ScheduleRow({ schedule, onChange, onRemove }: { schedule: IrrigationSchedule; onChange: (next: Partial<IrrigationSchedule>) => void; onRemove: () => void }) {
  const valve = valveById[schedule.valveId];
  const toggleDay = (day: Weekday) => onChange({ days: schedule.days.includes(day) ? schedule.days.filter((value) => value !== day) : weekdays.filter((value) => value === day || schedule.days.includes(value)) });
  const fieldClass = "rounded-md border border-[var(--d-line)] bg-[var(--d-popup)] px-2 py-1.5 text-sm font-semibold text-[var(--d-text)] outline-none";

  return (
    <div className={`rounded-md bg-[var(--d-inset)] p-3 ${schedule.enabled ? "" : "opacity-60"}`}>
      <div className="flex flex-wrap items-center gap-3">
        <Toggle size="sm" on={schedule.enabled} onChange={() => onChange({ enabled: !schedule.enabled })} label={`Schedule for ${valve?.name ?? "valve"} enabled`} />
        <select aria-label="Valve" value={schedule.valveId} onChange={(event) => onChange({ valveId: event.target.value })} className={fieldClass}>
          {farmValves.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name} · {option.zone}
            </option>
          ))}
        </select>
        <input type="time" aria-label="Start time" value={schedule.start} onChange={(event) => event.target.value && onChange({ start: event.target.value })} className={fieldClass} />
        <button type="button" onClick={onRemove} aria-label="Delete schedule" title="Delete schedule" className="ml-auto rounded-md p-1.5 text-[var(--d-muted)] transition-colors hover:bg-[var(--d-danger-soft)] hover:text-[var(--d-danger-text)]">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Days">
        {weekdays.map((day) => {
          const on = schedule.days.includes(day);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={on}
              onClick={() => toggleDay(day)}
              className={`h-8 w-11 rounded-md text-xs font-semibold transition-colors ${on ? "accent-fill" : "bg-[var(--d-chip)] text-[var(--d-muted)] hover:bg-[var(--d-chip-hover)]"}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <div role="radiogroup" aria-label="Stop after" className="inline-flex rounded-md bg-[var(--d-chip)] p-0.5">
          {(["volume", "duration"] as const).map((limit) => (
            <button
              key={limit}
              type="button"
              role="radio"
              aria-checked={schedule.limit === limit}
              onClick={() => onChange({ limit })}
              className={`rounded px-2.5 py-1 font-semibold ${schedule.limit === limit ? "accent-fill" : "text-[var(--d-muted)]"}`}
            >
              {limit === "volume" ? "Volume" : "Duration"}
            </button>
          ))}
        </div>
        <div className="flex items-center rounded-md border border-[var(--d-line)] bg-[var(--d-popup)]">
          <input
            type="number"
            inputMode="numeric"
            aria-label={schedule.limit === "volume" ? "Volume in litres" : "Duration in minutes"}
            min={1}
            step={schedule.limit === "volume" ? 10 : 1}
            value={schedule.limit === "volume" ? schedule.volume : schedule.duration}
            onChange={(event) => onChange(schedule.limit === "volume" ? { volume: Math.max(1, Number(event.target.value) || 1) } : { duration: Math.max(1, Number(event.target.value) || 1) })}
            className="w-20 bg-transparent px-2 py-1.5 text-right font-semibold text-[var(--d-text)] outline-none"
          />
          <span className="pr-2 text-[var(--d-muted)]">{schedule.limit === "volume" ? "L" : "min"}</span>
        </div>
        <span className="text-[var(--d-muted)]">
          ≈ {schedule.limit === "volume" ? `${Math.round(runMinutes(schedule))} min` : `${Math.round(runLitres(schedule))} L`} at {valve?.flowRate} L/min
        </span>
      </div>
    </div>
  );
}

// Hour and minute from "HH:MM", shown the way the time inputs show them (e.g. 6:00 AM).
const clock = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
};

// Small summary card in the scheduler grid; the switch works in place, the rest opens the editor popup.
function ScheduleCard({ schedule, onToggle, onOpen }: { schedule: IrrigationSchedule; onToggle: () => void; onOpen: () => void }) {
  const valve = valveById[schedule.valveId];
  const amount = schedule.limit === "volume" ? `${schedule.volume} L · ≈ ${Math.round(runMinutes(schedule))} min` : `${schedule.duration} min · ≈ ${Math.round(runLitres(schedule))} L`;
  return (
    <div className={`group flex flex-col rounded-xl border border-[var(--d-card-border)] bg-[var(--d-inset)] p-3 transition-[box-shadow,translate,opacity] hover:-translate-y-0.5 hover:shadow-md ${schedule.enabled ? "" : "opacity-60"}`}>
      <div className="flex items-center justify-between gap-2">
        <Toggle size="sm" on={schedule.enabled} onChange={onToggle} label={`Schedule for ${valve?.name ?? "valve"} at ${clock(schedule.start)} enabled`} />
        <Pill tone={schedule.enabled ? "accent" : "muted"}>{schedule.enabled ? "On" : "Off"}</Pill>
      </div>
      <button type="button" onClick={onOpen} className="mt-3 flex flex-1 flex-col text-left" aria-label={`Edit schedule: ${valve?.name ?? "valve"} at ${clock(schedule.start)}`}>
        <span className="flex w-full items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-[var(--d-text)]">{valve?.name ?? "Removed valve"}</span>
            <span className="block truncate text-[11px] text-[var(--d-muted)]">{valve?.zone}</span>
          </span>
          <Maximize2 className="h-3.5 w-3.5 shrink-0 text-[var(--d-muted)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
        </span>
        <span className="mt-2 flex items-center gap-1.5 text-xl font-bold tabular-nums text-[var(--d-text)]">
          <Clock className="h-4 w-4 text-[var(--d-accent)]" aria-hidden="true" />
          {clock(schedule.start)}
        </span>
        <span className="mt-2 flex gap-1" aria-label={`Days: ${schedule.days.join(", ") || "none"}`}>
          {weekdays.map((day) => (
            <span
              key={day}
              className={`flex h-6 flex-1 items-center justify-center rounded text-[10px] font-semibold ${schedule.days.includes(day) ? "accent-fill" : "bg-[var(--d-chip)] text-[var(--d-muted)]"}`}
            >
              {day.charAt(0)}
            </span>
          ))}
        </span>
        <span className="mt-2 text-xs text-[var(--d-soft)]">{amount}</span>
      </button>
    </div>
  );
}

// Schedules and volume limits shared by every Scheduler and Volume tab (Farm Monitor, Irrigation).
// One store for the whole dashboard, saved per browser so edits survive tab changes and reloads.
type PlanState = { schedules: IrrigationSchedule[]; volumes: VolumeSettings };
type Update<T> = T | ((current: T) => T);

const planKey = "irrigation-plan";
const defaultPlan: PlanState = { schedules: irrigationSchedules, volumes: initialVolumes };
const planListeners = new Set<() => void>();
let planState: PlanState | null = null;

function readPlan(): PlanState {
  if (planState) return planState;
  planState = defaultPlan;
  try {
    const saved = JSON.parse(localStorage.getItem(planKey) ?? "null") as Partial<PlanState> | null;
    if (saved && Array.isArray(saved.schedules) && saved.volumes) planState = { schedules: saved.schedules, volumes: { ...initialVolumes, ...saved.volumes } };
  } catch {
    // Storage blocked or unreadable: keep the defaults.
  }
  return planState;
}

function writePlan(next: PlanState) {
  planState = next;
  try {
    localStorage.setItem(planKey, JSON.stringify(next));
  } catch {
    // Storage blocked: the change still applies until the page is reloaded.
  }
  planListeners.forEach((listener) => listener());
}

function subscribePlan(listener: () => void) {
  planListeners.add(listener);
  return () => planListeners.delete(listener);
}

const apply = <T,>(update: Update<T>, current: T) => (typeof update === "function" ? (update as (value: T) => T)(current) : update);

export function useIrrigationPlan() {
  const { schedules, volumes } = useSyncExternalStore(subscribePlan, readPlan, () => defaultPlan);
  const setSchedules = (update: Update<IrrigationSchedule[]>) => writePlan({ ...readPlan(), schedules: apply(update, readPlan().schedules) });
  const setVolumes = (update: Update<VolumeSettings>) => writePlan({ ...readPlan(), volumes: apply(update, readPlan().volumes) });
  const reset = () => writePlan(defaultPlan);
  return { schedules, setSchedules, volumes, setVolumes, reset };
}

type Plan = ReturnType<typeof useIrrigationPlan>;

// Planned litres per weekday from enabled schedules.
const plannedByDay = (schedules: IrrigationSchedule[]) =>
  weekdays.map((day) => ({ day, litres: schedules.filter((schedule) => schedule.enabled && schedule.days.includes(day)).reduce((sum, schedule) => sum + runLitres(schedule), 0) }));

const dayPresets: { label: string; days: Weekday[] }[] = [
  { label: "Every day", days: weekdays },
  { label: "Weekdays", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { label: "Mon · Wed · Fri", days: ["Mon", "Wed", "Fri"] },
  { label: "Tue · Thu · Sat", days: ["Tue", "Thu", "Sat"] },
];

// Form for a new schedule. Mounted only while open, so it starts fresh each time.
function AddScheduleForm({ volumes, onAdd }: { volumes: VolumeSettings; onAdd: (schedule: IrrigationSchedule) => void }) {
  const [valveId, setValveId] = useState(farmValves[0].id);
  const [start, setStart] = useState("06:00");
  const [days, setDays] = useState<Weekday[]>(["Mon", "Wed", "Fri"]);
  const [limit, setLimit] = useState<IrrigationSchedule["limit"]>("volume");
  const [amount, setAmount] = useState(String(volumes.perCycle[farmValves[0].id] ?? farmValves[0].volume));
  const [enabled, setEnabled] = useState(true);

  const valve = valveById[valveId];
  const value = Number(amount);
  const amountOk = amount.trim() !== "" && Number.isFinite(value) && value >= 1 && value <= (limit === "volume" ? 10000 : 600);
  const valid = amountOk && days.length > 0 && /^\d{2}:\d{2}$/.test(start);
  const flow = Math.max(valve?.flowRate ?? 1, 1);
  const estimate = limit === "volume" ? `≈ ${Math.round(value / flow)} min at ${flow} L/min` : `≈ ${Math.round(value * flow)} L at ${flow} L/min`;

  // Switching valve or limit refills the amount with that valve's default run.
  const defaults = (id: string, nextLimit: IrrigationSchedule["limit"]) => {
    const litres = volumes.perCycle[id] ?? valveById[id]?.volume ?? 100;
    setAmount(String(nextLimit === "volume" ? litres : Math.max(1, Math.round(litres / Math.max(valveById[id]?.flowRate ?? 1, 1)))));
  };
  const toggleDay = (day: Weekday) => setDays((current) => (current.includes(day) ? current.filter((value) => value !== day) : weekdays.filter((value) => value === day || current.includes(value))));

  const label = "text-xs font-semibold text-[var(--d-soft)]";
  const field = "w-full rounded-lg border border-[var(--d-line)] bg-[var(--d-card)] px-3 py-2 text-sm font-semibold text-[var(--d-text)] outline-none focus:border-[var(--d-accent)]";
  const chip = (on: boolean) => `rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${on ? "accent-fill" : "bg-[var(--d-chip)] text-[var(--d-text)] hover:bg-[var(--d-chip-hover)]"}`;

  return (
    <>
      <Dialog.Overlay className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-[2px]" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[66] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!valid) return;
            const volume = limit === "volume" ? value : Math.round(value * flow);
            const duration = limit === "duration" ? value : Math.max(1, Math.round(value / flow));
            onAdd({ id: `sch-${Date.now()}`, valveId, start, days, limit, volume, duration, enabled });
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-lg font-semibold">Add schedule</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-[var(--d-muted)]">Pick a valve, when it should water and how much.</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Cancel" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="new-schedule-valve" className={label}>
                Valve
              </label>
              <select
                id="new-schedule-valve"
                value={valveId}
                onChange={(event) => {
                  setValveId(event.target.value);
                  defaults(event.target.value, limit);
                }}
                className={`mt-1.5 ${field}`}
              >
                {farmValves.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} · {option.zone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-schedule-start" className={label}>
                Start time
              </label>
              <input id="new-schedule-start" type="time" required value={start} onChange={(event) => setStart(event.target.value)} className={`mt-1.5 ${field}`} />
            </div>
          </div>

          <div className="mt-4">
            <div className={label}>Days</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {dayPresets.map((preset) => (
                <button key={preset.label} type="button" onClick={() => setDays(preset.days)} className={chip(preset.days.join() === days.join())}>
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Days">
              {weekdays.map((day) => {
                const on = days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleDay(day)}
                    className={`h-9 w-11 rounded-md text-xs font-semibold transition-colors ${on ? "accent-fill" : "bg-[var(--d-chip)] text-[var(--d-muted)] hover:bg-[var(--d-chip-hover)]"}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {days.length === 0 && <div className="mt-1.5 text-[11px] font-semibold text-[var(--d-danger)]">Pick at least one day.</div>}
          </div>

          <div className="mt-4 rounded-xl bg-[var(--d-card)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className={label}>Stop after</div>
              <div role="radiogroup" aria-label="Stop after" className="inline-flex rounded-md bg-[var(--d-chip)] p-0.5 text-xs">
                {(["volume", "duration"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={limit === option}
                    onClick={() => {
                      setLimit(option);
                      defaults(valveId, option);
                    }}
                    className={`rounded px-3 py-1 font-semibold ${limit === option ? "accent-fill" : "text-[var(--d-muted)]"}`}
                  >
                    {option === "volume" ? "Volume" : "Duration"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-center gap-1.5">
              <input
                type="number"
                inputMode="numeric"
                aria-label={limit === "volume" ? "Volume in litres" : "Duration in minutes"}
                min={1}
                step={limit === "volume" ? 10 : 1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                aria-invalid={!amountOk}
                className="w-28 rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] px-2 py-2 text-center text-2xl font-bold tabular-nums text-[var(--d-accent)] outline-none focus:border-[var(--d-accent)]"
              />
              <span className="text-sm font-semibold text-[var(--d-muted)]">{limit === "volume" ? "L" : "min"}</span>
            </div>
            <div className={`mt-2 text-center text-[11px] ${amountOk ? "text-[var(--d-muted)]" : "font-semibold text-[var(--d-danger)]"}`}>
              {amountOk ? estimate : limit === "volume" ? "Enter 1 to 10,000 L" : "Enter 1 to 600 min"}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-sm text-[var(--d-soft)]">Turn on now</span>
            <Toggle size="sm" on={enabled} onChange={() => setEnabled((value) => !value)} label="Enable this schedule" />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close className="rounded-lg bg-[var(--d-chip)] px-4 py-2 text-sm font-medium hover:bg-[var(--d-chip-hover)]">Cancel</Dialog.Close>
            <button type="submit" disabled={!valid} className="rounded-lg accent-fill px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              Add schedule
            </button>
          </div>
        </form>
      </Dialog.Content>
    </>
  );
}

export function SchedulerPanel({ plan }: { plan: Plan }) {
  const { schedules, setSchedules, volumes, reset } = plan;
  const minute = useNowMinute();
  const upcoming = nextRun(schedules, minute);

  const update = (id: string, next: Partial<IrrigationSchedule>) => setSchedules((current) => current.map((schedule) => (schedule.id === id ? { ...schedule, ...next } : schedule)));
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingSchedule = schedules.find((schedule) => schedule.id === editingId);
  const add = (schedule: IrrigationSchedule) => {
    setSchedules((current) => [...current, schedule]);
    setAdding(false);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-[var(--d-muted)]">
          {upcoming ? (
            <>
              Next run: <span className="font-semibold text-[var(--d-text)]">{valveById[upcoming.schedule.valveId]?.name}</span> · {upcoming.day} {upcoming.schedule.start} · ≈ {Math.round(runLitres(upcoming.schedule))} L
            </>
          ) : minute === null ? (
            "Working out the next run…"
          ) : (
            "No enabled schedules"
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={reset} className={buttonSecondary} title="Restore the default schedules and volumes">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset
          </button>
          <button type="button" onClick={() => setAdding(true)} className={buttonPrimary}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add schedule
          </button>
        </div>
        <Dialog.Root open={adding} onOpenChange={setAdding}>
          {adding && <AddScheduleForm volumes={volumes} onAdd={add} />}
        </Dialog.Root>
      </div>
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(13.5rem,1fr))]">
        {schedules.map((schedule) => (
          <ScheduleCard key={schedule.id} schedule={schedule} onToggle={() => update(schedule.id, { enabled: !schedule.enabled })} onOpen={() => setEditingId(schedule.id)} />
        ))}
      </div>
      {schedules.length === 0 && <div className="py-6 text-center text-xs text-[var(--d-muted)]">No schedules yet. Add one to water on a timer.</div>}

      {/* Editor popup: changes apply as you make them. Not portalled, so it keeps the dashboard theme variables. */}
      <Dialog.Root open={!!editingSchedule} onOpenChange={(open) => !open && setEditingId(null)}>
        {editingSchedule && (
          <>
            <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]" />
            <Dialog.Content
              aria-describedby={undefined}
              className="fixed left-1/2 top-1/2 z-[61] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <Dialog.Title className="text-lg font-semibold">Edit schedule</Dialog.Title>
                <Dialog.Close aria-label="Close" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
              <ScheduleRow
                schedule={editingSchedule}
                onChange={(next) => update(editingSchedule.id, next)}
                onRemove={() => {
                  setSchedules((current) => current.filter((item) => item.id !== editingSchedule.id));
                  setEditingId(null);
                }}
              />
              <div className="mt-4 flex justify-end">
                <Dialog.Close className={buttonPrimary}>Done</Dialog.Close>
              </div>
            </Dialog.Content>
          </>
        )}
      </Dialog.Root>
    </div>
  );
}

export function VolumePanel({ plan }: { plan: Plan }) {
  const { schedules, volumes, setVolumes } = plan;
  const planned = plannedByDay(schedules);
  const peak = Math.max(...planned.map((item) => item.litres), volumes.dailyBudget, 1);

  return (
    <div className="grid gap-x-8 gap-y-4 lg:grid-cols-2">
      <div>
        <NumberField id="vol-budget" label="Daily water budget" value={volumes.dailyBudget} unit="L" step={50} onChange={(dailyBudget) => setVolumes((current) => ({ ...current, dailyBudget }))} />
        <NumberField id="vol-reserve" label="Tank reserve" value={volumes.tankReserve} unit="%" max={90} step={5} onChange={(tankReserve) => setVolumes((current) => ({ ...current, tankReserve }))} />
        <NumberField id="vol-flow" label="Max line flow" value={volumes.maxFlow} unit="L/min" step={5} onChange={(maxFlow) => setVolumes((current) => ({ ...current, maxFlow }))} />

        <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">Default volume per run</div>
        {farmValves.map((valve) => (
          <NumberField
            key={valve.id}
            id={`vol-${valve.id}`}
            label={`${valve.name} · ${valve.zone}`}
            value={volumes.perCycle[valve.id] ?? valve.volume}
            unit="L"
            step={10}
            onChange={(litres) => setVolumes((current) => ({ ...current, perCycle: { ...current.perCycle, [valve.id]: litres } }))}
          />
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">Planned per day vs budget</div>
          {planned.some((item) => item.litres > volumes.dailyBudget) ? <Pill tone="warn">Over budget</Pill> : <Pill>Within budget</Pill>}
        </div>
        <div className="mt-3 space-y-2">
          {planned.map((item) => {
            const over = item.litres > volumes.dailyBudget;
            return (
              <div key={item.day} className="flex items-center gap-2 text-xs" title={`${item.day}: ${Math.round(item.litres)} L planned of ${volumes.dailyBudget} L`}>
                <span className="w-8 text-[var(--d-muted)]">{item.day}</span>
                <div className="relative h-2 flex-1 rounded-full bg-[var(--d-track)]">
                  <div className="h-full rounded-full" style={{ width: `${(item.litres / peak) * 100}%`, backgroundColor: over ? "var(--d-warn)" : "var(--d-tint, var(--d-accent))" }} />
                  <div className="absolute -top-0.5 h-3 w-0.5 rounded bg-[var(--d-text)]" style={{ left: `${(volumes.dailyBudget / peak) * 100}%` }} aria-hidden="true" />
                </div>
                <span className={`w-14 text-right font-semibold tabular-nums ${over ? "text-[var(--d-warn)]" : "text-[var(--d-text)]"}`}>{Math.round(item.litres)} L</span>
              </div>
            );
          })}
        </div>
        <div className="mt-1 text-[10px] text-[var(--d-muted)]">The line marks the daily budget.</div>
        <div className="mt-3">
          <InfoRow label="Weekly planned" value={`${Math.round(planned.reduce((sum, item) => sum + item.litres, 0)).toLocaleString()} L`} />
        </div>
      </div>
    </div>
  );
}
