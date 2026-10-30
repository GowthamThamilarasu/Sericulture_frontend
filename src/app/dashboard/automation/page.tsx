"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Beaker, Blinds, Check, CloudDrizzle, Copy, Droplets, Fan, Faucet, FlaskConical, Heater, Layers, Lightbulb, PanelTop, Pencil, Plus, RotateCw, Snowflake, Warehouse, Waves, Wind, X, Zap } from "lucide-react";

import { type AutomationArea, type AutomationModel, type ModelValues, defaultValues, modelFields, useAutomationModels } from "@/components/dashboard/automation-models";
import { controllerModes, useControllerModes } from "@/components/dashboard/controller-mode";
import { type Icon, Toggle, Widget } from "@/components/dashboard/dashboard-widgets";
import { SectionHeader } from "@/components/dashboard/monitor-widgets";
import { ControlRow, DashboardPage, PageHeader, StatTile, ViewTabs, buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";
import { WaterLevelIcon } from "@/components/dashboard/sensor-icons";

const areas: { id: AutomationArea; label: string; icon: Icon; devices: { name: string; icon: Icon }[] }[] = [
  {
    id: "irrigation",
    label: "Irrigation",
    icon: Waves,
    devices: [
      { name: "Water Pump", icon: Waves },
      { name: "Solenoid Valve", icon: Faucet },
      { name: "Drip Irrigation", icon: Droplets },
    ],
  },
  {
    id: "fertigation",
    label: "Fertigation",
    icon: FlaskConical,
    devices: [
      { name: "Dose Pump", icon: FlaskConical },
      { name: "Mixing Tank", icon: Beaker },
      { name: "Agitator", icon: RotateCw },
      { name: "Tank Filling Valve", icon: WaterLevelIcon },
    ],
  },
  {
    id: "shed",
    label: "Shed",
    icon: Warehouse,
    devices: [
      { name: "Exhaust Fans", icon: Fan },
      { name: "Circulation Fans", icon: Wind },
      { name: "Foggers", icon: CloudDrizzle },
      { name: "Humidifier", icon: CloudDrizzle },
      { name: "Heater", icon: Heater },
      { name: "Cooling", icon: Snowflake },
      { name: "Motorized Ventilation", icon: PanelTop },
      { name: "Lights", icon: Lightbulb },
      { name: "Curtains", icon: Blinds },
      { name: "Louvers", icon: Blinds },
    ],
  },
];

const formatValue = (field: (typeof modelFields)[AutomationArea][number], value: ModelValues[string]) =>
  field.type === "toggle" ? (value ? "Yes" : "No") : field.type === "number" ? `${value}${field.unit ? ` ${field.unit}` : ""}` : String(value);

// ---- Edit / create popup ----

// `model` is the model being edited; `template` pre-fills a new one (Duplicate).
function ModelDialog({ area, model, template, onClose }: { area: AutomationArea; model: AutomationModel | null; template?: AutomationModel; onClose: () => void }) {
  const { save, remove, models } = useAutomationModels();
  const fields = modelFields[area];
  const source = model ?? template;
  const [name, setName] = useState(source?.name ?? "");
  const [notes, setNotes] = useState(source?.notes ?? "");
  const [values, setValues] = useState<ModelValues>(() => ({ ...defaultValues(area), ...source?.values }));
  const trimmed = name.trim();
  const duplicate = models.some((item) => item.area === area && item.id !== model?.id && item.name.toLowerCase() === trimmed.toLowerCase());
  const outOfRange = fields.find((field) => field.type === "number" && !(Number(values[field.key]) >= field.min && Number(values[field.key]) <= field.max));
  const error = !trimmed ? "Give the model a name." : duplicate ? "A model with this name already exists." : outOfRange && outOfRange.type === "number" ? `${outOfRange.label}: ${outOfRange.min}–${outOfRange.max} ${outOfRange.unit}` : "";
  const fieldClass = "w-full rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] px-3 py-2 text-sm font-semibold text-[var(--d-text)] outline-none focus:border-[var(--d-accent)]";

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (error) return;
            save({ id: model?.id ?? `${area}-${Date.now()}`, area, name: trimmed, notes: notes.trim() || undefined, values });
            onClose();
          }}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-lg font-semibold">{model ? "Edit automation model" : "New automation model"}</Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-[var(--d-muted)]">A named set of {area} settings you can switch to at any time.</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--d-soft)]">Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Summer · moisture driven" className={fieldClass} autoFocus />
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {fields.map((field) =>
              field.type === "toggle" ? (
                <div key={field.key} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-3 sm:col-span-2">
                  <span>
                    <span className="block text-sm font-semibold">{field.label}</span>
                    <span className="block text-[11px] text-[var(--d-muted)]">{field.detail}</span>
                  </span>
                  <Toggle size="sm" on={!!values[field.key]} onChange={() => setValues((current) => ({ ...current, [field.key]: !current[field.key] }))} label={field.label} />
                </div>
              ) : (
                <label key={field.key} className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-[var(--d-soft)]">{field.label}</span>
                  {field.type === "time" ? (
                    <input type="time" value={String(values[field.key])} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} className={fieldClass} />
                  ) : (
                    <span className="flex items-center rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] focus-within:border-[var(--d-accent)]">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={String(values[field.key])}
                        onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value === "" ? "" : Number(event.target.value) }))}
                        className="w-full bg-transparent px-3 py-2 text-sm font-semibold text-[var(--d-text)] outline-none"
                      />
                      {field.unit && <span className="pr-3 text-xs text-[var(--d-muted)]">{field.unit}</span>}
                    </span>
                  )}
                </label>
              ),
            )}
          </div>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--d-soft)]">Notes</span>
            <textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="When to use this model" className={`${fieldClass} resize-y font-normal`} />
          </label>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--d-line)] pt-4">
            <div className="flex items-center gap-3">
              {model && models.filter((item) => item.area === area).length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete "${model.name}"?`)) {
                      remove(model.id);
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
                {model ? "Save model" : "Create model"}
              </button>
            </div>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// ---- Page ----

export default function AutomationCenterPage() {
  const [areaId, setAreaId] = useState<AutomationArea>("irrigation");
  const { models, active, setActive } = useAutomationModels();
  const [editing, setEditing] = useState<{ model: AutomationModel | null; template?: AutomationModel } | null>(null);
  const area = areas.find((item) => item.id === areaId) ?? areas[0];
  const areaModels = models.filter((model) => model.area === area.id);
  const modes = useControllerModes(area.devices.map((device) => device.name));
  const counts = Object.fromEntries(controllerModes.map((mode) => [mode.value, modes.filter((value) => value === mode.value).length]));
  const views = areas.map((item) => ({ id: item.id, label: item.label, icon: item.icon, count: models.filter((model) => model.area === item.id).length }));
  const activeModel = areaModels.find((model) => model.id === active[area.id]);

  return (
    <DashboardPage tint="slate">
      <PageHeader icon={Zap} eyebrow="Automation Center" title="Automation models and device control" detail="Save sets of automation settings as models, and switch between them for each area" />

      <ViewTabs label="Automation area" idPrefix="automation" views={views} value={area.id} onChange={setAreaId} />

      <div role="tabpanel" id={`automation-view-${area.id}`} aria-labelledby={`automation-tab-${area.id}`} className="space-y-8">
        <section aria-label="Automation models">
          <SectionHeader icon={Layers} title={`${area.label} Models`} detail={`${areaModels.length} saved · active: ${activeModel?.name ?? "none"} · tap a model to edit it`} />
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(17rem,1fr))]">
            {areaModels.map((model) => {
              const isActive = model.id === active[area.id];
              return (
                <article
                  key={model.id}
                  className={`relative flex flex-col overflow-hidden rounded-2xl border p-4 transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-md ${
                    isActive ? "border-transparent bg-gradient-to-br from-[#0f5c2e] to-[#00a218] text-white shadow-[0_16px_34px_-16px_rgb(0_162_24_/_0.9)]" : "dash-card border-[var(--d-card-border)] bg-[var(--d-card)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className={`text-base font-bold ${isActive ? "" : "text-[var(--d-text)]"}`}>{model.name}</h3>
                      {model.notes && <p className={`mt-0.5 text-xs leading-5 ${isActive ? "text-white/80" : "text-[var(--d-muted)]"}`}>{model.notes}</p>}
                    </div>
                    {isActive && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#0f5c2e]">
                        <Check className="h-3 w-3" aria-hidden="true" /> Active
                      </span>
                    )}
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-1.5">
                    {modelFields[area.id].slice(0, 6).map((field) => (
                      <div key={field.key} className={`min-w-0 rounded-lg px-2.5 py-1.5 ${isActive ? "bg-white/10 ring-1 ring-white/15" : "bg-[var(--d-inset)]"}`}>
                        <dt className={`truncate text-[10px] ${isActive ? "text-white/70" : "text-[var(--d-muted)]"}`} title={field.label}>
                          {field.short}
                        </dt>
                        <dd className="truncate text-sm font-semibold tabular-nums">{formatValue(field, model.values[field.key])}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!isActive && (
                      <button type="button" onClick={() => setActive(area.id, model.id)} className={buttonPrimary}>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" /> Use this model
                      </button>
                    )}
                    <button type="button" onClick={() => setEditing({ model })} className={isActive ? "inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25" : buttonSecondary}>
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing({ model: null, template: { ...model, name: `${model.name} (copy)` } })}
                      className={isActive ? "inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25" : buttonSecondary}
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Duplicate
                    </button>
                  </div>
                </article>
              );
            })}
            <button
              type="button"
              onClick={() => setEditing({ model: null })}
              className="flex min-h-[12rem] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--d-card-border)] text-sm font-semibold text-[var(--d-muted)] transition-colors hover:border-[var(--d-accent)] hover:text-[var(--d-accent)]"
            >
              <Plus className="h-6 w-6" aria-hidden="true" /> New model
            </button>
          </div>
        </section>

        <section aria-label="Devices">
          <SectionHeader icon={Fan} title={`${area.label} Devices`} detail="How each device is run: Auto follows the active model, Semi asks you, Manual is yours" />
          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            {controllerModes.map((mode) => (
              <StatTile key={mode.value} label={mode.label} value={counts[mode.value]} unit="devices" icon={mode.icon} tone={mode.value === "manual" ? "warn" : "accent"} note={mode.detail} />
            ))}
          </div>
          <Widget title={`${area.label} devices`} icon={area.icon}>
            <div className="grid gap-3 md:grid-cols-2">
              {area.devices.map((device) => (
                <ControlRow key={device.name} name={device.name} icon={device.icon} status="Last action 2h ago" />
              ))}
            </div>
          </Widget>
        </section>
      </div>

      {editing && <ModelDialog area={area.id} model={editing.model} template={editing.template} onClose={() => setEditing(null)} />}
    </DashboardPage>
  );
}
