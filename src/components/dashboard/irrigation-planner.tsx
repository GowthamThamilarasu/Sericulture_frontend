"use client";

import { useState, useSyncExternalStore } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Toggle } from "@/components/dashboard/dashboard-widgets";
import { InfoRow, Pill, buttonPrimary } from "@/components/dashboard/page-kit";
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
              className={`h-8 w-11 rounded-md text-xs font-semibold transition-colors ${on ? "bg-[var(--d-accent)] text-[var(--d-on-accent)]" : "bg-[var(--d-chip)] text-[var(--d-muted)] hover:bg-[var(--d-chip-hover)]"}`}
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
              className={`rounded px-2.5 py-1 font-semibold ${schedule.limit === limit ? "bg-[var(--d-accent)] text-[var(--d-on-accent)]" : "text-[var(--d-muted)]"}`}
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

// Schedules and volume limits shared by the Scheduler and Volume tabs.
export function useIrrigationPlan() {
  const [schedules, setSchedules] = useState(irrigationSchedules);
  const [volumes, setVolumes] = useState<VolumeSettings>(initialVolumes);
  return { schedules, setSchedules, volumes, setVolumes };
}

type Plan = ReturnType<typeof useIrrigationPlan>;

// Planned litres per weekday from enabled schedules.
const plannedByDay = (schedules: IrrigationSchedule[]) =>
  weekdays.map((day) => ({ day, litres: schedules.filter((schedule) => schedule.enabled && schedule.days.includes(day)).reduce((sum, schedule) => sum + runLitres(schedule), 0) }));

export function SchedulerPanel({ plan }: { plan: Plan }) {
  const { schedules, setSchedules, volumes } = plan;
  const minute = useNowMinute();
  const upcoming = nextRun(schedules, minute);

  const update = (id: string, next: Partial<IrrigationSchedule>) => setSchedules((current) => current.map((schedule) => (schedule.id === id ? { ...schedule, ...next } : schedule)));
  const add = () => {
    const valve = farmValves[0];
    const volume = volumes.perCycle[valve.id] ?? valve.volume;
    setSchedules((current) => [...current, { id: `sch-${Date.now()}`, valveId: valve.id, start: "06:00", days: ["Mon", "Wed", "Fri"], limit: "volume", volume, duration: Math.round(volume / valve.flowRate), enabled: true }]);
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
        <button type="button" onClick={add} className={buttonPrimary}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add schedule
        </button>
      </div>
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <ScheduleRow key={schedule.id} schedule={schedule} onChange={(next) => update(schedule.id, next)} onRemove={() => setSchedules((current) => current.filter((item) => item.id !== schedule.id))} />
        ))}
        {schedules.length === 0 && <div className="py-6 text-center text-xs text-[var(--d-muted)]">No schedules yet. Add one to water on a timer.</div>}
      </div>
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
