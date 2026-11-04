"use client";

import { useEffect, useState } from "react";
import { Check, Plus, RotateCcw, Trash2 } from "lucide-react";

import { resetClimateLimits, setClimateLimit, shedLimitSpecs, useClimateState } from "@/components/dashboard/climate-store";
import { reading } from "@/components/dashboard/monitor-widgets";
import { Pill, buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";
import { RangeCard, bandStatus } from "@/components/dashboard/range-card";
import { type ShedDeviceType, nameProblem, shedDeviceTypes, shedGroups, useShedDevices, useShedEquipment } from "@/components/dashboard/shed-devices";

// Shed setup shared by Settings → Shed and Automation → Shed: the min / max limits and the equipment list.
// Changes save straight away and every tab picks them up.

function useSavedFlash() {
  const [saved, setSaved] = useState({ show: false, tick: 0 });
  useEffect(() => {
    if (!saved.show) return;
    const timer = window.setTimeout(() => setSaved((current) => ({ ...current, show: false })), 1800);
    return () => window.clearTimeout(timer);
  }, [saved.show, saved.tick]);
  return { show: saved.show, flash: () => setSaved((current) => ({ show: true, tick: current.tick + 1 })) };
}

function SavedNote({ show }: { show: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold text-[var(--d-accent)] transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`} aria-live="polite">
      <Check className="h-3.5 w-3.5" aria-hidden="true" /> {show ? "Saved" : ""}
    </span>
  );
}

/** Min and max for each shed reading, with the live reading marked on each band. */
export function ShedLimitsEditor() {
  const { limits } = useClimateState();
  const saved = useSavedFlash();
  const inBand = shedLimitSpecs.filter((spec) => {
    const value = reading(spec.sensor)?.value;
    return value === undefined || bandStatus(value, limits[spec.key]) === "In band";
  }).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone={inBand === shedLimitSpecs.length ? "accent" : "warn"}>
            {inBand} of {shedLimitSpecs.length} in range
          </Pill>
          <span className="text-xs text-[var(--d-muted)]">Drag the handles or use − / + to set each min and max.</span>
        </div>
        <div className="flex items-center gap-3">
          <SavedNote show={saved.show} />
          <button
            type="button"
            onClick={() => {
              resetClimateLimits();
              saved.flash();
            }}
            className={buttonSecondary}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset to recommended
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shedLimitSpecs.map((spec) => (
          <RangeCard
            key={spec.key}
            id={`shed-limit-${spec.key}`}
            label={spec.label}
            detail={spec.detail}
            unit={spec.unit}
            icon={spec.icon}
            scale={spec.scale}
            step={spec.step}
            decimals={spec.decimals}
            range={limits[spec.key]}
            value={reading(spec.sensor)?.value}
            onChange={(range) => {
              setClimateLimit(spec.key, range);
              saved.flash();
            }}
          />
        ))}
      </div>
    </div>
  );
}

const typeKeys = Object.keys(shedDeviceTypes) as ShedDeviceType[];

/** Add or remove the shed's controllable equipment. */
export function ShedDeviceManager() {
  const { add, remove, reset } = useShedDevices();
  const equipment = useShedEquipment();
  const [name, setName] = useState("");
  const [type, setType] = useState<ShedDeviceType>("exhaustFan");
  const [touched, setTouched] = useState(false);
  const saved = useSavedFlash();
  const problem = nameProblem(name);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (problem) return;
    add(name, type);
    setName("");
    setTouched(false);
    saved.flash();
  };

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="rounded-2xl border border-[var(--d-line)] bg-[var(--d-inset)] p-4">
        <div className="text-sm font-semibold text-[var(--d-text)]">Add a device</div>
        <div className="mt-0.5 text-xs text-[var(--d-muted)]">Pick what it is: that decides its icon, how Auto runs it and what Semi-auto asks for.</div>
        <div role="radiogroup" aria-label="Device type" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {typeKeys.map((key) => {
            const info = shedDeviceTypes[key];
            const active = key === type;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setType(key)}
                className={`flex min-w-0 items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all ${active ? "border-transparent accent-fill" : "border-[var(--d-line)] bg-[var(--d-popup)] hover:-translate-y-0.5 hover:shadow-md"}`}
              >
                <info.icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-white" : "text-[var(--d-accent)]"}`} aria-hidden="true" />
                <span className="min-w-0">
                  <span className={`block truncate text-[13px] font-semibold ${active ? "text-white" : "text-[var(--d-text)]"}`}>{info.label}</span>
                  <span className={`block truncate text-[10px] ${active ? "text-white/80" : "text-[var(--d-muted)]"}`}>{info.group}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Device name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => name && setTouched(true)}
              placeholder={`e.g. ${shedDeviceTypes[type].label} 2`}
              aria-invalid={touched && !!problem}
              className="h-10 w-full rounded-xl border border-[var(--d-line)] bg-[var(--d-popup)] px-3.5 text-sm text-[var(--d-text)] outline-none placeholder:text-[var(--d-muted)] focus:border-[var(--d-accent)]"
            />
          </label>
          <button type="submit" className={`${buttonPrimary} h-10 px-4`}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Add device
          </button>
        </div>
        {touched && problem && <div className="mt-2 text-xs font-semibold text-[var(--d-danger-text)]">{problem}</div>}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[var(--d-soft)]">
          <span className="font-semibold text-[var(--d-text)]">{equipment.length}</span> devices in the shed · shown on Climate Control, Automation and Shed Monitor
        </div>
        <div className="flex items-center gap-3">
          <SavedNote show={saved.show} />
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Put back the standard shed equipment? Devices you added are removed.")) {
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

      {equipment.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--d-line)] p-8 text-center text-sm text-[var(--d-muted)]">No shed devices. Add the first one above.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {shedGroups
            .filter((group) => equipment.some((item) => item.group === group.group))
            .map((group) => (
              <div key={group.group} className="min-w-0">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">
                  <group.icon className="h-3.5 w-3.5" aria-hidden="true" /> {group.group}
                </div>
                <ul className="space-y-2">
                  {equipment
                    .filter((item) => item.group === group.group)
                    .map((item) => (
                      <li key={item.id} className="flex items-center gap-3 rounded-xl border border-[var(--d-line)] bg-[var(--d-inset)] p-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--d-accent-soft)] text-[var(--d-accent)]">
                          <item.icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[var(--d-text)]">{item.name}</span>
                          <span className="block truncate text-[11px] text-[var(--d-muted)]">
                            {item.typeLabel} · {item.detail}
                          </span>
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          title={`Remove ${item.name}`}
                          onClick={() => {
                            if (window.confirm(`Remove ${item.name} from the shed?`)) {
                              remove(item.id);
                              saved.flash();
                            }
                          }}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--d-muted)] transition hover:bg-[var(--d-danger-soft)] hover:text-[var(--d-danger-text)]"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
