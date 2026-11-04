"use client";

import Link from "next/link";
import { Bot, Check, ChevronRight, Hand, Settings, SlidersHorizontal, UserCog } from "lucide-react";

import { setClimateLimit, setClimateOn, useClimateState } from "@/components/dashboard/climate-store";
import { type ControllerMode, setControllerMode, useControllerMode, useControllerModes } from "@/components/dashboard/controller-mode";
import { type Icon, Widget } from "@/components/dashboard/dashboard-widgets";
import { shedRule, useActiveModel, useNow } from "@/components/dashboard/device-automation";
import { DeviceRow } from "@/components/dashboard/device-row";
import { activeHighlight } from "@/components/dashboard/page-kit";
import { currentShedDevices, shedGroups, useShedEquipment } from "@/components/dashboard/shed-devices";

// Climate control for the rearing shed. The equipment is the shed device list set up under Settings → Shed
// (shed-devices.ts). The controls live on the Climate Control tab; other tabs show the equipment as status icons.

export const climateSystem = "Climate System";

export const climateModes: { value: ControllerMode; label: string; detail: string; icon: Icon }[] = [
  { value: "auto", label: "Automatic", detail: "Equipment follows the active shed model on its own", icon: Bot },
  { value: "semi", label: "Semi-automatic", detail: "Each device asks for a target value when you switch it on", icon: UserCog },
  { value: "manual", label: "Manual", detail: "Plain on/off for each device, no target asked", icon: Hand },
];

/** Switches the whole climate system's mode, and every shed device with it. */
export function setClimateMode(mode: ControllerMode) {
  setControllerMode(climateSystem, mode);
  currentShedDevices().forEach((item) => setControllerMode(item.name, mode));
}

// What Auto mode would do with each shed device right now, and why: the active shed model, kept inside the shed limits.
export function useClimate() {
  const { on, limits } = useClimateState();
  const equipment = useShedEquipment();
  const systemMode = useControllerMode(climateSystem);
  const modes = useControllerModes(equipment.map((item) => item.name));
  // The shed's mode is the devices' mode when they all agree, otherwise "mixed".
  const mode: ControllerMode | "mixed" = modes.length === 0 ? systemMode : modes.every((value) => value === modes[0]) ? modes[0] : "mixed";
  const model = useActiveModel("shed");
  const now = useNow();
  const plan = Object.fromEntries(equipment.map((item) => [item.name, shedRule(item.name, model.values, limits, now)]));
  const modeOf = (name: string): ControllerMode => modes[equipment.findIndex((item) => item.name === name)] ?? systemMode;
  // A device in Auto follows the plan; in Semi-auto or Manual it holds its saved state.
  const isOn = (name: string) => (modeOf(name) === "auto" ? plan[name]?.on : on[name]) ?? false;
  return { mode, modeOf, equipment, limits, plan, isOn, setOn: setClimateOn, setLimit: setClimateLimit };
}

// ---- Climate Control tab: the mode switch and the equipment ----

export function ClimateModeSwitch() {
  const { mode } = useClimate();
  return (
    <div role="radiogroup" aria-label="Climate control mode" className="grid gap-3 sm:grid-cols-3">
      {climateModes.map((item) => {
        const active = item.value === mode;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setClimateMode(item.value)}
            className={`group relative flex items-start gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-all ${
              active ? activeHighlight : "border-[var(--d-card-border)] bg-[var(--d-card)] hover:-translate-y-0.5 hover:shadow-md"
            }`}
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${active ? "bg-white/20" : "bg-[var(--d-accent-soft)] text-[var(--d-accent)]"}`}>
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className={`block text-base font-bold ${active ? "" : "text-[var(--d-text)]"}`}>{item.label}</span>
              <span className={`mt-0.5 block text-xs leading-5 ${active ? "text-white/80" : "text-[var(--d-muted)]"}`}>{item.detail}</span>
            </span>
            {active && (
              <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#fff] text-[var(--d-accent-deep)]">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ClimateEquipment() {
  const equipment = useShedEquipment();
  const groups = shedGroups.filter((group) => equipment.some((item) => item.group === group.group));

  if (!equipment.length)
    return (
      <div className="rounded-2xl border-2 border-dashed border-[var(--d-card-border)] p-8 text-center text-sm text-[var(--d-muted)]">
        No shed devices yet.{" "}
        <Link href="/dashboard/settings/?tab=shed" className="font-semibold text-[var(--d-accent)] hover:underline">
          Add them under Settings → Shed
        </Link>
      </div>
    );

  return (
    <div className="grid items-start gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {groups.map((group) => (
        <Widget key={group.group} title={group.group} icon={group.icon}>
          <div className="space-y-2.5">
            {equipment
              .filter((item) => item.group === group.group)
              .map((item) => (
                <DeviceRow key={item.id} name={item.name} icon={item.icon} spins={item.spins} />
              ))}
          </div>
        </Widget>
      ))}
      <Link
        href="/dashboard/settings/?tab=shed"
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--d-card-border)] p-4 text-sm font-semibold text-[var(--d-muted)] transition-colors hover:border-[var(--d-accent)] hover:text-[var(--d-accent)] md:col-span-2 2xl:col-span-4"
      >
        <Settings className="h-4 w-4" aria-hidden="true" /> Add or remove shed devices in Settings → Shed
      </Link>
    </div>
  );
}

// ---- Other tabs: status only, as icons ----

export function ClimateStatusIcons({ className }: { className?: string }) {
  const { mode, modeOf, equipment, isOn, plan } = useClimate();
  const current = climateModes.find((item) => item.value === mode) ?? { label: "Mixed", detail: "Devices use different modes", icon: SlidersHorizontal };
  const running = equipment.filter((item) => isOn(item.name)).length;

  return (
    <div className={`dash-card flex flex-wrap items-center gap-3 rounded-xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-3 ${className ?? ""}`}>
      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--d-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--d-accent)]" title={current.detail}>
        <current.icon className="h-3.5 w-3.5" aria-hidden="true" />
        Climate: {current.label}
      </span>
      <ul className="order-last flex basis-full flex-wrap items-center gap-1.5" aria-label={`${running} of ${equipment.length} shed devices running`}>
        {equipment.map((item) => {
          const on = isOn(item.name);
          const label = `${item.name}: ${on ? "on" : "off"}${modeOf(item.name) === "auto" ? ` · ${plan[item.name]?.reason}` : ""}`;
          return (
            <li key={item.id} title={label} aria-label={label} className={`relative flex h-9 w-9 items-center justify-center rounded-lg ${on ? "bg-gradient-to-br from-[var(--d-accent-bright)] to-[var(--d-accent-strong)] text-white shadow-sm" : "bg-[var(--d-chip)] text-[var(--d-muted)]"}`}>
              <item.icon className={`h-4 w-4 ${on && item.spins ? "motion-safe:animate-spin [animation-duration:2.4s]" : ""}`} aria-hidden="true" />
              {on && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--d-card)] bg-[var(--d-accent-bright)]" />}
            </li>
          );
        })}
      </ul>
      <span className="text-xs text-[var(--d-muted)]">
        {running} of {equipment.length} running
      </span>
      <Link href="/dashboard/climate" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--d-accent)] hover:underline">
        Climate Control <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
