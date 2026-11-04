"use client";

import { ModeSelector } from "@/components/dashboard/controller-mode";
import { setClimateOn, useClimateState } from "@/components/dashboard/climate-store";
import { type Icon, Toggle } from "@/components/dashboard/dashboard-widgets";
import { areaOf, useDevicePower } from "@/components/dashboard/device-automation";
import { ControlNote, useDeviceControl } from "@/components/dashboard/target-dialog";

/**
 * A controllable device: icon, name, what its mode is doing, the Auto / Semi-auto / Manual selector and its switch.
 * `showMode={false}` hides the selector where one switch sets every device's mode (Climate Control).
 */
export function DeviceRow({ name, icon: Icon, spins, showMode = true }: { name: string; icon: Icon; spins?: boolean; showMode?: boolean }) {
  const climate = useClimateState();
  const [stored, setStored] = useDevicePower(name);
  // Shed equipment keeps its on/off in the climate store, so Climate Control and the Automation tab agree.
  const isClimate = areaOf(name) === "shed";
  const control = useDeviceControl(name, isClimate ? (climate.on[name] ?? false) : stored, isClimate ? (value) => setClimateOn(name, value) : setStored);
  const on = control.on;

  return (
    <div className={`flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border p-3 transition-colors ${on ? "border-[var(--d-card-border)] bg-[var(--d-accent-soft)]" : "border-[var(--d-line)] bg-[var(--d-inset)]"}`}>
      {control.dialog}
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${on ? "bg-gradient-to-br from-[var(--d-accent-bright)] to-[var(--d-accent-strong)] text-white shadow-sm" : "bg-[var(--d-chip)] text-[var(--d-muted)]"}`}>
        <Icon className={`h-5 w-5 ${on && spins ? "motion-safe:animate-spin [animation-duration:2.4s]" : ""}`} aria-hidden="true" />
      </span>
      <div className="min-w-[9rem] flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-[var(--d-text)]">{name}</span>
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: on ? "var(--d-accent)" : "var(--d-muted)" }}>
            {on ? "On" : "Off"}
          </span>
        </div>
        <ControlNote control={control} />
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-3">
        {showMode && <ModeSelector name={name} className="shrink-0" />}
        <span title={control.locked ? "Auto mode: follows the active model" : undefined}>
          <Toggle size="sm" on={on} onChange={control.onToggle} label={`${name} power`} disabled={control.locked} />
        </span>
      </div>
    </div>
  );
}
