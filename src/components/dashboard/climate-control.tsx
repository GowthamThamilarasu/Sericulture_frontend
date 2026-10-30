"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Bot, Check, ChevronRight, CloudDrizzle, Fan, Hand, Heater, Snowflake, UserCog, Wind, X } from "lucide-react";

import { type ControllerMode, setControllerMode, useControllerMode } from "@/components/dashboard/controller-mode";
import { type Icon, Toggle, Widget } from "@/components/dashboard/dashboard-widgets";
import { reading, shedSetpoints } from "@/components/dashboard/monitor-widgets";
import { Pill, activeHighlight, buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";

// Climate control for the rearing shed. The controls live on the Climate Control tab only;
// other tabs show the equipment as status icons (ClimateStatusIcons).

export const climateSystem = "Climate System";

export const climateEquipment: { name: string; group: "Ventilation" | "Humidity" | "Temperature"; icon: Icon; spins?: boolean }[] = [
  { name: "Fan Stage 1", group: "Ventilation", icon: Fan, spins: true },
  { name: "Fan Stage 2", group: "Ventilation", icon: Fan, spins: true },
  { name: "Circulation Fan", group: "Ventilation", icon: Wind, spins: true },
  { name: "Fogger", group: "Humidity", icon: CloudDrizzle },
  { name: "Humidifier", group: "Humidity", icon: CloudDrizzle },
  { name: "Heater", group: "Temperature", icon: Heater },
  { name: "Cooling", group: "Temperature", icon: Snowflake },
];
export const climateGroups = [
  { group: "Ventilation", icon: Wind },
  { group: "Humidity", icon: CloudDrizzle },
  { group: "Temperature", icon: Heater },
] as const;

export const climateModes: { value: ControllerMode; label: string; detail: string; icon: Icon }[] = [
  { value: "auto", label: "Automatic", detail: "Equipment follows the readings and limits on its own", icon: Bot },
  { value: "semi", label: "Semi-automatic", detail: "The system suggests changes, you approve them", icon: UserCog },
  { value: "manual", label: "Manual", detail: "You switch each device on and off", icon: Hand },
];

// ---- Saved state: device on/off and the shed limits, shared by every tab ----

type ClimateState = { on: Record<string, boolean>; limits: Record<string, number> };
const storageKey = "climate-control";
const defaultState: ClimateState = {
  on: { "Fan Stage 1": true, "Fan Stage 2": false, "Circulation Fan": true, Fogger: false, Humidifier: false, Heater: false, Cooling: false },
  limits: Object.fromEntries(shedSetpoints.map((item) => [item.key, item.value])),
};
const listeners = new Set<() => void>();
let state: ClimateState | null = null;

function read(): ClimateState {
  if (state) return state;
  state = defaultState;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as Partial<ClimateState> | null;
    if (saved) state = { on: { ...defaultState.on, ...saved.on }, limits: { ...defaultState.limits, ...saved.limits } };
  } catch {
    // Storage blocked or unreadable: keep the defaults.
  }
  return state;
}

function write(next: ClimateState) {
  state = next;
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // Storage blocked: the change still applies until the page reloads.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Switches the whole climate system's mode, and every climate device with it. */
export function setClimateMode(mode: ControllerMode) {
  setControllerMode(climateSystem, mode);
  climateEquipment.forEach((item) => setControllerMode(item.name, mode));
}

// What automatic control would do right now, and why.
function automaticPlan(limits: Record<string, number>) {
  const temp = reading("Temperature")?.value ?? 0;
  const rh = reading("Relative Humidity")?.value ?? 0;
  const nh3 = reading("NH3")?.value ?? 0;
  const co2 = reading("CO2")?.value ?? 0;
  const maxTemp = limits.temp ?? 28;
  const maxRh = limits.rh ?? 80;
  const nh3Limit = limits.nh3 ?? 5;
  const co2Limit = limits.co2 ?? 1000;
  const airBad = nh3 > nh3Limit * 0.7 || co2 > co2Limit * 0.85;

  const plan: Record<string, { on: boolean; reason: string }> = {
    "Fan Stage 1": airBad || temp > maxTemp || rh > maxRh ? { on: true, reason: nh3 > nh3Limit * 0.7 ? `NH₃ ${nh3} ppm is near the ${nh3Limit} ppm limit` : co2 > co2Limit * 0.85 ? `CO₂ ${co2} ppm is near its limit` : temp > maxTemp ? `Temperature above ${maxTemp} °C` : `Humidity above ${maxRh}%` } : { on: false, reason: "Air quality and temperature are fine" },
    "Fan Stage 2": nh3 > nh3Limit || co2 > co2Limit || temp > maxTemp + 1 ? { on: true, reason: "Readings past their limits: full ventilation" } : { on: false, reason: "Only needed when readings pass their limits" },
    "Circulation Fan": { on: true, reason: "Keeps air moving over the beds during rearing" },
    Fogger: rh < maxRh - 20 ? { on: true, reason: `Humidity ${rh}% is well below target` } : { on: false, reason: `Humidity ${rh}% is high enough` },
    Humidifier: rh < maxRh - 12 ? { on: true, reason: `Humidity ${rh}% is below target` } : { on: false, reason: `Humidity ${rh}% is within target` },
    Heater: temp < maxTemp - 4 ? { on: true, reason: `Temperature ${temp} °C is below ${maxTemp - 4} °C` } : { on: false, reason: `Temperature ${temp} °C is warm enough` },
    Cooling: temp > maxTemp + 1 ? { on: true, reason: `Temperature ${temp} °C is above ${maxTemp + 1} °C` } : { on: false, reason: `Temperature ${temp} °C is below ${maxTemp} °C` },
  };
  return plan;
}

export function useClimate() {
  const { on, limits } = useSyncExternalStore(subscribe, read, () => defaultState);
  const mode = useControllerMode(climateSystem);
  const plan = automaticPlan(limits);
  // In automatic mode the equipment follows the plan; otherwise it holds the saved state.
  const isOn = (name: string) => (mode === "auto" ? plan[name]?.on : on[name]) ?? false;
  const suggestions = mode === "semi" ? climateEquipment.filter((item) => (plan[item.name]?.on ?? false) !== (on[item.name] ?? false)) : [];
  return {
    mode,
    limits,
    plan,
    isOn,
    suggestions,
    setOn: (name: string, value: boolean) => write({ ...read(), on: { ...read().on, [name]: value } }),
    setLimit: (key: string, value: number) => write({ ...read(), limits: { ...read().limits, [key]: value } }),
  };
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
              <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0f5c2e]">
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
  const { mode, plan, isOn, setOn, suggestions } = useClimate();

  return (
    <div className="space-y-4">
      {mode === "semi" && (
        <Widget title="Suggested changes" icon={UserCog} action={<Pill tone={suggestions.length ? "warn" : "accent"}>{suggestions.length ? `${suggestions.length} to review` : "Nothing to approve"}</Pill>}>
          {suggestions.length === 0 ? (
            <p className="text-sm text-[var(--d-soft)]">The equipment already matches what automatic control would do.</p>
          ) : (
            <div className="space-y-2">
              {suggestions.map((item) => {
                const next = plan[item.name];
                return (
                  <div key={item.name} className="flex flex-wrap items-center gap-3 rounded-xl bg-[var(--d-inset)] p-3">
                    <item.icon className="h-5 w-5 shrink-0 text-[var(--d-accent)]" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[var(--d-text)]">
                        Turn {item.name} {next.on ? "on" : "off"}
                      </div>
                      <div className="text-xs text-[var(--d-muted)]">{next.reason}</div>
                    </div>
                    <button type="button" onClick={() => setOn(item.name, next.on)} className={buttonPrimary}>
                      <Check className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                    </button>
                    <button type="button" onClick={() => setOn(item.name, !next.on)} className={buttonSecondary} title="Keep it as it is">
                      <X className="h-3.5 w-3.5" aria-hidden="true" /> Keep
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Widget>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-3">
        {climateGroups.map((group) => (
          <Widget key={group.group} title={group.group} icon={group.icon}>
            <div className="space-y-2.5">
              {climateEquipment
                .filter((item) => item.group === group.group)
                .map((item) => {
                  const on = isOn(item.name);
                  return (
                    <div key={item.name} className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${on ? "border-[var(--d-card-border)] bg-[var(--d-accent-soft)]" : "border-[var(--d-line)] bg-[var(--d-inset)]"}`}>
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${on ? "bg-gradient-to-br from-[#6fe07f] to-[#00a218] text-white" : "bg-[var(--d-chip)] text-[var(--d-muted)]"}`}>
                        <item.icon className={`h-5 w-5 ${on && item.spins ? "motion-safe:animate-spin [animation-duration:2.4s]" : ""}`} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[var(--d-text)]">{item.name}</div>
                        <div className="truncate text-[11px] text-[var(--d-muted)]" title={mode === "auto" ? plan[item.name]?.reason : undefined}>
                          {mode === "auto" ? plan[item.name]?.reason : on ? "Running" : "Off"}
                        </div>
                      </div>
                      {mode === "manual" ? (
                        <Toggle size="sm" on={on} onChange={() => setOn(item.name, !on)} label={`${item.name} power`} />
                      ) : (
                        <Pill tone={on ? "accent" : "muted"}>{on ? "On" : "Off"}</Pill>
                      )}
                    </div>
                  );
                })}
            </div>
          </Widget>
        ))}
      </div>
    </div>
  );
}

// ---- Other tabs: status only, as icons ----

export function ClimateStatusIcons({ className }: { className?: string }) {
  const { mode, isOn, plan } = useClimate();
  const current = climateModes.find((item) => item.value === mode) ?? climateModes[0];
  const running = climateEquipment.filter((item) => isOn(item.name)).length;

  return (
    <div className={`dash-card flex flex-wrap items-center gap-3 rounded-xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-3 ${className ?? ""}`}>
      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--d-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--d-accent)]" title={current.detail}>
        <current.icon className="h-3.5 w-3.5" aria-hidden="true" />
        Climate: {current.label}
      </span>
      <ul className="flex flex-1 flex-wrap items-center gap-1.5" aria-label={`${running} of ${climateEquipment.length} climate devices running`}>
        {climateEquipment.map((item) => {
          const on = isOn(item.name);
          const label = `${item.name}: ${on ? "on" : "off"}${mode === "auto" ? ` · ${plan[item.name]?.reason}` : ""}`;
          return (
            <li key={item.name} title={label} aria-label={label} className={`relative flex h-9 w-9 items-center justify-center rounded-lg ${on ? "bg-gradient-to-br from-[#6fe07f] to-[#00a218] text-white shadow-sm" : "bg-[var(--d-chip)] text-[var(--d-muted)]"}`}>
              <item.icon className={`h-4 w-4 ${on && item.spins ? "motion-safe:animate-spin [animation-duration:2.4s]" : ""}`} aria-hidden="true" />
              {on && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--d-card)] bg-[#6fe07f]" />}
            </li>
          );
        })}
      </ul>
      <span className="text-xs text-[var(--d-muted)]">
        {running} of {climateEquipment.length} running
      </span>
      <Link href="/dashboard/climate" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--d-accent)] hover:underline">
        Climate Control <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
