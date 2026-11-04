"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Beaker, Check, Copy, Droplets, Fan, Faucet, FlaskConical, Layers, Pencil, Plus, RotateCw, Settings, SlidersVertical, Warehouse, Waves, X, Zap } from "lucide-react";

import { type AutomationArea, type AutomationModel, type ModelValues, defaultValues, modelFields, useAutomationModels } from "@/components/dashboard/automation-models";
import { controllerModes, useControllerModes } from "@/components/dashboard/controller-mode";
import { type Icon, Toggle, Widget } from "@/components/dashboard/dashboard-widgets";
import { DeviceRow } from "@/components/dashboard/device-row";
import { FertigationSetpoints } from "@/components/dashboard/fertigation-board";
import { SectionHeader } from "@/components/dashboard/monitor-widgets";
import { DashboardPage, PageHeader, ViewTabs, buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";
import { WaterLevelIcon } from "@/components/dashboard/sensor-icons";
import { useFarmDevices } from "@/components/dashboard/farm-devices";
import { useShedEquipment } from "@/components/dashboard/shed-devices";
import { ShedLimitsEditor } from "@/components/dashboard/shed-setup";

const areas: { id: AutomationArea; label: string; icon: Icon; devices: { name: string; icon: Icon; spins?: boolean }[] }[] = [
  {
    id: "irrigation",
    label: "Irrigation",
    icon: Waves,
    devices: [
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
    // The shed's devices are the list set up under Settings → Shed (shed-devices.ts); see AutomationCenter.
    devices: [],
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

// ---- Set points: fertigation bands and shed limits (min and max). Irrigation has none: its active model drives the pump and valves. ----

const setpointDetail: Record<Exclude<AutomationArea, "irrigation">, string> = {
  fertigation: "Nutrient target bands and dosing limits · used by Fertigation and Farm Monitor",
  shed: "A min and max for each reading · Auto keeps the active shed model inside them · also under Settings → Shed",
};

function AreaSetpoints({ area }: { area: Exclude<AutomationArea, "irrigation"> }) {
  if (area === "shed")
    return (
      <Widget title="Shed Limits" icon={SlidersVertical}>
        <ShedLimitsEditor />
      </Widget>
    );
  return (
    <Widget title="Nutrient Set Points" icon={SlidersVertical}>
      <FertigationSetpoints />
    </Widget>
  );
}

// ---- Page ----

type AreaView = "models" | "limits" | "devices";
const isArea = (value: string | null): value is AutomationArea => areas.some((item) => item.id === value);
const isView = (value: string | null): value is AreaView => value === "models" || value === "limits" || value === "devices";

// The area and view can be picked by link (?area=shed&view=limits), e.g. from the "Set points" links on other tabs.
export default function AutomationCenterPage() {
  return (
    <Suspense fallback={null}>
      <AutomationCenter />
    </Suspense>
  );
}

function AutomationCenter() {
  const params = useSearchParams();
  const linkedArea = params.get("area");
  const linkedView = params.get("view");
  const [picked, setAreaId] = useState<AutomationArea | null>(null);
  const areaId = picked ?? (isArea(linkedArea) ? linkedArea : "irrigation");
  const [pickedView, setView] = useState<AreaView | null>(null);
  const { models, active, setActive } = useAutomationModels();
  const shedEquipment = useShedEquipment();
  const farmDevices = useFarmDevices();
  const [editing, setEditing] = useState<{ model: AutomationModel | null; template?: AutomationModel } | null>(null);
  const area = areas.find((item) => item.id === areaId) ?? areas[0];
  const hasLimits = area.id !== "irrigation";
  // A "Set points" link from another tab (?area=shed) opens that area's Limits view.
  const requested = pickedView ?? (isView(linkedView) ? linkedView : linkedArea && linkedArea !== "irrigation" && !picked ? "limits" : "models");
  const view: AreaView = requested === "limits" && !hasLimits ? "models" : requested;
  // Shed devices are set up under Settings → Shed; pumps and valves on the Farm Monitor.
  const devices: { name: string; icon: Icon; spins?: boolean }[] =
    area.id === "shed"
      ? shedEquipment.map(({ name, icon, spins }) => ({ name, icon, spins }))
      : area.id === "irrigation"
        ? [...farmDevices.pumps.map((pump) => ({ name: pump.name, icon: Waves })), ...farmDevices.valves.map((valve) => ({ name: valve.name, icon: Faucet })), ...area.devices]
        : area.devices;
  const areaModels = models.filter((model) => model.area === area.id);
  const modes = useControllerModes(devices.map((device) => device.name));
  const counts = Object.fromEntries(controllerModes.map((mode) => [mode.value, modes.filter((value) => value === mode.value).length]));
  const views = areas.map((item) => ({ id: item.id, label: item.label, icon: item.icon, count: models.filter((model) => model.area === item.id).length }));
  const activeModel = areaModels.find((model) => model.id === active[area.id]);
  const subViews: { id: AreaView; label: string; icon: Icon }[] = [
    { id: "models", label: "Models", icon: Layers },
    ...(hasLimits ? [{ id: "limits" as const, label: area.id === "shed" ? "Limits" : "Set points", icon: SlidersVertical }] : []),
    { id: "devices", label: "Devices", icon: Fan },
  ];

  return (
    <DashboardPage tint="slate">
      <PageHeader icon={Zap} eyebrow="Automation Center" title="Automation models and device control" detail="Models, limits and device control for each area" />

      <ViewTabs
        label="Automation area"
        idPrefix="automation"
        views={views}
        value={area.id}
        onChange={(id) => {
          setAreaId(id);
          setView(view === "limits" && id === "irrigation" ? "models" : view);
        }}
      />

      <div role="tabpanel" id={`automation-view-${area.id}`} aria-labelledby={`automation-tab-${area.id}`} className="space-y-6">
        <div role="tablist" aria-label={`${area.label} views`} className="flex flex-wrap gap-2">
          {subViews.map((item) => {
            const selected = item.id === view;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setView(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                  selected ? "border-transparent accent-fill" : "border-[var(--d-card-border)] bg-[var(--d-card)] text-[var(--d-soft)] hover:text-[var(--d-text)]"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" /> {item.label}
              </button>
            );
          })}
        </div>

        {view === "models" && (
          <section aria-label="Automation models">
            <SectionHeader icon={Layers} title={`${area.label} Models`} detail={`${areaModels.length} saved · active: ${activeModel?.name ?? "none"} · tap a model to edit it`} />
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,17rem),1fr))]">
              {areaModels.map((model) => {
                const isActive = model.id === active[area.id];
                const onDark = "inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25";
                return (
                  <article
                    key={model.id}
                    className={`relative flex min-w-0 flex-col overflow-hidden rounded-2xl border p-4 transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-md ${
                      isActive ? "border-transparent bg-gradient-to-br from-[var(--d-accent-deep)] to-[var(--d-accent-strong)] text-white shadow-[0_16px_34px_-16px_color-mix(in_srgb,var(--d-accent-strong)_90%,transparent)]" : "dash-card border-[var(--d-card-border)] bg-[var(--d-card)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className={`break-words text-base font-bold ${isActive ? "" : "text-[var(--d-text)]"}`}>{model.name}</h3>
                        {model.notes && <p className={`mt-0.5 text-xs leading-5 ${isActive ? "text-white/80" : "text-[var(--d-muted)]"}`}>{model.notes}</p>}
                      </div>
                      {isActive && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#fff] px-2.5 py-1 text-[11px] font-bold text-[var(--d-accent-deep)]">
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
                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                      {!isActive && (
                        <button type="button" onClick={() => setActive(area.id, model.id)} className={buttonPrimary}>
                          <Check className="h-3.5 w-3.5" aria-hidden="true" /> Use this model
                        </button>
                      )}
                      <button type="button" onClick={() => setEditing({ model })} className={isActive ? onDark : buttonSecondary}>
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
                      </button>
                      <button type="button" onClick={() => setEditing({ model: null, template: { ...model, name: `${model.name} (copy)` } })} className={isActive ? onDark : buttonSecondary}>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Duplicate
                      </button>
                    </div>
                  </article>
                );
              })}
              <button
                type="button"
                onClick={() => setEditing({ model: null })}
                className="flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--d-card-border)] text-sm font-semibold text-[var(--d-muted)] transition-colors hover:border-[var(--d-accent)] hover:text-[var(--d-accent)]"
              >
                <Plus className="h-6 w-6" aria-hidden="true" /> New model
              </button>
            </div>
          </section>
        )}

        {view === "limits" && area.id !== "irrigation" && (
          <section aria-label="Set points">
            <SectionHeader icon={SlidersVertical} title={`${area.label} ${area.id === "shed" ? "Limits" : "Set Points"}`} detail={setpointDetail[area.id]} />
            <AreaSetpoints area={area.id} />
          </section>
        )}

        {view === "devices" && (
          <section aria-label="Devices">
            <SectionHeader
              icon={Fan}
              title={`${area.label} Devices`}
              detail={`Auto follows the active model${activeModel ? ` (${activeModel.name})` : ""} · Semi-auto asks for a target when switched on · Manual is plain on/off`}
              action={
                area.id === "fertigation" ? undefined : (
                  <Link href={area.id === "shed" ? "/dashboard/settings/?tab=shed" : "/dashboard/farm/"} className={`${buttonSecondary} whitespace-nowrap`}>
                    <Settings className="h-3.5 w-3.5" aria-hidden="true" /> Add / remove
                  </Link>
                )
              }
            />
            <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-4">
              {controllerModes.map((mode) => (
                <div key={mode.value} className="flex min-w-0 flex-col items-start gap-1 rounded-xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-3 sm:flex-row sm:items-center sm:gap-3" title={mode.detail}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: mode.value === "manual" ? "var(--d-warn-soft)" : "var(--d-accent-soft)" }}>
                    <mode.icon className="h-4 w-4" style={{ color: mode.value === "manual" ? "var(--d-warn)" : "var(--d-accent)" }} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--d-muted)]">{mode.label}</span>
                    <span className="block text-lg font-bold text-[var(--d-text)]">
                      {counts[mode.value]} <span className="text-xs font-medium text-[var(--d-muted)]">devices</span>
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <Widget title={`${area.label} devices`} icon={area.icon}>
              {devices.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--d-muted)]">No devices set up yet.</p>
              ) : (
                <div className="grid gap-3 xl:grid-cols-2">
                  {devices.map((device) => (
                    <DeviceRow key={device.name} name={device.name} icon={device.icon} spins={device.spins} />
                  ))}
                </div>
              )}
            </Widget>
          </section>
        )}
      </div>

      {editing && <ModelDialog area={area.id} model={editing.model} template={editing.template} onClose={() => setEditing(null)} />}
    </DashboardPage>
  );
}
