"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Camera, ImageUp, Loader2, ScanSearch, Sparkles, X } from "lucide-react";

import { useToday } from "@/components/dashboard/batch-store";
import { useMulberry } from "@/components/dashboard/mulberry-store";
import { Pill, buttonPrimary, buttonSecondary, type Tone } from "@/components/dashboard/page-kit";
import { irrigationTypes, knowledgeSections, leafDefects, plantingSystems } from "@/data/mock";
import type { FieldActivity, FieldActivityType, MulberryBlock } from "@/types";

export const fieldClass =
  "w-full rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] px-3 py-2 text-sm font-semibold text-[var(--d-text)] outline-none focus:border-[var(--d-accent)]";
const labelClass = "mb-1.5 block text-xs font-semibold text-[var(--d-soft)]";

function Field({ id, label, hint, children, className }: { id?: string; label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {hint && <div className="mt-1 text-[11px] text-[var(--d-muted)]">{hint}</div>}
    </div>
  );
}

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

// Popup shell shared by the forms here. Not portalled, so it keeps the dashboard theme variables.
function FormDialog({ title, description, error, submitLabel, canSubmit, onSubmit, onClose, children, extra }: { title: string; description: string; error?: string; submitLabel: string; canSubmit: boolean; onSubmit: () => void; onClose: () => void; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) onSubmit();
          }}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-[var(--d-muted)]">{description}</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          {children}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--d-line)] pt-4">
            <div className="flex items-center gap-3">
              {extra}
              {error && <span className="text-xs font-semibold text-[var(--d-danger-text)]">{error}</span>}
            </div>
            <div className="ml-auto flex gap-2">
              <Dialog.Close className="rounded-lg bg-[var(--d-chip)] px-4 py-2 text-sm font-medium hover:bg-[var(--d-chip-hover)]">Cancel</Dialog.Close>
              <button type="submit" disabled={!canSubmit} className="rounded-lg accent-fill px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                {submitLabel}
              </button>
            </div>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// ---- Block setup: variety, area, irrigation type ----

export function BlockDialog({ block, onClose }: { block: MulberryBlock | null; onClose: () => void }) {
  const { blocks, saveBlock, removeBlock } = useMulberry();
  const today = useToday();
  const [draft, setDraft] = useState(() => ({
    name: block?.name ?? `Block ${String.fromCharCode(65 + blocks.length)}`,
    variety: block?.variety ?? knowledgeSections.mulberry[0],
    area: block ? String(block.area) : "",
    irrigation: block?.irrigation ?? irrigationTypes[0],
    plantingSystem: block?.plantingSystem ?? plantingSystems[0],
    plantedOn: block?.plantedOn ?? today,
    manuringEveryDays: block ? String(block.manuringEveryDays) : "70",
  }));
  const set = (next: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...next }));

  const name = draft.name.trim();
  const error = !name
    ? "Enter a block name."
    : blocks.some((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== block?.id)
      ? `${name} already exists.`
      : !(Number(draft.area) > 0)
        ? "Enter the area cultivated."
        : !(Number(draft.manuringEveryDays) >= 15)
          ? "Manuring interval must be at least 15 days."
          : "";
  const varieties = knowledgeSections.mulberry.includes(draft.variety) ? knowledgeSections.mulberry : [draft.variety, ...knowledgeSections.mulberry];

  return (
    <FormDialog
      title={block ? `Edit ${block.name}` : "Add mulberry block"}
      description="Variety, area cultivated, how it is watered and how often it is manured."
      error={error}
      submitLabel={block ? "Save block" : "Add block"}
      canSubmit={!error}
      onClose={onClose}
      onSubmit={() => {
        saveBlock({ id: block?.id ?? `blk-${Date.now()}`, name, variety: draft.variety, area: Number(draft.area), irrigation: draft.irrigation, plantingSystem: draft.plantingSystem, plantedOn: draft.plantedOn, manuringEveryDays: Number(draft.manuringEveryDays) });
        onClose();
      }}
      extra={
        block && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete ${block.name} and its field log entries?`)) {
                removeBlock(block.id);
                onClose();
              }
            }}
            className={`${buttonSecondary} hover:!bg-[var(--d-danger-soft)] hover:!text-[var(--d-danger-text)]`}
          >
            Delete
          </button>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="blk-name" label="Block name">
          <input id="blk-name" value={draft.name} onChange={(event) => set({ name: event.target.value })} className={fieldClass} />
        </Field>
        <Field id="blk-variety" label="Mulberry variety">
          <select id="blk-variety" value={draft.variety} onChange={(event) => set({ variety: event.target.value })} className={fieldClass}>
            {varieties.map((variety) => (
              <option key={variety}>{variety}</option>
            ))}
          </select>
        </Field>
        <Field id="blk-area" label="Area cultivated">
          <div className="flex items-center rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] focus-within:border-[var(--d-accent)]">
            <input id="blk-area" type="number" inputMode="decimal" min={0} step={0.1} value={draft.area} onChange={(event) => set({ area: event.target.value })} className="w-full bg-transparent px-3 py-2 text-sm font-semibold text-[var(--d-text)] outline-none" />
            <span className="pr-3 text-xs text-[var(--d-muted)]">acres</span>
          </div>
        </Field>
        <Field id="blk-planted" label="Planted on">
          <input id="blk-planted" type="date" value={draft.plantedOn} max={today} onChange={(event) => set({ plantedOn: event.target.value })} className={fieldClass} />
        </Field>
        <Field id="blk-system" label="Planting system">
          <select id="blk-system" value={draft.plantingSystem} onChange={(event) => set({ plantingSystem: event.target.value })} className={fieldClass}>
            {plantingSystems.map((system) => (
              <option key={system}>{system}</option>
            ))}
          </select>
        </Field>
        <Field id="blk-manure" label="Manure every" hint="Sets when the next manuring falls due">
          <div className="flex items-center rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] focus-within:border-[var(--d-accent)]">
            <input id="blk-manure" type="number" inputMode="numeric" min={15} step={5} value={draft.manuringEveryDays} onChange={(event) => set({ manuringEveryDays: event.target.value })} className="w-full bg-transparent px-3 py-2 text-sm font-semibold text-[var(--d-text)] outline-none" />
            <span className="pr-3 text-xs text-[var(--d-muted)]">days</span>
          </div>
        </Field>
      </div>
      <div className="mt-4">
        <Chips label="Irrigation type" value={draft.irrigation} options={irrigationTypes} onChange={(irrigation) => set({ irrigation })} />
      </div>
    </FormDialog>
  );
}

// ---- Field log entry: manuring, medication, pest control, defects and other work ----

export const activityTypes: FieldActivityType[] = ["Manuring", "Medication", "Pest control", "Defect", "Pruning", "Weeding", "Leaf harvest", "Irrigation", "Soil test", "Other"];
const sprayTypes: FieldActivityType[] = ["Medication", "Pest control"];
const productLabel: Partial<Record<FieldActivityType, string>> = { Manuring: "Manure / fertiliser", Medication: "Medicine (fungicide etc.)", "Pest control": "Pesticide / bio-control" };
const severities = ["Low", "Moderate", "High"] as const;

export function ActivityDialog({ activity, initialType, onClose }: { activity: FieldActivity | null; initialType?: FieldActivityType; onClose: () => void }) {
  const { blocks, saveActivity, removeActivity } = useMulberry();
  const today = useToday();
  const [draft, setDraft] = useState(() => ({
    type: activity?.type ?? initialType ?? "Manuring",
    date: activity?.date ?? today,
    blockId: activity?.blockId ?? blocks[0]?.id ?? "all",
    title: activity?.title ?? "",
    status: activity?.status ?? ("Done" as FieldActivity["status"]),
    product: activity?.product ?? "",
    dose: activity?.dose ?? "",
    waitDays: activity?.waitDays === undefined ? "" : String(activity.waitDays),
    defect: activity?.defect ?? leafDefects[0],
    severity: activity?.severity ?? ("Moderate" as NonNullable<FieldActivity["severity"]>),
    affected: activity?.affected === undefined ? "" : String(activity.affected),
    notes: activity?.notes ?? "",
  }));
  const set = (next: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...next }));

  const spray = sprayTypes.includes(draft.type);
  const usesProduct = draft.type in productLabel;
  const isDefect = draft.type === "Defect";
  const title = draft.title.trim() || (isDefect ? draft.defect : draft.type);
  const error = !draft.date
    ? "Pick a date."
    : spray && draft.status === "Done" && draft.waitDays === ""
      ? "Enter the waiting period before the leaf can be fed (0 if none)."
      : draft.affected !== "" && !(Number(draft.affected) >= 0 && Number(draft.affected) <= 100)
        ? "Affected must be 0 to 100%."
        : "";

  return (
    <FormDialog
      title={activity ? "Edit field record" : "Log field activity"}
      description="Record what was done in the mulberry garden, or plan it for later."
      error={error}
      submitLabel={activity ? "Save record" : draft.status === "Planned" ? "Plan activity" : "Add record"}
      canSubmit={!error}
      onClose={onClose}
      onSubmit={() => {
        saveActivity({
          id: activity?.id ?? `act-${Date.now()}`,
          date: draft.date,
          blockId: draft.blockId,
          type: draft.type,
          title,
          status: draft.status,
          product: usesProduct && draft.product.trim() ? draft.product.trim() : undefined,
          dose: usesProduct && draft.dose.trim() ? draft.dose.trim() : undefined,
          waitDays: spray && draft.waitDays !== "" ? Number(draft.waitDays) : undefined,
          defect: isDefect ? draft.defect : undefined,
          severity: isDefect ? draft.severity : undefined,
          affected: isDefect && draft.affected !== "" ? Number(draft.affected) : undefined,
          notes: draft.notes.trim() || undefined,
          photo: activity?.photo,
          aiFinding: activity?.aiFinding,
        });
        onClose();
      }}
      extra={
        activity && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Delete this record?")) {
                removeActivity(activity.id);
                onClose();
              }
            }}
            className={`${buttonSecondary} hover:!bg-[var(--d-danger-soft)] hover:!text-[var(--d-danger-text)]`}
          >
            Delete
          </button>
        )
      }
    >
      <Chips label="Activity" value={draft.type} options={activityTypes} onChange={(type) => set({ type })} />

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field id="act-date" label="Date">
          <input id="act-date" type="date" value={draft.date} onChange={(event) => set({ date: event.target.value, status: event.target.value > today ? "Planned" : draft.status })} className={fieldClass} />
        </Field>
        <Field id="act-block" label="Block">
          <select id="act-block" value={draft.blockId} onChange={(event) => set({ blockId: event.target.value })} className={fieldClass}>
            {blocks.map((block) => (
              <option key={block.id} value={block.id}>
                {block.name} · {block.variety}
              </option>
            ))}
            <option value="all">All blocks</option>
          </select>
        </Field>
        <Chips label="Status" value={draft.status} options={["Done", "Planned"] as const} onChange={(status) => set({ status })} />
      </div>

      <Field id="act-title" label="Title" className="mt-4">
        <input id="act-title" value={draft.title} onChange={(event) => set({ title: event.target.value })} placeholder={isDefect ? draft.defect : `e.g. ${draft.type === "Manuring" ? "NPK split dose" : draft.type === "Pest control" ? "Thrips spray" : draft.type}`} className={fieldClass} />
      </Field>

      {usesProduct && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="act-product" label={productLabel[draft.type] ?? "Product"}>
            <input id="act-product" value={draft.product} onChange={(event) => set({ product: event.target.value })} placeholder={draft.type === "Manuring" ? "Farmyard manure, Urea + SSP + MOP…" : "Product name"} className={fieldClass} />
          </Field>
          <Field id="act-dose" label="Dose / rate">
            <input id="act-dose" value={draft.dose} onChange={(event) => set({ dose: event.target.value })} placeholder={draft.type === "Manuring" ? "10 t/ha, 60:24:24 kg NPK/ha" : "1 ml/L, 1 g/L"} className={fieldClass} />
          </Field>
        </div>
      )}

      {spray && (
        <Field id="act-wait" label="Waiting period before feeding leaf to silkworms" hint="From the product label. The Mulberry tab warns until it has passed." className="mt-4">
          <div className="flex items-center rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] focus-within:border-[var(--d-accent)] sm:w-48">
            <input id="act-wait" type="number" inputMode="numeric" min={0} value={draft.waitDays} onChange={(event) => set({ waitDays: event.target.value })} className="w-full bg-transparent px-3 py-2 text-sm font-semibold text-[var(--d-text)] outline-none" />
            <span className="pr-3 text-xs text-[var(--d-muted)]">days</span>
          </div>
        </Field>
      )}

      {isDefect && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="act-defect" label="Defect">
            <select id="act-defect" value={draft.defect} onChange={(event) => set({ defect: event.target.value })} className={fieldClass}>
              {(leafDefects.includes(draft.defect) ? leafDefects : [draft.defect, ...leafDefects]).map((defect) => (
                <option key={defect}>{defect}</option>
              ))}
            </select>
          </Field>
          <Field id="act-affected" label="Affected (%)">
            <input id="act-affected" type="number" inputMode="decimal" min={0} max={100} value={draft.affected} onChange={(event) => set({ affected: event.target.value })} placeholder="Optional" className={fieldClass} />
          </Field>
          <div className="sm:col-span-2">
            <Chips label="Severity" value={draft.severity} options={severities} onChange={(severity) => set({ severity })} />
          </div>
        </div>
      )}

      {activity?.photo && (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-[var(--d-inset)] p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
          <img src={activity.photo} alt="Leaf photo" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
          {activity.aiFinding && <p className="text-xs leading-5 text-[var(--d-soft)]">{activity.aiFinding}</p>}
        </div>
      )}

      <Field id="act-notes" label="Notes" className="mt-4">
        <textarea id="act-notes" rows={2} value={draft.notes} onChange={(event) => set({ notes: event.target.value })} placeholder="Method, weather, observations…" className={`${fieldClass} resize-y font-normal`} />
      </Field>
    </FormDialog>
  );
}

// ---- Leaf photo analysis ----

type Analysis = { leafShare: number; affected: number; yellow: number; brown: number; severity: "Low" | "Moderate" | "High"; defect: string; finding: string; action: string; photo: string };

const severityTone: Record<Analysis["severity"], Tone> = { Low: "accent", Moderate: "warn", High: "danger" };

function rgbToHsv(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta) hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return { h: (hue * 60 + 360) % 360, s: max ? delta / max : 0, v: max / 255 };
}

/**
 * Demo analysis on the device: counts green, yellowing and brown leaf pixels in the photo.
 * It is a rough estimate to show the workflow; a trained AI model replaces it once the service is connected.
 */
async function analyseLeaf(file: File): Promise<Analysis> {
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

    let green = 0;
    let yellow = 0;
    let brown = 0;
    for (let index = 0; index < data.length; index += 4) {
      const { h, s, v } = rgbToHsv(data[index], data[index + 1], data[index + 2]);
      if (s < 0.18 || v < 0.12) continue; // background, shadow or glare
      if (h >= 70 && h <= 170) green++;
      else if (h >= 45 && h < 70 && v > 0.35) yellow++;
      else if (h >= 8 && h < 45 && v < 0.75) brown++;
    }
    const pixels = data.length / 4;
    const leaf = green + yellow + brown;
    const leafShare = leaf / pixels;

    // Small copy of the photo to keep with the record.
    const thumb = document.createElement("canvas");
    const thumbScale = Math.min(1, 320 / Math.max(image.width, image.height));
    thumb.width = Math.round(image.width * thumbScale);
    thumb.height = Math.round(image.height * thumbScale);
    thumb.getContext("2d")?.drawImage(image, 0, 0, thumb.width, thumb.height);
    const photo = thumb.toDataURL("image/jpeg", 0.7);

    const yellowPct = leaf ? (yellow / leaf) * 100 : 0;
    const brownPct = leaf ? (brown / leaf) * 100 : 0;
    const affected = Math.round(yellowPct + brownPct);
    const severity = affected < 5 ? "Low" : affected < 20 ? "Moderate" : "High";

    if (leafShare < 0.08) {
      return { leafShare, affected: 0, yellow: 0, brown: 0, severity: "Low", defect: "Other", photo, finding: "No leaf found clearly in the photo.", action: "Retake it closer, with one leaf filling most of the frame on a plain background, in daylight." };
    }
    if (brownPct >= 6 && brownPct >= yellowPct / 2) {
      return { leafShare, affected, yellow: yellowPct, brown: brownPct, severity, defect: "Leaf spot", photo, finding: `Brown, dead patches cover about ${brownPct.toFixed(0)}% of the leaf. This pattern fits leaf spot or leaf rust.`, action: "Pick and destroy the affected leaves, avoid wetting the leaves when watering, and ask your extension officer about a fungicide. Keep to its waiting period before feeding the leaves." };
    }
    if (yellowPct >= 12) {
      return { leafShare, affected, yellow: yellowPct, brown: brownPct, severity, defect: "Yellowing / nutrient deficiency", photo, finding: `Yellowing covers about ${yellowPct.toFixed(0)}% of the leaf. This fits a nitrogen or micronutrient shortage, mosaic, or sap-sucking pests such as Tukra (mealybug).`, action: "Check the shoot tips and leaf undersides for mealybugs or thrips, compare with the last soil test, and plan the next manuring split." };
    }
    return { leafShare, affected, yellow: yellowPct, brown: brownPct, severity: "Low", defect: "Other", photo, finding: `The leaf is mostly healthy green. Only about ${affected}% shows discolouration.`, action: "No action needed. Keep watching this block." };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function LeafScan() {
  const { blocks, saveActivity, storageFull } = useMulberry();
  const today = useToday();
  const input = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [blockId, setBlockId] = useState(blocks[0]?.id ?? "all");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

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

  const analyse = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      setResult(await analyseLeaf(file));
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The photo could not be analysed.");
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!result) return;
    saveActivity({
      id: `act-${Date.now()}`,
      date: today,
      blockId,
      type: "Defect",
      title: result.defect === "Other" ? "Leaf photo check" : result.defect,
      status: "Done",
      defect: result.defect,
      severity: result.severity,
      affected: result.affected,
      notes: notes.trim() || undefined,
      photo: result.photo,
      aiFinding: `${result.finding} ${result.action}`,
    });
    setSaved(true);
  };

  return (
    <div className="flex flex-col gap-4">
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
          <img src={preview} alt="Selected leaf" className="max-h-56 w-auto rounded-lg object-contain" />
        ) : (
          <>
            <ScanSearch className="h-10 w-10 text-[var(--d-accent)]" aria-hidden="true" />
            <div className="text-sm font-semibold text-[var(--d-text)]">Upload a photo of the affected leaf</div>
            <div className="text-xs text-[var(--d-muted)]">One leaf filling the frame, on a plain background, in daylight. Drag a photo here or choose one.</div>
          </>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => input.current?.click()} className={buttonSecondary}>
            <ImageUp className="h-3.5 w-3.5" aria-hidden="true" /> {preview ? "Choose another" : "Upload photo"}
          </button>
          <button type="button" onClick={() => cameraInput.current?.click()} className={buttonSecondary}>
            <Camera className="h-3.5 w-3.5" aria-hidden="true" /> Take photo
          </button>
        </div>
        <input ref={input} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(event) => choose(event.target.files?.[0])} />
        <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(event) => choose(event.target.files?.[0])} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="scan-block" label="Block">
          <select id="scan-block" value={blockId} onChange={(event) => setBlockId(event.target.value)} className={fieldClass}>
            {blocks.map((block) => (
              <option key={block.id} value={block.id}>
                {block.name} · {block.variety}
              </option>
            ))}
            <option value="all">All blocks</option>
          </select>
        </Field>
        <Field id="scan-notes" label="What you noticed">
          <input id="scan-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="e.g. spots on lower leaves" className={fieldClass} />
        </Field>
      </div>

      <button type="button" onClick={analyse} disabled={!file || busy} className={`${buttonPrimary} self-start !px-4 !py-2 !text-sm`}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />} {busy ? "Analysing…" : "Analyse leaf with AI"}
      </button>
      {error && <div className="text-xs font-semibold text-[var(--d-danger-text)]">{error}</div>}

      {result && (
        <div className="rounded-xl border border-[var(--d-card-border)] bg-[var(--d-inset)] p-4" aria-live="polite">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-[var(--d-text)]">{result.defect === "Other" ? "Observation" : `Likely: ${result.defect}`}</span>
            <Pill tone={severityTone[result.severity]}>{result.severity}</Pill>
            <Pill tone="muted">Demo estimate</Pill>
          </div>
          {result.leafShare >= 0.08 && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Affected", value: result.affected },
                { label: "Yellowing", value: Math.round(result.yellow) },
                { label: "Brown spots", value: Math.round(result.brown) },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-[var(--d-chip)] px-2 py-2">
                  <div className="text-lg font-bold tabular-nums text-[var(--d-text)]">{item.value}%</div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--d-muted)]">{item.label}</div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-sm leading-6 text-[var(--d-soft)]">{result.finding}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--d-text)]">
            <strong>Suggested:</strong> {result.action}
          </p>
          <p className="mt-2 text-[11px] text-[var(--d-muted)]">Estimated on this device from the leaf&apos;s colours. Diagnosis by the AI model will appear here once the AI service is connected. Confirm with your extension officer before spraying.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={save} disabled={saved || result.leafShare < 0.08} className={buttonPrimary}>
              {saved ? "Saved to defect records" : "Save to defect records"}
            </button>
            {saved && storageFull && <span className="text-xs font-semibold text-[var(--d-warn)]">Browser storage is full: this record stays until you reload.</span>}
          </div>
        </div>
      )}
    </div>
  );
}
