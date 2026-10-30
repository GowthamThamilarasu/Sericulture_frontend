"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Bell, Camera, Check, CheckCircle2, ClipboardList, Clock, ImageUp, Loader2, Pill as PillIcon, Plus, ScanSearch, SkipForward, Sparkles, Workflow, X } from "lucide-react";

import { formatDate, stages, useToday } from "@/components/dashboard/batch-store";
import { Toggle, Widget } from "@/components/dashboard/dashboard-widgets";
import { daysBetween } from "@/components/dashboard/mulberry-store";
import { Pill, StatTile, type Tone, buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";
import { type HealthCheck, type Medication, type MedicationPurpose, dueMedications, medicationPresets, medicationPurposes, medicationsFor, useSilkwormHealth, whenLabel } from "@/components/dashboard/silkworm-health";
import type { BatchRecord, InstarKey } from "@/types";

const fieldClass =
  "w-full rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] px-3 py-2 text-sm font-semibold text-[var(--d-text)] outline-none focus:border-[var(--d-accent)]";
const labelClass = "mb-1.5 block text-xs font-semibold text-[var(--d-soft)]";

// Product names suggested while typing; any name can be entered.
const productSuggestions = ["Vijetha", "Vijetha Supplement", "Ankush", "Labex", "Resham Keet Oushadh (RKO)", "Sanitech", "Slaked lime", "Bleaching powder", "Nesolynx thymus", "Vitamin supplement"];

function Chips<T extends string>({ label, value, options, onChange }: { label: string; value: T | undefined; options: readonly T[]; onChange: (value: T) => void }) {
  return (
    <div>
      <div className={labelClass}>{label}</div>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={value === option}
            onClick={() => onChange(option)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${value === option ? "accent-fill" : "bg-[var(--d-chip)] text-[var(--d-text)] hover:bg-[var(--d-chip-hover)]"}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

const statusTone = (item: Medication, today: string, finished: boolean): { tone: Tone; label: string } => {
  if (item.status === "Done") return { tone: "accent", label: "Done" };
  if (item.status === "Skipped") return { tone: "muted", label: "Skipped" };
  if (finished) return { tone: "muted", label: "Not recorded" };
  const days = daysBetween(today, item.date);
  return days < 0 ? { tone: "danger", label: whenLabel(item.date, today) } : days <= 1 ? { tone: "warn", label: whenLabel(item.date, today) } : { tone: "info", label: "Planned" };
};

// ---- Manual entry (and editing any dose) ----

function MedicationDialog({ batch, medication, preset, onClose }: { batch: BatchRecord; medication: Medication | null; preset?: Partial<Medication>; onClose: () => void }) {
  const { saveMedication, removeMedication } = useSilkwormHealth();
  const today = useToday();
  const start = medication ?? preset;
  const [draft, setDraft] = useState({
    product: start?.product ?? "",
    purpose: start?.purpose ?? ("Bed disinfection" as MedicationPurpose),
    date: start?.date ?? today,
    instar: start?.instar ?? ("" as InstarKey | ""),
    dose: start?.dose ?? "",
    method: start?.method ?? "",
    status: start?.status ?? (start?.date && start.date > today ? "Planned" : "Done"),
    notes: start?.notes ?? "",
  });
  const set = (next: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...next }));
  const fromPreset = !!medication?.presetId;
  const error = !draft.product.trim() ? "Enter the medicine or product." : !draft.date ? "Pick a date." : "";

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (error) return;
            saveMedication({
              ...(medication ?? {}),
              id: medication?.id ?? `med-${Date.now()}`,
              batchId: batch.id,
              product: draft.product.trim(),
              purpose: draft.purpose,
              date: draft.date,
              instar: draft.instar || undefined,
              dose: draft.dose.trim(),
              method: draft.method.trim() || undefined,
              status: draft.status,
              notes: draft.notes.trim() || undefined,
            });
            onClose();
          }}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-lg font-semibold">{medication ? "Edit medication" : "Add medication"}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-[var(--d-muted)]">
                Batch <span className="font-mono font-semibold text-[var(--d-text)]">{batch.id}</span> · {fromPreset ? "Planned by an automation preset: you can move the date, mark it done or skip it." : "Record a dose given, or plan one. Planned doses send reminders."}
              </Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <fieldset disabled={fromPreset} className="space-y-4 disabled:opacity-70">
            <div>
              <label htmlFor="med-product" className={labelClass}>
                Medicine / product
              </label>
              <input id="med-product" list="med-products" value={draft.product} onChange={(event) => set({ product: event.target.value })} placeholder="e.g. Vijetha" className={fieldClass} />
              <datalist id="med-products">
                {productSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
            <Chips label="Purpose" value={draft.purpose} options={medicationPurposes} onChange={(purpose) => set({ purpose })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="med-dose" className={labelClass}>
                  Dose
                </label>
                <input id="med-dose" value={draft.dose} onChange={(event) => set({ dose: event.target.value })} placeholder="e.g. 2 kg per 100 DFLs" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="med-method" className={labelClass}>
                  Method
                </label>
                <input id="med-method" value={draft.method} onChange={(event) => set({ method: event.target.value })} placeholder="Dusting, spray, release…" className={fieldClass} />
              </div>
            </div>
          </fieldset>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="med-date" className={labelClass}>
                Date
              </label>
              <input id="med-date" type="date" value={draft.date} onChange={(event) => set({ date: event.target.value, status: event.target.value > today && draft.status === "Done" ? "Planned" : draft.status })} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="med-instar" className={labelClass}>
                Instar
              </label>
              <select id="med-instar" value={draft.instar} disabled={fromPreset} onChange={(event) => set({ instar: event.target.value as InstarKey | "" })} className={fieldClass}>
                <option value="">Not set</option>
                {stages.map((stage) => (
                  <option key={stage.key} value={stage.key}>
                    {stage.key === "Spinning" ? "Spinning" : `Instar ${stage.key}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <Chips label="Status" value={draft.status} options={["Done", "Planned", "Skipped"] as const} onChange={(status) => set({ status })} />
          </div>
          <div className="mt-4">
            <label htmlFor="med-notes" className={labelClass}>
              Notes
            </label>
            <textarea id="med-notes" rows={2} value={draft.notes} onChange={(event) => set({ notes: event.target.value })} placeholder="Why it was given, what was seen…" className={`${fieldClass} resize-y font-normal`} />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--d-line)] pt-4">
            <div className="flex items-center gap-3">
              {medication && !fromPreset && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Delete this medication record?")) {
                      removeMedication(medication.id);
                      onClose();
                    }
                  }}
                  className={`${buttonSecondary} hover:!bg-[var(--d-danger-soft)] hover:!text-[var(--d-danger-text)]`}
                >
                  Delete
                </button>
              )}
              {error && <span className="text-xs font-semibold text-[var(--d-danger-text)]">{error}</span>}
            </div>
            <div className="ml-auto flex gap-2">
              <Dialog.Close className="rounded-lg bg-[var(--d-chip)] px-4 py-2 text-sm font-medium hover:bg-[var(--d-chip-hover)]">Cancel</Dialog.Close>
              <button type="submit" disabled={!!error} className="rounded-lg accent-fill px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                {medication ? "Save" : draft.status === "Planned" ? "Plan medication" : "Add medication"}
              </button>
            </div>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// ---- Medication tab ----

export function MedicationPanel({ batch }: { batch: BatchRecord }) {
  const { health, setPreset, setRemindDaysBefore, setStatus } = useSilkwormHealth();
  const today = useToday();
  const [editing, setEditing] = useState<{ medication: Medication | null; preset?: Partial<Medication> } | null>(null);
  const finished = batch.status !== "Rearing";
  const doses = medicationsFor(batch, health);
  const due = dueMedications(batch, health, today);
  const done = doses.filter((item) => item.status === "Done").length;
  const upcoming = doses.filter((item) => item.status === "Planned" && item.date > today).length;
  const presetsOn = medicationPresets.filter((preset) => health.presets[preset.id]).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile label="Given" value={done} icon={CheckCircle2} note={`of ${doses.length} doses for this batch`} />
        <StatTile label="Due now" value={due.length} icon={Bell} tone={due.some((item) => item.date < today) ? "danger" : due.length ? "warn" : "accent"} note={due.length ? "Shown in the notification bell" : "Nothing due"} />
        <StatTile label="Planned" value={upcoming} icon={Clock} />
        <StatTile label="Presets on" value={`${presetsOn} / ${medicationPresets.length}`} icon={Workflow} />
      </div>

      {due.length > 0 && (
        <div className="rounded-xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-4" style={{ borderLeft: "4px solid var(--d-warn)" }}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--d-text)]">
            <Bell className="h-4 w-4 text-[var(--d-warn)]" aria-hidden="true" /> Due now
          </div>
          <div className="space-y-2">
            {due.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-[var(--d-inset)] p-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--d-text)]">{item.product}</div>
                  <div className="text-xs text-[var(--d-muted)]">
                    {item.purpose} · {item.dose} · {formatDate(item.date)}
                  </div>
                </div>
                <Pill tone={item.date < today ? "danger" : "warn"}>{whenLabel(item.date, today)}</Pill>
                <button type="button" onClick={() => setStatus(item, "Done", today)} className={buttonPrimary}>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" /> Mark done
                </button>
                <button type="button" onClick={() => setStatus(item, "Skipped", today)} className={buttonSecondary}>
                  <SkipForward className="h-3.5 w-3.5" aria-hidden="true" /> Skip
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid items-start gap-4 xl:grid-cols-[1fr_24rem]">
        <Widget
          title="Medication Schedule"
          icon={ClipboardList}
          action={
            <button type="button" onClick={() => setEditing({ medication: null })} className={buttonPrimary}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add medication
            </button>
          }
        >
          {doses.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--d-muted)]">No medications yet. Turn on a preset or add one by hand.</div>
          ) : (
            <ul className="divide-y divide-[var(--d-line)]">
              {doses.map((item) => {
                const status = statusTone(item, today, finished);
                return (
                  <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
                    <button type="button" onClick={() => setEditing({ medication: item })} className="flex min-w-0 flex-1 items-start gap-3 rounded-lg text-left hover:opacity-80">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.status === "Done" ? "accent-fill" : "bg-[var(--d-accent-soft)] text-[var(--d-accent)]"}`}>
                        {item.status === "Done" ? <Check className="h-4 w-4" aria-hidden="true" /> : <PillIcon className="h-4 w-4" aria-hidden="true" />}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-semibold text-[var(--d-text)]">{item.product}</span>
                          <Pill tone={status.tone}>{status.label}</Pill>
                          <Pill tone="muted">{item.presetId ? "Preset" : "Manual"}</Pill>
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--d-muted)]">
                          {formatDate(item.date)}
                          {item.instar && ` · ${item.instar === "Spinning" ? "Spinning" : `Instar ${item.instar}`}`} · {item.purpose}
                          {item.dose && ` · ${item.dose}`}
                        </span>
                        {item.notes && <span className="mt-0.5 block text-xs text-[var(--d-soft)]">{item.notes}</span>}
                      </span>
                    </button>
                    {item.status === "Planned" && !finished && (
                      <button type="button" onClick={() => setStatus(item, "Done", today)} className={buttonSecondary} title="Mark as given">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" /> Done
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Widget>

        <div className="space-y-4">
          <Widget title="Automation Presets" icon={Workflow}>
            <p className="mb-3 text-xs text-[var(--d-muted)]">Presets plan doses from the brushing date and instar timing, and send reminders when they fall due.</p>
            <div className="space-y-2">
              {medicationPresets.map((preset) => (
                <div key={preset.id} className="flex items-start gap-3 rounded-lg bg-[var(--d-inset)] p-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[var(--d-text)]">{preset.name}</div>
                    <div className="text-[11px] text-[var(--d-muted)]">{preset.description}</div>
                    <div className="mt-1 text-[11px] text-[var(--d-soft)]">{preset.product}</div>
                  </div>
                  <Toggle size="sm" on={!!health.presets[preset.id]} onChange={() => setPreset(preset.id, !health.presets[preset.id])} label={`${preset.name} preset`} />
                </div>
              ))}
            </div>
          </Widget>

          <Widget title="Reminders" icon={Bell}>
            <label htmlFor="med-remind" className="text-xs text-[var(--d-soft)]">
              Notify me
            </label>
            <select id="med-remind" value={health.remindDaysBefore} onChange={(event) => setRemindDaysBefore(Number(event.target.value))} className={`${fieldClass} mt-1.5`}>
              <option value={0}>On the day</option>
              <option value={1}>1 day before</option>
              <option value={2}>2 days before</option>
              <option value={3}>3 days before</option>
            </select>
            <p className="mt-2 text-[11px] text-[var(--d-muted)]">Due and overdue doses for the active batch appear in the notification bell and as a popup. Overdue doses remind again each day until marked done or skipped.</p>
          </Widget>
        </div>
      </div>

      <p className="text-[11px] text-[var(--d-muted)]">Preset products and doses are common examples. Always follow the product label and your sericulture extension officer.</p>

      {editing && <MedicationDialog batch={batch} medication={editing.medication} preset={editing.preset} onClose={() => setEditing(null)} />}
    </div>
  );
}

// ---- Silkworm photo check (AI part) ----

type CheckResult = Omit<HealthCheck, "id" | "batchId" | "date" | "notes"> & { bodyShare: number; yellow: number; brown: number; treatment?: Partial<Medication> };
const severityTone: Record<HealthCheck["severity"], Tone> = { Low: "accent", Moderate: "warn", High: "danger" };

function toHsv(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta) hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return { h: (hue * 60 + 360) % 360, s: max ? delta / max : 0, v: max / 255 };
}

/**
 * Demo check on the device: separates creamy larva body from the green leaf bed and measures yellowing and
 * brown/dark patches. A rough estimate to show the workflow until the trained AI model is connected.
 */
async function checkLarvae(file: File): Promise<CheckResult> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("That file could not be read as an image."));
      element.src = url;
    });
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 256 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser cannot analyse images.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);

    let cream = 0;
    let yellow = 0;
    let brown = 0;
    for (let index = 0; index < data.length; index += 4) {
      const { h, s, v } = toHsv(data[index], data[index + 1], data[index + 2]);
      if (h >= 70 && h <= 170 && s > 0.2) continue; // mulberry leaf
      if (s < 0.22 && v > 0.6) cream++;
      else if (h >= 35 && h < 70 && s >= 0.22 && v > 0.5) yellow++;
      else if ((h < 35 || h > 330) && s > 0.25 && v > 0.2 && v < 0.6) brown++;
    }
    const body = cream + yellow + brown;
    const bodyShare = body / (data.length / 4);

    const thumb = document.createElement("canvas");
    const thumbScale = Math.min(1, 320 / Math.max(image.width, image.height));
    thumb.width = Math.round(image.width * thumbScale);
    thumb.height = Math.round(image.height * thumbScale);
    thumb.getContext("2d")?.drawImage(image, 0, 0, thumb.width, thumb.height);
    const photo = thumb.toDataURL("image/jpeg", 0.7);

    const yellowPct = body ? (yellow / body) * 100 : 0;
    const brownPct = body ? (brown / body) * 100 : 0;
    const affected = yellowPct + brownPct;
    const severity: HealthCheck["severity"] = affected < 8 ? "Low" : affected < 25 ? "Moderate" : "High";

    if (bodyShare < 0.05) {
      return { photo, bodyShare, yellow: 0, brown: 0, severity: "Low", likely: "No larvae found", finding: "Larvae are not clear in this photo. Take it from above, close to a few larvae, in daylight." };
    }
    if (brownPct >= 8 && brownPct >= yellowPct / 2) {
      return {
        photo,
        bodyShare,
        yellow: yellowPct,
        brown: brownPct,
        severity,
        likely: "Flacherie or pebrine signs",
        finding: `Brown or dark patches cover about ${brownPct.toFixed(0)}% of the larvae. This can mean flacherie (soft, darkened larvae) or the dark spots of pebrine. Remove sick larvae, feed only fresh, dry leaf, disinfect the bed, and send a sample for a pebrine test.`,
        treatment: { purpose: "Disease treatment", product: "Bed disinfectant (e.g. Vijetha)", dose: "Thin, even dusting as per label" },
      };
    }
    if (yellowPct >= 15) {
      return {
        photo,
        bodyShare,
        yellow: yellowPct,
        brown: brownPct,
        severity,
        likely: "Grasserie signs",
        finding: `A yellowish, milky colour covers about ${yellowPct.toFixed(0)}% of the larvae. This fits grasserie (a viral disease). Pick out and destroy affected larvae, dust bed disinfectant, and avoid sudden temperature and humidity swings.`,
        treatment: { purpose: "Disease treatment", product: "Vijetha Supplement", dose: "As per label" },
      };
    }
    return { photo, bodyShare, yellow: yellowPct, brown: brownPct, severity: "Low", likely: "Looks healthy", finding: `The larvae look evenly coloured. Only about ${affected.toFixed(0)}% shows discolouration. Keep up bed hygiene.` };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function SilkwormPhotoCheck({ batch }: { batch: BatchRecord }) {
  const { health, addCheck, storageFull } = useSilkwormHealth();
  const today = useToday();
  const upload = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [treating, setTreating] = useState<Partial<Medication> | null>(null);
  const checks = health.checks.filter((check) => check.batchId === batch.id);

  const choose = (next: File | undefined) => {
    if (!next) return;
    if (!next.type.startsWith("image/")) return setError("Choose a photo (JPG, PNG or HEIC).");
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setResult(null);
    setSaved(false);
    setError("");
  };

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1.3fr_1fr]">
      <Widget title="Silkworm Photo Check" icon={ScanSearch} action={<Pill tone="muted">AI · demo</Pill>}>
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            choose(event.dataTransfer.files[0]);
          }}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--d-card-border)] bg-[var(--d-inset)] p-4 text-center"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL
            <img src={preview} alt="Selected silkworm photo" className="max-h-56 w-auto rounded-lg object-contain" />
          ) : (
            <>
              <ScanSearch className="h-10 w-10 text-[var(--d-accent)]" aria-hidden="true" />
              <div className="text-sm font-semibold text-[var(--d-text)]">Upload a photo of the larvae on the bed</div>
              <div className="text-xs text-[var(--d-muted)]">From above, close to a few larvae, in daylight. Drag a photo here or choose one.</div>
            </>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => upload.current?.click()} className={buttonSecondary}>
              <ImageUp className="h-3.5 w-3.5" aria-hidden="true" /> {preview ? "Choose another" : "Upload photo"}
            </button>
            <button type="button" onClick={() => camera.current?.click()} className={buttonSecondary}>
              <Camera className="h-3.5 w-3.5" aria-hidden="true" /> Take photo
            </button>
          </div>
          <input ref={upload} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(event) => choose(event.target.files?.[0])} />
          <input ref={camera} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(event) => choose(event.target.files?.[0])} />
        </div>

        <div className="mt-3">
          <label htmlFor="worm-notes" className={labelClass}>
            What you noticed
          </label>
          <input id="worm-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="e.g. some larvae slow and soft" className={fieldClass} />
        </div>

        <button
          type="button"
          disabled={!file || busy}
          onClick={async () => {
            if (!file) return;
            setBusy(true);
            setError("");
            try {
              setResult(await checkLarvae(file));
            } catch (problem) {
              setError(problem instanceof Error ? problem.message : "The photo could not be analysed.");
            } finally {
              setBusy(false);
            }
          }}
          className={`${buttonPrimary} mt-3 !px-4 !py-2 !text-sm`}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />} {busy ? "Analysing…" : "Analyse with AI"}
        </button>
        {error && <div className="mt-2 text-xs font-semibold text-[var(--d-danger-text)]">{error}</div>}

        {result && (
          <div className="mt-4 rounded-xl border border-[var(--d-card-border)] bg-[var(--d-inset)] p-4" aria-live="polite">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-[var(--d-text)]">{result.likely}</span>
              {result.bodyShare >= 0.05 && <Pill tone={severityTone[result.severity]}>{result.severity}</Pill>}
              <Pill tone="muted">Demo estimate</Pill>
            </div>
            {result.bodyShare >= 0.05 && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                {[
                  { label: "Yellowish", value: Math.round(result.yellow) },
                  { label: "Brown / dark", value: Math.round(result.brown) },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-[var(--d-chip)] px-2 py-2">
                    <div className="text-lg font-bold tabular-nums text-[var(--d-text)]">{item.value}%</div>
                    <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--d-muted)]">{item.label}</div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-sm leading-6 text-[var(--d-soft)]">{result.finding}</p>
            <p className="mt-2 text-[11px] text-[var(--d-muted)]">Estimated on this device from the photo&apos;s colours. The AI model&apos;s diagnosis will appear here once it is connected. White, chalky muscardine larvae can look healthy to this check.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saved || result.bodyShare < 0.05}
                onClick={() => {
                  addCheck({ id: `chk-${Date.now()}`, batchId: batch.id, date: today, photo: result.photo, finding: result.finding, likely: result.likely, severity: result.severity, notes: notes.trim() || undefined });
                  setSaved(true);
                }}
                className={buttonPrimary}
              >
                {saved ? "Saved to health checks" : "Save to health checks"}
              </button>
              {result.treatment && (
                <button type="button" onClick={() => setTreating({ ...result.treatment, notes: `After photo check: ${result.likely}.` })} className={buttonSecondary}>
                  <PillIcon className="h-3.5 w-3.5" aria-hidden="true" /> Add treatment
                </button>
              )}
            </div>
            {saved && storageFull && <div className="mt-2 text-xs font-semibold text-[var(--d-warn)]">Browser storage is full: this check stays until you reload.</div>}
          </div>
        )}
      </Widget>

      <Widget title="Health Checks" icon={ClipboardList}>
        {checks.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--d-muted)]">No photo checks for batch {batch.id} yet.</div>
        ) : (
          <div className="space-y-2">
            {checks.slice(0, 6).map((check) => (
              <div key={check.id} className="flex items-start gap-3 rounded-lg bg-[var(--d-inset)] p-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
                <img src={check.photo} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-semibold text-[var(--d-text)]">{check.likely}</span>
                    <Pill tone={severityTone[check.severity]}>{check.severity}</Pill>
                  </div>
                  <div className="text-[11px] text-[var(--d-muted)]">{formatDate(check.date)}</div>
                  {check.notes && <div className="mt-0.5 text-xs text-[var(--d-soft)]">{check.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Widget>

      {treating && <MedicationDialog batch={batch} medication={null} preset={{ ...treating, date: today, status: "Done" }} onClose={() => setTreating(null)} />}
    </div>
  );
}
