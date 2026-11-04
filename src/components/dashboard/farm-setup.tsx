"use client";

import { useEffect, useState } from "react";
import { Check, Faucet, Plus, RotateCcw, Trash2, Waves } from "lucide-react";

import { farmNameProblem, useFarmDevices } from "@/components/dashboard/farm-devices";
import { buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";

// Add or remove the farm's pumps (motors) and field valves. Shown on the Farm Monitor.
// Changes save straight away and every tab that shows pumps or valves picks them up.

const fieldClass =
  "h-10 w-full min-w-0 rounded-xl border border-[var(--d-line)] bg-[var(--d-popup)] px-3 text-sm text-[var(--d-text)] outline-none placeholder:text-[var(--d-muted)] focus:border-[var(--d-accent)]";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block min-w-0 ${className ?? ""}`}>
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--d-muted)]">{label}</span>
      {children}
    </label>
  );
}

function useSavedFlash() {
  const [saved, setSaved] = useState({ show: false, tick: 0 });
  useEffect(() => {
    if (!saved.show) return;
    const timer = window.setTimeout(() => setSaved((current) => ({ ...current, show: false })), 1800);
    return () => window.clearTimeout(timer);
  }, [saved.show, saved.tick]);
  return { show: saved.show, flash: () => setSaved((current) => ({ show: true, tick: current.tick + 1 })) };
}

function DeviceItem({ icon: Icon, name, detail, onRemove }: { icon: typeof Waves; name: string; detail: string; onRemove: () => void }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-[var(--d-line)] bg-[var(--d-inset)] p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--d-accent-soft)] text-[var(--d-accent)]">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[var(--d-text)]">{name}</span>
        <span className="block truncate text-[11px] text-[var(--d-muted)]">{detail}</span>
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        title={`Remove ${name}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--d-muted)] transition hover:bg-[var(--d-danger-soft)] hover:text-[var(--d-danger-text)]"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  );
}

export function FarmDeviceManager() {
  const { pumps, valves, addPump, removePump, addValve, removeValve, reset } = useFarmDevices();
  const saved = useSavedFlash();

  const [pump, setPump] = useState({ name: "", location: "" });
  const [pumpTouched, setPumpTouched] = useState(false);
  const pumpProblem = farmNameProblem(pump.name);

  const [valve, setValve] = useState({ name: "", zone: "", flowRate: "25", volume: "300" });
  const [valveTouched, setValveTouched] = useState(false);
  const flowRate = Number(valve.flowRate);
  const volume = Number(valve.volume);
  const valveProblem = farmNameProblem(valve.name) ?? (!(flowRate > 0 && flowRate <= 500) ? "Flow rate: 1–500 L/min." : !(volume >= 10 && volume <= 10000) ? "Volume per run: 10–10,000 L." : null);

  const confirmRemove = (name: string, remove: () => void) => {
    if (window.confirm(`Remove ${name}? Its schedules stop showing it until you add it back.`)) {
      remove();
      saved.flash();
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <form
          className="rounded-2xl border border-[var(--d-line)] bg-[var(--d-inset)] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            setPumpTouched(true);
            if (pumpProblem) return;
            addPump(pump.name, pump.location);
            setPump({ name: "", location: "" });
            setPumpTouched(false);
            saved.flash();
          }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--d-text)]">
            <Waves className="h-4 w-4 text-[var(--d-accent)]" aria-hidden="true" /> Add a pump / motor
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input value={pump.name} onChange={(event) => setPump((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Borewell Pump 2" className={fieldClass} aria-invalid={pumpTouched && !!pumpProblem} />
            </Field>
            <Field label="Location">
              <input value={pump.location} onChange={(event) => setPump((current) => ({ ...current, location: event.target.value }))} placeholder="e.g. Pump house" className={fieldClass} />
            </Field>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--d-danger-text)]">{pumpTouched && pumpProblem}</span>
            <button type="submit" className={`${buttonPrimary} h-9 px-4`}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add pump
            </button>
          </div>
        </form>

        <form
          className="rounded-2xl border border-[var(--d-line)] bg-[var(--d-inset)] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            setValveTouched(true);
            if (valveProblem) return;
            addValve({ name: valve.name, zone: valve.zone, flowRate, pressure: 1.5, volume });
            setValve({ name: "", zone: "", flowRate: "25", volume: "300" });
            setValveTouched(false);
            saved.flash();
          }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--d-text)]">
            <Faucet className="h-4 w-4 text-[var(--d-accent)]" aria-hidden="true" /> Add a valve
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Name">
              <input value={valve.name} onChange={(event) => setValve((current) => ({ ...current, name: event.target.value }))} placeholder={`e.g. Valve ${valves.length + 1}`} className={fieldClass} aria-invalid={valveTouched && !!valveProblem} />
            </Field>
            <Field label="Zone / block">
              <input value={valve.zone} onChange={(event) => setValve((current) => ({ ...current, zone: event.target.value }))} placeholder="e.g. Block D" className={fieldClass} />
            </Field>
            <Field label="Flow rate (L/min)">
              <input type="number" inputMode="decimal" min={1} max={500} value={valve.flowRate} onChange={(event) => setValve((current) => ({ ...current, flowRate: event.target.value }))} className={fieldClass} />
            </Field>
            <Field label="Litres per run">
              <input type="number" inputMode="numeric" min={10} max={10000} step={10} value={valve.volume} onChange={(event) => setValve((current) => ({ ...current, volume: event.target.value }))} className={fieldClass} />
            </Field>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--d-danger-text)]">{valveTouched && valveProblem}</span>
            <button type="submit" className={`${buttonPrimary} h-9 px-4`}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add valve
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[var(--d-soft)]">
          <span className="font-semibold text-[var(--d-text)]">{pumps.length}</span> pump{pumps.length === 1 ? "" : "s"} · <span className="font-semibold text-[var(--d-text)]">{valves.length}</span> valve{valves.length === 1 ? "" : "s"} · shown on Irrigation, Automation and the Overview
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold text-[var(--d-accent)] transition-opacity duration-300 ${saved.show ? "opacity-100" : "opacity-0"}`} aria-live="polite">
            <Check className="h-3.5 w-3.5" aria-hidden="true" /> {saved.show ? "Saved" : ""}
          </span>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Put back the standard pump and four valves? Pumps and valves you added are removed.")) {
                reset();
                saved.flash();
              }
            }}
            className={buttonSecondary}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Standard set
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">
            <Waves className="h-3.5 w-3.5" aria-hidden="true" /> Pumps / motors
          </div>
          {pumps.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--d-line)] p-4 text-center text-xs text-[var(--d-muted)]">No pumps.</p>
          ) : (
            <ul className="space-y-2">
              {pumps.map((item) => (
                <DeviceItem key={item.id} icon={Waves} name={item.name} detail={item.location} onRemove={() => confirmRemove(item.name, () => removePump(item.id))} />
              ))}
            </ul>
          )}
        </div>
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">
            <Faucet className="h-3.5 w-3.5" aria-hidden="true" /> Field valves
          </div>
          {valves.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--d-line)] p-4 text-center text-xs text-[var(--d-muted)]">No valves.</p>
          ) : (
            <ul className="space-y-2">
              {valves.map((item) => (
                <DeviceItem key={item.id} icon={Faucet} name={item.name} detail={`${item.zone} · ${item.flowRate} L/min · ${item.volume} L per run`} onRemove={() => confirmRemove(item.name, () => removeValve(item.id))} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
