"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, RotateCcw, Save, Scale, Trash2, X } from "lucide-react";

import { formatDate, nextBatchId, stages, useBatches, useToday } from "@/components/dashboard/batch-store";
import { buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";
import { batchHistory, breedTypes, farmSheds, silkwormBreeds } from "@/data/mock";
import type { BatchRecord } from "@/types";

const fieldClass = "w-full rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] px-3 py-2 text-sm font-semibold text-[var(--d-text)] outline-none focus:border-[var(--d-accent)] disabled:opacity-50";
const labelClass = "mb-1.5 block text-xs font-semibold text-[var(--d-soft)]";

function Field({ id, label, hint, children }: { id?: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {hint && <div className="mt-1 text-[11px] text-[var(--d-muted)]">{hint}</div>}
    </div>
  );
}

function Choice<T extends string>({ label, value, options, onChange, format }: { label: string; value: T | null; options: readonly T[]; onChange: (value: T) => void; format?: (value: T) => string }) {
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
            {format ? format(option) : option}
          </button>
        ))}
      </div>
    </div>
  );
}

const instarOptions = ["Auto", ...stages.map((stage) => stage.key)] as const;
const statusOptions = ["Rearing", "Harvested", "Failed"] as const;
const gradeOptions = ["A", "B", "C"] as const;

// Form values are strings so fields can be cleared while typing.
type Draft = Omit<BatchRecord, "layings" | "cocoonKg" | "mortality"> & { layings: string; cocoonKg: string; mortality: string };

const toDraft = (batch: BatchRecord): Draft => ({ ...batch, layings: String(batch.layings), cocoonKg: batch.cocoonKg === null ? "" : String(batch.cocoonKg), mortality: batch.mortality === null ? "" : String(batch.mortality) });

/**
 * Pick the active silkworm batch and edit everything about it: number, farm and shed, breed, layings,
 * dates, instar and harvest results. Shared by Settings and the Silkworm tab's batch settings popup.
 */
export function BatchSettings({ onSaved }: { onSaved?: () => void }) {
  const { batches, active, setActive, save, remove, reset } = useBatches();
  const today = useToday();
  // `previousId` is the batch being edited (null for a new one); the draft resets when it changes.
  const [editing, setEditing] = useState<{ previousId: string | null; draft: Draft }>(() => ({ previousId: active.id, draft: toDraft(active) }));
  const [savedNote, setSavedNote] = useState(false);
  if (editing.previousId !== null && editing.previousId !== active.id && batches.some((batch) => batch.id === active.id)) {
    setEditing({ previousId: active.id, draft: toDraft(active) });
  }

  const { draft, previousId } = editing;
  const isNew = previousId === null;
  const set = (next: Partial<Draft>) => {
    setSavedNote(false);
    setEditing((current) => ({ ...current, draft: { ...current.draft, ...next } }));
  };

  const sheds = farmSheds.find((item) => item.farm === draft.farm)?.sheds ?? [];
  const breeds = silkwormBreeds.some((item) => item.breed === draft.breed) ? silkwormBreeds : [{ breed: draft.breed, type: draft.breedType }, ...silkwormBreeds];
  const finished = draft.status !== "Rearing";

  const id = draft.id.trim();
  const errors: string[] = [];
  if (!id) errors.push("Enter a batch number.");
  else if (batches.some((batch) => batch.id === id && batch.id !== previousId)) errors.push(`Batch ${id} already exists.`);
  if (!(Number(draft.layings) > 0)) errors.push("Layings must be more than 0.");
  if (!draft.brushedOn) errors.push("Pick the brushing date.");
  if (finished && draft.harvestedOn && draft.harvestedOn < draft.brushedOn) errors.push("Harvest date is before the brushing date.");
  const mortality = draft.mortality === "" ? null : Number(draft.mortality);
  if (mortality !== null && !(mortality >= 0 && mortality <= 100)) errors.push("Mortality must be 0 to 100%.");

  const original = isNew ? null : batches.find((batch) => batch.id === previousId);
  const dirty = isNew || !original || JSON.stringify(toDraft(original)) !== JSON.stringify(draft);

  const startNew = () => {
    setSavedNote(false);
    setEditing({
      previousId: null,
      draft: { ...toDraft(active), id: nextBatchId(batches, today), brushedOn: today, instar: "Auto", status: "Rearing", harvestedOn: null, cocoonKg: "", grade: null, mortality: "" },
    });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (errors.length) return;
    const batch: BatchRecord = {
      ...draft,
      id,
      layings: Number(draft.layings),
      harvestedOn: finished ? draft.harvestedOn || today : null,
      cocoonKg: finished && draft.cocoonKg !== "" ? Number(draft.cocoonKg) : null,
      grade: finished ? draft.grade : null,
      mortality,
    };
    save(batch, previousId);
    setEditing({ previousId: batch.id, draft: toDraft(batch) });
    setSavedNote(true);
    onSaved?.();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 rounded-xl bg-[var(--d-inset)] p-4">
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="batch-active" className={labelClass}>
            Batch
          </label>
          <select
            id="batch-active"
            value={isNew ? "__new" : active.id}
            onChange={(event) => {
              setSavedNote(false);
              setActive(event.target.value);
              const batch = batches.find((item) => item.id === event.target.value);
              if (batch) setEditing({ previousId: batch.id, draft: toDraft(batch) });
            }}
            className={fieldClass}
          >
            {isNew && <option value="__new">{draft.id || "New batch"} (new, not saved)</option>}
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.id} · {batch.breed} · {batch.status === "Rearing" ? "Rearing" : `${batch.status} ${formatDate(batch.harvestedOn)}`}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={startNew} disabled={isNew} className={buttonPrimary}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" /> New batch
        </button>
        <button
          type="button"
          onClick={() => {
            if (isNew) return setEditing({ previousId: active.id, draft: toDraft(active) });
            if (window.confirm(`Delete batch ${active.id}? This cannot be undone.`)) remove(active.id);
          }}
          disabled={!isNew && batches.length < 2}
          className={`${buttonSecondary} hover:!bg-[var(--d-danger-soft)] hover:!text-[var(--d-danger-text)]`}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> {isNew ? "Discard new" : "Delete"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="batch-id" label="Batch number" hint="Shown on the Silkworm tab and in the batch history">
          <input id="batch-id" value={draft.id} onChange={(event) => set({ id: event.target.value.toUpperCase() })} className={`${fieldClass} font-mono`} placeholder="SB-2026-015" />
        </Field>
        <Field id="batch-layings" label="Layings brushed (DFLs)">
          <input id="batch-layings" type="number" inputMode="numeric" min={1} value={draft.layings} onChange={(event) => set({ layings: event.target.value })} className={fieldClass} />
        </Field>
        <Field id="batch-farm" label="Farm">
          <select id="batch-farm" value={draft.farm} onChange={(event) => set({ farm: event.target.value, shed: farmSheds.find((item) => item.farm === event.target.value)?.sheds[0] ?? draft.shed })} className={fieldClass}>
            {farmSheds.map((item) => (
              <option key={item.farm}>{item.farm}</option>
            ))}
          </select>
        </Field>
        <Field id="batch-shed" label="Shed">
          <select id="batch-shed" value={draft.shed} onChange={(event) => set({ shed: event.target.value })} className={fieldClass}>
            {(sheds.includes(draft.shed) ? sheds : [draft.shed, ...sheds]).map((shed) => (
              <option key={shed}>{shed}</option>
            ))}
          </select>
        </Field>
        <Field id="batch-breed" label="Breed" hint="Picking a breed fills in its breed type">
          <select id="batch-breed" value={draft.breed} onChange={(event) => set({ breed: event.target.value, breedType: silkwormBreeds.find((item) => item.breed === event.target.value)?.type ?? draft.breedType })} className={fieldClass}>
            {breeds.map((item) => (
              <option key={item.breed}>{item.breed}</option>
            ))}
          </select>
        </Field>
        <Field id="batch-breed-type" label="Breed type">
          <select id="batch-breed-type" value={draft.breedType} onChange={(event) => set({ breedType: event.target.value })} className={fieldClass}>
            {(breedTypes.includes(draft.breedType) ? breedTypes : [draft.breedType, ...breedTypes]).map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </Field>
        <Field id="batch-brushed" label="Brushed on">
          <input id="batch-brushed" type="date" value={draft.brushedOn} max={today} onChange={(event) => set({ brushedOn: event.target.value })} className={fieldClass} />
        </Field>
      </div>

      <Choice label="Status" value={draft.status} options={statusOptions} onChange={(status) => set({ status, harvestedOn: status === "Rearing" ? null : (draft.harvestedOn ?? today) })} />

      {finished ? (
        <div className="grid gap-4 rounded-xl bg-[var(--d-inset)] p-4 sm:grid-cols-2">
          <Field id="batch-harvested" label={draft.status === "Failed" ? "Ended on" : "Harvested on"}>
            <input id="batch-harvested" type="date" value={draft.harvestedOn ?? ""} min={draft.brushedOn} max={today} onChange={(event) => set({ harvestedOn: event.target.value || null })} className={fieldClass} />
          </Field>
          <Field id="batch-cocoon" label="Cocoon yield (kg)">
            <input id="batch-cocoon" type="number" inputMode="decimal" min={0} step={0.1} value={draft.cocoonKg} onChange={(event) => set({ cocoonKg: event.target.value })} className={fieldClass} placeholder="–" />
          </Field>
          <Field id="batch-mortality" label="Mortality (%)">
            <input id="batch-mortality" type="number" inputMode="decimal" min={0} max={100} step={0.1} value={draft.mortality} onChange={(event) => set({ mortality: event.target.value })} className={fieldClass} placeholder="–" />
          </Field>
          <Choice label="Grade" value={draft.grade} options={gradeOptions} onChange={(grade) => set({ grade })} />
        </div>
      ) : (
        <Choice label="Current instar" value={draft.instar} options={instarOptions} onChange={(instar) => set({ instar })} format={(value) => (value === "Auto" ? "Auto (from brushing date)" : value === "Spinning" ? "Spinning" : `Instar ${value}`)} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--d-line)] pt-4">
        <div className="text-xs">
          {errors.length ? (
            <span className="font-semibold text-[var(--d-danger-text)]">{errors[0]}</span>
          ) : savedNote && !dirty ? (
            <span className="font-semibold text-[var(--d-accent)]">Saved · {id} is the active batch</span>
          ) : (
            <span className="text-[var(--d-muted)]">{isNew ? "New batch: save to add it and make it active." : dirty ? "Unsaved changes" : "Saved on this device"}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Restore the demo batches? Your batches and changes will be removed.")) {
                reset();
                setSavedNote(false);
                setEditing({ previousId: batchHistory[0].id, draft: toDraft(batchHistory[0]) });
              }
            }}
            className={buttonSecondary}
            title="Restore the demo batch list"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset
          </button>
          <button type="submit" disabled={errors.length > 0 || !dirty} className={buttonPrimary}>
            <Save className="h-3.5 w-3.5" aria-hidden="true" /> {isNew ? "Add batch" : "Save batch"}
          </button>
        </div>
      </div>
    </form>
  );
}

/** Popup form to record (or correct) a batch's cocoon harvest: date, weight, grade and losses. */
export function CocoonYieldButton({ batch }: { batch: BatchRecord }) {
  const [open, setOpen] = useState(false);
  const recorded = batch.cocoonKg !== null;
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={buttonPrimary}>
        <Scale className="h-3.5 w-3.5" aria-hidden="true" /> {recorded ? "Edit cocoon yield" : "Record cocoon yield"}
      </Dialog.Trigger>
      {open && <CocoonYieldForm batch={batch} onDone={() => setOpen(false)} />}
    </Dialog.Root>
  );
}

function CocoonYieldForm({ batch, onDone }: { batch: BatchRecord; onDone: () => void }) {
  const { save } = useBatches();
  const today = useToday();
  const [harvestedOn, setHarvestedOn] = useState(batch.harvestedOn ?? today);
  const [kg, setKg] = useState(batch.cocoonKg === null ? "" : String(batch.cocoonKg));
  const [grade, setGrade] = useState<BatchRecord["grade"]>(batch.grade);
  const [mortality, setMortality] = useState(batch.mortality === null ? "" : String(batch.mortality));

  const weight = Number(kg);
  const loss = mortality === "" ? null : Number(mortality);
  const errors: string[] = [];
  if (kg.trim() === "" || !(weight > 0) || weight > 100000) errors.push("Enter the cocoon weight in kg.");
  if (!harvestedOn) errors.push("Pick the harvest date.");
  else if (harvestedOn < batch.brushedOn) errors.push("Harvest date is before the brushing date.");
  if (loss !== null && !(loss >= 0 && loss <= 100)) errors.push("Mortality must be 0 to 100%.");
  const per100 = weight > 0 ? (weight / batch.layings) * 100 : null;

  return (
    <>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (errors.length) return;
            // Recording a yield finishes the batch; a failed batch stays failed.
            save({ ...batch, status: batch.status === "Failed" ? "Failed" : "Harvested", harvestedOn, cocoonKg: weight, grade, mortality: loss }, batch.id);
            onDone();
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-lg font-semibold">Cocoon yield</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-[var(--d-muted)]">
                Batch <span className="font-mono font-semibold text-[var(--d-text)]">{batch.id}</span> · {batch.breed} · {batch.layings} DFLs
                {batch.status === "Rearing" && " · saving marks the batch as harvested"}
              </Dialog.Description>
            </div>
            <Dialog.Close aria-label="Cancel" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-4 rounded-xl bg-[var(--d-card)] p-4">
            <label htmlFor="yield-kg" className="block text-center text-xs font-semibold text-[var(--d-soft)]">
              Cocoon weight harvested
            </label>
            <div className="mt-2 flex items-baseline justify-center gap-1.5">
              <input
                id="yield-kg"
                type="number"
                inputMode="decimal"
                autoFocus
                min={0}
                step={0.1}
                value={kg}
                onChange={(event) => setKg(event.target.value)}
                placeholder="0.0"
                className="w-32 rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] px-2 py-2 text-center text-3xl font-bold tabular-nums text-[var(--d-accent)] outline-none focus:border-[var(--d-accent)]"
              />
              <span className="text-sm font-semibold text-[var(--d-muted)]">kg</span>
            </div>
            <div className="mt-2 text-center text-[11px] text-[var(--d-muted)]">
              {per100 === null ? "Yield per 100 DFLs is worked out from the layings brushed" : (
                <>
                  = <strong className="tabular-nums text-[var(--d-text)]">{per100.toFixed(1)} kg</strong> per 100 DFLs
                </>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="yield-date" label="Harvested on">
              <input id="yield-date" type="date" value={harvestedOn} min={batch.brushedOn} max={today} onChange={(event) => setHarvestedOn(event.target.value)} className={fieldClass} />
            </Field>
            <Field id="yield-mortality" label="Mortality (%)">
              <input id="yield-mortality" type="number" inputMode="decimal" min={0} max={100} step={0.1} value={mortality} onChange={(event) => setMortality(event.target.value)} placeholder="Optional" className={fieldClass} />
            </Field>
          </div>
          <div className="mt-4">
            <Choice label="Cocoon grade" value={grade} options={gradeOptions} onChange={setGrade} />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[var(--d-danger-text)]">{kg.trim() !== "" || harvestedOn !== (batch.harvestedOn ?? today) ? errors[0] : ""}</span>
            <div className="flex gap-2">
              <Dialog.Close className="rounded-lg bg-[var(--d-chip)] px-4 py-2 text-sm font-medium hover:bg-[var(--d-chip-hover)]">Cancel</Dialog.Close>
              <button type="submit" disabled={errors.length > 0} className="rounded-lg accent-fill px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                Save yield
              </button>
            </div>
          </div>
        </form>
      </Dialog.Content>
    </>
  );
}
