"use client";

import { useState, useSyncExternalStore } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDownToLine, ArrowLeft, Building2, CalendarClock, ChevronRight, CircleDot, CloudRain, Container, Drill, FlaskConical, Gauge, NotebookPen, Pencil, Plus, Ruler, Star, StickyNote, Trash2, Waves, Wrench, X, Zap } from "lucide-react";

import { formatDate, useToday } from "@/components/dashboard/batch-store";

import { type Icon, Toggle } from "@/components/dashboard/dashboard-widgets";
import { buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";

// Water sources feeding the irrigation system, saved per browser (demo mode: no server yet).

export const sourceTypes = ["Bore well", "Open well", "Canal", "Farm pond / tank", "River / stream", "Rainwater tank", "Municipal supply"] as const;
export type SourceType = (typeof sourceTypes)[number];

export interface WaterSource {
  id: string;
  name: string;
  type: SourceType;
  primary: boolean; // the main supply the pump draws from
  active: boolean;
  depthFt?: number; // bore / open well depth
  waterLevelFt?: number; // depth to water
  yieldLph?: number; // litres per hour it can supply
  storageL?: number; // capacity of a tank, pond or well
  pumpHp?: number;
  availability?: string; // e.g. canal release days
  quality: string;
  notes?: string;
}

const typeIcon: Record<SourceType, Icon> = {
  "Bore well": Drill,
  "Open well": CircleDot,
  Canal: Waves,
  "Farm pond / tank": Container,
  "River / stream": Waves,
  "Rainwater tank": CloudRain,
  "Municipal supply": Building2,
};

// Which details make sense for each source type.
const fieldsFor: Record<SourceType, Array<"depthFt" | "waterLevelFt" | "yieldLph" | "storageL" | "pumpHp" | "availability">> = {
  "Bore well": ["depthFt", "waterLevelFt", "yieldLph", "pumpHp"],
  "Open well": ["depthFt", "waterLevelFt", "storageL", "pumpHp"],
  Canal: ["availability", "yieldLph", "pumpHp"],
  "Farm pond / tank": ["storageL", "pumpHp"],
  "River / stream": ["availability", "yieldLph", "pumpHp"],
  "Rainwater tank": ["storageL", "pumpHp"],
  "Municipal supply": ["availability", "yieldLph"],
};

const fieldMeta = {
  depthFt: { label: "Depth", unit: "ft" },
  waterLevelFt: { label: "Water level (depth to water)", unit: "ft" },
  yieldLph: { label: "Yield", unit: "L/hour" },
  storageL: { label: "Storage capacity", unit: "litres" },
  pumpHp: { label: "Pump", unit: "HP" },
  availability: { label: "Availability", unit: "" },
} as const;

const qualities = ["Good", "Hard water", "Slightly saline", "Saline", "Muddy / turbid", "Not tested"];

const defaultSources: WaterSource[] = [
  { id: "ws-1", name: "Bore well 1", type: "Bore well", primary: true, active: true, depthFt: 350, waterLevelFt: 120, yieldLph: 3600, pumpHp: 5, quality: "Good", notes: "EC 0.65 mS/cm at last test." },
  { id: "ws-2", name: "Farm pond", type: "Farm pond / tank", primary: false, active: true, storageL: 500000, pumpHp: 3, quality: "Muddy / turbid", notes: "Filled from the canal and rain; screen filter needed." },
  { id: "ws-3", name: "Canal supply", type: "Canal", primary: false, active: false, availability: "Released every 10 days, Jun–Jan", yieldLph: 9000, quality: "Good" },
];

export const recordKinds = ["Water level", "Quality test", "Yield test", "Maintenance", "Note"] as const;
export type RecordKind = (typeof recordKinds)[number];

/** A dated log entry for a source: a reading, a test, or work done on it. */
export interface WaterSourceRecord {
  id: string;
  sourceId: string;
  date: string; // "YYYY-MM-DD"
  kind: RecordKind;
  value?: string; // e.g. "118 ft", "EC 0.65 mS/cm"
  notes?: string;
}

const defaultRecords: WaterSourceRecord[] = [
  { id: "wr-1", sourceId: "ws-1", date: "2026-10-12", kind: "Water level", value: "120 ft", notes: "Measured before the pump started." },
  { id: "wr-2", sourceId: "ws-1", date: "2026-09-30", kind: "Quality test", value: "EC 0.65 mS/cm, pH 7.2", notes: "Lab test, fit for drip." },
  { id: "wr-3", sourceId: "ws-1", date: "2026-08-18", kind: "Maintenance", notes: "Foot valve replaced." },
  { id: "wr-4", sourceId: "ws-2", date: "2026-10-05", kind: "Water level", value: "About 70% full" },
  { id: "wr-5", sourceId: "ws-3", date: "2026-09-02", kind: "Note", notes: "Canal closed for desilting until the next release." },
];

type State = { sources: WaterSource[]; records: WaterSourceRecord[] };

const storageKey = "irrigation-water-sources";
const defaultState: State = { sources: defaultSources, records: defaultRecords };
const listeners = new Set<() => void>();
let state: State | null = null;

function read(): State {
  if (state) return state;
  state = defaultState;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    // Earlier versions saved just the list of sources.
    if (Array.isArray(saved)) state = { sources: saved, records: defaultRecords };
    else if (saved && Array.isArray(saved.sources)) state = { sources: saved.sources, records: Array.isArray(saved.records) ? saved.records : [] };
  } catch {
    // Storage blocked or unreadable: keep the demo sources.
  }
  return state;
}

function write(next: State) {
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

export function useWaterSources() {
  const { sources, records } = useSyncExternalStore(subscribe, read, () => defaultState);
  const primary = sources.find((source) => source.primary) ?? sources[0] ?? null;
  return {
    sources,
    records,
    primary,
    save: (source: WaterSource) => {
      const current = read();
      // Only one primary source; the first source is primary by default.
      let list = current.sources.some((item) => item.id === source.id) ? current.sources.map((item) => (item.id === source.id ? source : item)) : [...current.sources, source];
      if (source.primary) list = list.map((item) => (item.id === source.id ? item : { ...item, primary: false }));
      if (!list.some((item) => item.primary) && list[0]) list[0] = { ...list[0], primary: true };
      write({ ...current, sources: list });
    },
    remove: (id: string) => {
      const current = read();
      const list = current.sources.filter((item) => item.id !== id);
      if (list[0] && !list.some((item) => item.primary)) list[0] = { ...list[0], primary: true };
      write({ sources: list, records: current.records.filter((item) => item.sourceId !== id) });
    },
    addRecord: (record: WaterSourceRecord) => write({ ...read(), records: [record, ...read().records].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)) }),
    removeRecord: (id: string) => write({ ...read(), records: read().records.filter((item) => item.id !== id) }),
  };
}

const number = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });

function detailText(source: WaterSource, key: keyof typeof fieldMeta) {
  const value = source[key];
  if (value === undefined || value === "") return null;
  return typeof value === "number" ? `${number(value)} ${fieldMeta[key].unit}` : value;
}

// ---- Add / edit popup ----

const fieldClass = "w-full rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] px-3 py-2 text-sm font-semibold text-[var(--d-text)] outline-none focus:border-[var(--d-accent)]";
const labelClass = "mb-1.5 block text-xs font-semibold text-[var(--d-soft)]";

function SourceForm({ source, count, onDone }: { source: WaterSource | null; count: number; onDone: (savedId: string | null) => void }) {
  const { save, remove } = useWaterSources();
  const [type, setType] = useState<SourceType>(source?.type ?? "Bore well");
  const [name, setName] = useState(source?.name ?? "");
  const [primary, setPrimary] = useState(source?.primary ?? count === 0);
  const [active, setActive] = useState(source?.active ?? true);
  const [quality, setQuality] = useState(source?.quality ?? "Not tested");
  const [notes, setNotes] = useState(source?.notes ?? "");
  const [details, setDetails] = useState<Record<string, string>>(() =>
    Object.fromEntries((Object.keys(fieldMeta) as (keyof typeof fieldMeta)[]).map((key) => [key, source?.[key] === undefined ? "" : String(source[key])])),
  );
  const fields = fieldsFor[type];
  const label = name.trim() || type;
  const badNumber = fields.find((key) => key !== "availability" && details[key] !== "" && !(Number(details[key]) >= 0));

  return (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (badNumber) return;
            const value = (key: keyof typeof fieldMeta) => (fields.includes(key) && details[key].trim() !== "" ? details[key].trim() : undefined);
            const numeric = (key: Exclude<keyof typeof fieldMeta, "availability">) => (value(key) === undefined ? undefined : Number(value(key)));
            const id = source?.id ?? `ws-${Date.now()}`;
            save({
              id,
              name: label,
              type,
              primary,
              active,
              depthFt: numeric("depthFt"),
              waterLevelFt: numeric("waterLevelFt"),
              yieldLph: numeric("yieldLph"),
              storageL: numeric("storageL"),
              pumpHp: numeric("pumpHp"),
              availability: value("availability"),
              quality,
              notes: notes.trim() || undefined,
            });
            onDone(id);
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <button type="button" onClick={() => onDone(null)} aria-label="Back" className="rounded-lg p-1.5 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h3 className="text-base font-semibold">{source ? `Edit ${source.name}` : "Add water source"}</h3>
          </div>

          <div className={labelClass}>Source type</div>
          <div role="radiogroup" aria-label="Source type" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {sourceTypes.map((option) => {
              const TypeIcon = typeIcon[option];
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={type === option}
                  onClick={() => setType(option)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center text-xs font-semibold transition-colors ${type === option ? "accent-fill" : "bg-[var(--d-chip)] text-[var(--d-text)] hover:bg-[var(--d-chip-hover)]"}`}
                >
                  <TypeIcon className="h-5 w-5" aria-hidden="true" />
                  {option}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ws-name" className={labelClass}>
                Name
              </label>
              <input id="ws-name" value={name} onChange={(event) => setName(event.target.value)} placeholder={`e.g. ${type} 1`} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="ws-quality" className={labelClass}>
                Water quality
              </label>
              <select id="ws-quality" value={quality} onChange={(event) => setQuality(event.target.value)} className={fieldClass}>
                {(qualities.includes(quality) ? qualities : [quality, ...qualities]).map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            {fields.map((key) => (
              <div key={key} className={key === "availability" ? "sm:col-span-2" : ""}>
                <label htmlFor={`ws-${key}`} className={labelClass}>
                  {fieldMeta[key].label}
                </label>
                {key === "availability" ? (
                  <input id={`ws-${key}`} value={details[key]} onChange={(event) => setDetails((current) => ({ ...current, [key]: event.target.value }))} placeholder={type === "Canal" ? "e.g. Released every 10 days, Jun–Jan" : "e.g. Mornings only"} className={fieldClass} />
                ) : (
                  <div className="flex items-center rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] focus-within:border-[var(--d-accent)]">
                    <input id={`ws-${key}`} type="number" inputMode="decimal" min={0} value={details[key]} onChange={(event) => setDetails((current) => ({ ...current, [key]: event.target.value }))} placeholder="Optional" className="w-full bg-transparent px-3 py-2 text-sm font-semibold text-[var(--d-text)] outline-none" />
                    <span className="pr-3 text-xs text-[var(--d-muted)]">{fieldMeta[key].unit}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3 rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-4">
            <div className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-semibold">Main supply</span>
                <span className="block text-[11px] text-[var(--d-muted)]">The source the pump draws from first</span>
              </span>
              <Toggle size="sm" on={primary} onChange={() => setPrimary((value) => !value)} label="Main supply" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-semibold">In use</span>
                <span className="block text-[11px] text-[var(--d-muted)]">Turn off when dry, closed or under repair</span>
              </span>
              <Toggle size="sm" on={active} onChange={() => setActive((value) => !value)} label="Source in use" />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="ws-notes" className={labelClass}>
              Notes
            </label>
            <textarea id="ws-notes" rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Test results, filters, licence…" className={`${fieldClass} resize-y font-normal`} />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--d-line)] pt-4">
            <div className="flex items-center gap-3">
              {source && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete ${source.name} and its records?`)) {
                      remove(source.id);
                      onDone(null);
                    }
                  }}
                  className={`${buttonSecondary} hover:!bg-[var(--d-danger-soft)] hover:!text-[var(--d-danger-text)]`}
                >
                  Delete
                </button>
              )}
              {badNumber && <span className="text-xs font-semibold text-[var(--d-danger-text)]">{fieldMeta[badNumber].label} must be a positive number.</span>}
            </div>
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={() => onDone(null)} className="rounded-lg bg-[var(--d-chip)] px-4 py-2 text-sm font-medium hover:bg-[var(--d-chip-hover)]">
                Cancel
              </button>
              <button type="submit" disabled={!!badNumber} className="rounded-lg accent-fill px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                {source ? "Save source" : "Add source"}
              </button>
            </div>
          </div>
        </form>
  );
}

// ---- Records for one source ----

const recordPlaceholder: Record<RecordKind, string> = {
  "Water level": "e.g. 118 ft, or 70% full",
  "Quality test": "e.g. EC 0.65 mS/cm, pH 7.2",
  "Yield test": "e.g. 3,400 L/hour",
  Maintenance: "e.g. Foot valve replaced",
  Note: "",
};
const recordIcon: Record<RecordKind, Icon> = { "Water level": ArrowDownToLine, "Quality test": FlaskConical, "Yield test": Gauge, Maintenance: Wrench, Note: StickyNote };

const softChip = (on: boolean) =>
  `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${on ? "accent-fill shadow-sm" : "bg-[var(--d-chip)] text-[var(--d-soft)] hover:bg-[var(--d-chip-hover)] hover:text-[var(--d-text)]"}`;

function SourceRecords({ source }: { source: WaterSource }) {
  const { records, addRecord, removeRecord } = useWaterSources();
  const today = useToday();
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<RecordKind>("Water level");
  const [date, setDate] = useState(today);
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const list = records.filter((record) => record.sourceId === source.id);
  const canAdd = !!date && (value.trim() !== "" || notes.trim() !== "");

  return (
    <section aria-label="Records">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--d-text)]">
          <NotebookPen className="h-4 w-4 text-[var(--d-accent)]" aria-hidden="true" />
          Records
          <span className="rounded-full bg-[var(--d-chip)] px-2 py-0.5 text-[11px] font-semibold text-[var(--d-muted)]">{list.length}</span>
        </h3>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className={buttonPrimary}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add record
          </button>
        )}
      </div>

      {adding && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!canAdd) return;
            addRecord({ id: `wr-${Date.now()}`, sourceId: source.id, date, kind, value: value.trim() || undefined, notes: notes.trim() || undefined });
            setValue("");
            setNotes("");
            setAdding(false);
          }}
          className="mb-4 rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-4 shadow-sm"
        >
          <div role="radiogroup" aria-label="Record type" className="flex flex-wrap gap-1.5">
            {recordKinds.map((option) => {
              const KindIcon = recordIcon[option];
              return (
                <button key={option} type="button" role="radio" aria-checked={kind === option} onClick={() => setKind(option)} className={softChip(kind === option)}>
                  <KindIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {option}
                </button>
              );
            })}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[10rem_1fr]">
            <label className="block">
              <span className={labelClass}>Date</span>
              <input type="date" value={date} max={today} onChange={(event) => setDate(event.target.value)} className={fieldClass} />
            </label>
            {kind !== "Note" ? (
              <label className="block">
                <span className={labelClass}>{kind === "Maintenance" ? "Work done" : "Reading / result"}</span>
                <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={recordPlaceholder[kind]} className={fieldClass} autoFocus />
              </label>
            ) : (
              <span className="hidden sm:block" />
            )}
          </div>
          <label className="mt-3 block">
            <span className={labelClass}>{kind === "Note" ? "Note" : "Notes (optional)"}</span>
            <textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={kind === "Note" ? "Write a note" : "Anything worth remembering"} className={`${fieldClass} resize-y font-normal`} />
          </label>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setAdding(false)} className={buttonSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={!canAdd} className={buttonPrimary}>
              Save record
            </button>
          </div>
        </form>
      )}

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--d-card-border)] py-8 text-center text-xs text-[var(--d-muted)]">No records for {source.name} yet. Log water levels, tests and repairs here.</div>
      ) : (
        <ol className="relative space-y-1 before:absolute before:bottom-4 before:left-[1.1rem] before:top-4 before:w-px before:bg-[var(--d-line)]">
          {list.map((record) => {
            const KindIcon = recordIcon[record.kind];
            return (
              <li key={record.id} className="group relative flex gap-3 rounded-xl p-2 transition-colors hover:bg-[var(--d-chip)]">
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-[var(--d-popup)] bg-[var(--d-accent-soft)]">
                  <KindIcon className="h-3.5 w-3.5 text-[var(--d-accent)]" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="text-xs font-semibold text-[var(--d-accent)]">{record.kind}</span>
                    <span className="text-[11px] tabular-nums text-[var(--d-muted)]">{formatDate(record.date)}</span>
                  </div>
                  {record.value && <div className="text-sm font-semibold text-[var(--d-text)]">{record.value}</div>}
                  {record.notes && <div className="text-xs leading-5 text-[var(--d-soft)]">{record.notes}</div>}
                </div>
                <button
                  type="button"
                  onClick={() => removeRecord(record.id)}
                  aria-label={`Delete ${record.kind.toLowerCase()} record from ${formatDate(record.date)}`}
                  className="self-start rounded-lg p-1.5 text-[var(--d-muted)] opacity-0 transition-opacity hover:bg-[var(--d-danger-soft)] hover:text-[var(--d-danger-text)] focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

// ---- The button on the Irrigation tab, and its popup ----

const metricIcon: Record<keyof typeof fieldMeta, Icon> = { depthFt: Ruler, waterLevelFt: ArrowDownToLine, yieldLph: Gauge, storageL: Container, pumpHp: Zap, availability: CalendarClock };
const metricLabel: Record<keyof typeof fieldMeta, string> = { depthFt: "Depth", waterLevelFt: "Water level", yieldLph: "Yield", storageL: "Storage", pumpHp: "Pump", availability: "Availability" };

function SourceDetails({ source, onEdit }: { source: WaterSource; onEdit: () => void }) {
  const TypeIcon = typeIcon[source.type];
  const details = fieldsFor[source.type].map((key) => ({ key, text: detailText(source, key) })).filter((item) => item.text);
  const column = source.depthFt && source.waterLevelFt !== undefined && source.waterLevelFt < source.depthFt ? source.depthFt - source.waterLevelFt : null;

  return (
    <section aria-label={`${source.name} details`} className="space-y-4">
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--d-accent-bright)] to-[var(--d-accent-strong)] shadow-[0_10px_24px_-10px_color-mix(in_srgb,var(--d-accent-strong)_80%,transparent)]">
          <TypeIcon className="h-7 w-7 text-white" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-[var(--d-text)]">{source.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded-full bg-[var(--d-chip)] px-2.5 py-1 font-medium text-[var(--d-soft)]">{source.type}</span>
            {source.primary && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--d-accent-soft)] px-2.5 py-1 font-semibold text-[var(--d-accent)]">
                <Star className="h-3 w-3 fill-current" aria-hidden="true" /> Main supply
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${source.active ? "bg-[var(--d-accent-soft)] text-[var(--d-accent)]" : "bg-[var(--d-chip)] text-[var(--d-muted)]"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${source.active ? "bg-[var(--d-accent)]" : "bg-[var(--d-muted)]"}`} />
              {source.active ? "In use" : "Not in use"}
            </span>
            <span className={`rounded-full px-2.5 py-1 font-semibold ${source.quality === "Good" ? "bg-[var(--d-chip)] text-[var(--d-soft)]" : "bg-[var(--d-warn-soft)] text-[var(--d-warn)]"}`}>Water: {source.quality}</span>
          </div>
        </div>
        <button type="button" onClick={onEdit} className={buttonSecondary}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
        </button>
      </div>

      {details.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {details.map((item) => {
            const MetricIcon = metricIcon[item.key];
            return (
              <div key={item.key} className={`rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-3.5 ${item.key === "availability" ? "col-span-2" : ""}`}>
                <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--d-muted)]">
                  <MetricIcon className="h-3.5 w-3.5 text-[var(--d-accent)]" aria-hidden="true" />
                  {metricLabel[item.key]}
                </div>
                <div className="mt-1 truncate text-lg font-bold tabular-nums text-[var(--d-text)]" title={item.text ?? undefined}>
                  {item.text}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {column !== null && source.depthFt && (
        <div className="rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
            <span className="font-semibold text-[var(--d-soft)]">Water column</span>
            <span className="text-[var(--d-muted)]">
              <strong className="tabular-nums text-[var(--d-text)]">{number(column)} ft</strong> of water below the {number(source.waterLevelFt ?? 0)} ft level
            </span>
          </div>
          <div className="relative mt-2.5 h-3 overflow-hidden rounded-full bg-[var(--d-track)]" role="meter" aria-valuemin={0} aria-valuemax={source.depthFt} aria-valuenow={column} aria-label="Water column in the well">
            <div className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-r from-[var(--d-accent-bright)] to-[var(--d-accent-strong)]" style={{ width: `${(column / source.depthFt) * 100}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-[var(--d-muted)]">
            <span>Ground</span>
            <span>{number(source.depthFt)} ft</span>
          </div>
        </div>
      )}

      {source.notes && (
        <div className="flex gap-2.5 rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-3.5 text-sm text-[var(--d-soft)]">
          <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-[var(--d-accent)]" aria-hidden="true" />
          {source.notes}
        </div>
      )}
    </section>
  );
}

/** Status-row button showing the main water source; opens every source's details and records. */
export function WaterSourceButton() {
  const { sources, records, primary } = useWaterSources();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "add">("view");
  const selected = sources.find((source) => source.id === selectedId) ?? primary;
  const lastRecord = primary ? records.find((record) => record.sourceId === primary.id) : undefined;
  const inUse = sources.filter((source) => source.active);
  const storage = inUse.reduce((sum, source) => sum + (source.storageL ?? 0), 0);
  const supply = inUse.reduce((sum, source) => sum + (source.yieldLph ?? 0), 0);
  const PrimaryIcon = primary ? typeIcon[primary.type] : Waves;
  const stats = [
    { label: "Sources", value: String(sources.length) },
    { label: "In use", value: String(inUse.length) },
    { label: "Storage", value: storage ? `${storage >= 100000 ? `${number(storage / 100000)} lakh` : number(storage)} L` : "–" },
    { label: "Supply", value: supply ? `${number(supply)} L/h` : "–" },
  ];

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) {
          setSelectedId(primary?.id ?? null);
          setMode(sources.length ? "view" : "add");
        }
      }}
    >
      <Dialog.Trigger className="dash-card group flex w-full items-center gap-3 rounded-lg border border-[var(--d-card-border)] bg-[var(--d-card)] p-3 text-left transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-md">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--d-accent-soft)]">
          <PrimaryIcon className="h-5 w-5 text-[var(--d-accent)]" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">Water Source</span>
          <span className={`block truncate text-lg font-bold ${primary && !primary.active ? "text-[var(--d-warn)]" : "text-[var(--d-accent)]"}`}>{primary?.name ?? "Not set"}</span>
          <span className="block truncate text-[10px] text-[var(--d-muted)]">
            {primary ? `${primary.type}${sources.length > 1 ? ` · +${sources.length - 1} more` : ""}${lastRecord ? ` · ${lastRecord.kind.toLowerCase()} ${formatDate(lastRecord.date)}` : ""}` : "Tap to add a source"}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--d-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Dialog.Trigger>

      {open && (
        <>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-[var(--d-line)] bg-[var(--d-popup)] text-[var(--d-text)] shadow-[0_30px_80px_-20px_rgb(0_0_0_/_0.5)]">
            <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[var(--d-accent-deep)] via-[color-mix(in_srgb,var(--d-accent-deep)_80%,var(--d-accent-strong))] to-[color-mix(in_srgb,var(--d-accent-deep)_65%,black)] px-6 pb-5 pt-6 text-white">
              <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[color-mix(in_srgb,var(--d-accent-bright)_25%,transparent)] blur-3xl" />
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-[#e3b23c]/20 blur-3xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                    <Waves className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <Dialog.Title className="text-xl font-bold">Water sources</Dialog.Title>
                    <Dialog.Description className="text-xs text-white/70">Where irrigation water comes from, with readings, tests and repairs.</Dialog.Description>
                  </div>
                </div>
                <Dialog.Close aria-label="Close" className="rounded-xl bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
              <dl className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/10">
                    <dt className="text-[11px] text-white/65">{stat.label}</dt>
                    <dd className="text-base font-bold tabular-nums">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </header>

            <div className="grid min-h-0 flex-1 md:grid-cols-[15rem_1fr]">
              <nav aria-label="Water sources" className="flex gap-2 overflow-x-auto border-b border-[var(--d-line)] bg-[var(--d-inset)] p-3 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
                {sources.map((source) => {
                  const TypeIcon = typeIcon[source.type];
                  const current = mode === "view" && selected?.id === source.id;
                  return (
                    <button
                      key={source.id}
                      type="button"
                      aria-current={current ? "true" : undefined}
                      onClick={() => {
                        setSelectedId(source.id);
                        setMode("view");
                      }}
                      className={`flex min-w-[12rem] items-center gap-3 rounded-2xl p-2.5 text-left transition-all md:min-w-0 ${current ? "bg-[var(--d-popup)] shadow-md ring-1 ring-[var(--d-card-border)]" : "hover:bg-[var(--d-chip)]"}`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current ? "bg-gradient-to-br from-[var(--d-accent-bright)] to-[var(--d-accent-strong)] text-white" : "bg-[var(--d-accent-soft)] text-[var(--d-accent)]"}`}>
                        <TypeIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1 truncate text-sm font-semibold text-[var(--d-text)]">
                          {source.name}
                          {source.primary && <Star className="h-3 w-3 shrink-0 fill-[var(--d-accent)] text-[var(--d-accent)]" aria-label="Main supply" />}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-[var(--d-muted)]">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${source.active ? "bg-[var(--d-accent)]" : "bg-[var(--d-muted)]"}`} />
                          <span className="truncate">{source.type}</span>
                        </span>
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setMode("add")}
                  className={`flex min-w-[10rem] items-center justify-center gap-2 rounded-2xl border border-dashed p-2.5 text-sm font-semibold transition-colors md:mt-1 md:min-w-0 ${mode === "add" ? "border-[var(--d-accent)] text-[var(--d-accent)]" : "border-[var(--d-card-border)] text-[var(--d-muted)] hover:border-[var(--d-accent)] hover:text-[var(--d-accent)]"}`}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" /> Add source
                </button>
              </nav>

              <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
                {mode !== "view" ? (
                  <SourceForm
                    key={mode === "edit" ? selected?.id : "new"}
                    source={mode === "edit" ? (selected ?? null) : null}
                    count={sources.length}
                    onDone={(savedId) => {
                      if (savedId) setSelectedId(savedId);
                      setMode("view");
                    }}
                  />
                ) : selected ? (
                  <div className="space-y-6">
                    <SourceDetails source={selected} onEdit={() => setMode("edit")} />
                    <SourceRecords key={selected.id} source={selected} />
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-[var(--d-muted)]">No water sources yet. Add the bore well, well, canal or tank that feeds irrigation.</div>
                )}
              </div>
            </div>
          </Dialog.Content>
        </>
      )}
    </Dialog.Root>
  );
}
