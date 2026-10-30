"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, CloudDrizzle, DoorClosed, DoorOpen, Fan, Faucet, Heater, Minus, Plus, Power, SlidersVertical, Waves, X } from "lucide-react";

import { ModeSelector, useControllerMode } from "@/components/dashboard/controller-mode";
import { useDashboardTheme } from "@/components/dashboard/dashboard-theme";
import { type Icon, Toggle, Widget } from "@/components/dashboard/dashboard-widgets";
import { type HistoryParam } from "@/components/dashboard/history-dialog";
import { TargetLine, useTargetedSwitch } from "@/components/dashboard/target-dialog";
import { HumidityIcon, Co2Icon, LightSensorIcon, Nh3Icon, SoilEcIcon, SoilMoistureIcon, SoilPhIcon, SoilTemperatureIcon, TemperatureIcon, WaterLevelIcon } from "@/components/dashboard/sensor-icons";
import { alertItems, doorSensor, sensorReadings } from "@/data/mock";

// Monitoring widgets shared by the Overview and the Farm Monitor tab. Colors come from the .dash-theme tokens in globals.css.

// Normal-state colour: the box's section tint when it has one, else the accent green.
export const green = "var(--d-tint, var(--d-accent))";
export const muted = "var(--d-muted)";
export const amber = "var(--d-warn)";

export type Setpoint = { key: string; label: string; unit: string; min: number; max: number; step: number; value: number; icon: Icon; note?: string };

export const farmSetpoints: Setpoint[] = [
  { key: "soil", label: "Soil Moisture", unit: "%", min: 20, max: 45, step: 1, value: 32, icon: SoilMoistureIcon, note: "Irrigation starts when soil moisture drops below this." },
  { key: "tank", label: "Tank Min.", unit: "%", min: 0, max: 100, step: 5, value: 30, icon: WaterLevelIcon, note: "The pump stops when the tank falls below this level." },
  { key: "soilTemp", label: "Soil Temp. Max", unit: "°C", min: 20, max: 40, step: 0.5, value: 32, icon: SoilTemperatureIcon, note: "An alert is raised when soil temperature rises above this." },
  { key: "soilEc", label: "Soil EC Target", unit: "mS/cm", min: 0.2, max: 2, step: 0.05, value: 1, icon: SoilEcIcon, note: "Fertigation doses toward this conductivity." },
  { key: "soilPh", label: "Soil pH Target", unit: "pH", min: 5, max: 8, step: 0.1, value: 6.5, icon: SoilPhIcon, note: "An alert is raised when the root zone drifts away from this pH." },
];

/** A set point wired to a sensor card: the chip in its header opens a popup to change it. */
export type SetpointBinding = { item: Setpoint; value: number; onChange: (value: number) => void };

const decimalsOf = (step: number) => (String(step).split(".")[1] ?? "").length;

// Popup body, mounted only while open so it starts from the saved value each time.
function SetpointForm({ binding, current, onDone }: { binding: SetpointBinding; current?: number; onDone: () => void }) {
  const { item } = binding;
  const decimals = decimalsOf(item.step);
  const [raw, setRaw] = useState(String(binding.value));
  const value = Number(raw);
  const valid = raw.trim() !== "" && Number.isFinite(value) && value >= item.min && value <= item.max;
  const nudge = (direction: 1 | -1) => {
    const base = Number.isFinite(value) ? value : binding.value;
    setRaw((Math.min(item.max, Math.max(item.min, base + direction * item.step))).toFixed(decimals));
  };

  return (
    <>
      <Dialog.Overlay className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-[2px]" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[66] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!valid) return;
            binding.onChange(Number(value.toFixed(decimals)));
            onDone();
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--d-accent-soft)]">
                <item.icon className="h-4 w-4" style={{ color: green }} aria-hidden="true" />
              </span>
              <div>
                <Dialog.Title className="text-lg font-semibold leading-tight">{item.label} set point</Dialog.Title>
                <Dialog.Description className="mt-1 text-xs text-[var(--d-muted)]">{item.note ?? "The value automation works to."}</Dialog.Description>
              </div>
            </div>
            <Dialog.Close aria-label="Cancel" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-4 rounded-xl bg-[var(--d-card)] p-4">
            <div className="flex items-center justify-between text-xs text-[var(--d-muted)]">
              <label htmlFor={`setpoint-${item.key}`}>Set point</label>
              {current !== undefined && (
                <span>
                  Now{" "}
                  <span className="font-semibold tabular-nums text-[var(--d-text)]">
                    {current} {item.unit}
                  </span>
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <button type="button" onClick={() => nudge(-1)} aria-label="Decrease" className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--d-chip)] hover:bg-[var(--d-chip-hover)]">
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex items-baseline gap-1.5">
                <input
                  id={`setpoint-${item.key}`}
                  type="number"
                  inputMode="decimal"
                  autoFocus
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={raw}
                  onChange={(event) => setRaw(event.target.value)}
                  aria-invalid={!valid}
                  className="w-24 rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] px-2 py-2 text-center text-2xl font-bold tabular-nums text-[var(--d-accent)] outline-none focus:border-[var(--d-accent)]"
                />
                <span className="text-sm font-semibold text-[var(--d-muted)]">{item.unit}</span>
              </div>
              <button type="button" onClick={() => nudge(1)} aria-label="Increase" className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--d-chip)] hover:bg-[var(--d-chip-hover)]">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <input
              type="range"
              aria-label={`${item.label} set point slider`}
              min={item.min}
              max={item.max}
              step={item.step}
              value={valid ? value : binding.value}
              onChange={(event) => setRaw(Number(event.target.value).toFixed(decimals))}
              className="mt-4 w-full cursor-pointer accent-[var(--d-accent)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--d-muted)]">
              <span>
                {item.min} {item.unit}
              </span>
              <span>
                {item.max} {item.unit}
              </span>
            </div>
            {!valid && <div className="mt-2 text-center text-[11px] font-semibold text-[var(--d-danger)]">Enter a value from {item.min} to {item.max} {item.unit}</div>}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close className="rounded-lg bg-[var(--d-chip)] px-4 py-2 text-sm font-medium hover:bg-[var(--d-chip-hover)]">Cancel</Dialog.Close>
            <button type="submit" disabled={!valid} className="rounded-lg accent-fill px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              Save set point
            </button>
          </div>
        </form>
      </Dialog.Content>
    </>
  );
}

// Header chip on a sensor card showing its set point; opens the set point popup.
export function SetpointChip({ binding, current }: { binding: SetpointBinding; current?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        title={`${binding.item.label} set point · change`}
        className="inline-flex items-center gap-1 rounded-full bg-[var(--d-accent-soft)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--d-accent)] transition-colors hover:accent-fill"
      >
        <SlidersVertical className="h-3 w-3" aria-hidden="true" />
        {binding.value}
        <span className="font-medium opacity-80">{binding.item.unit}</span>
        <span className="sr-only">{binding.item.label} set point, change</span>
      </Dialog.Trigger>
      {open && <SetpointForm binding={binding} current={current} onDone={() => setOpen(false)} />}
    </Dialog.Root>
  );
}

export const shedSetpoints: Setpoint[] = [
  { key: "temp", label: "Max Temp.", unit: "°C", min: 20, max: 35, step: 0.5, value: 28, icon: TemperatureIcon },
  { key: "rh", label: "Max Humidity", unit: "%", min: 50, max: 95, step: 1, value: 80, icon: HumidityIcon },
  { key: "nh3", label: "NH₃ Limit", unit: "ppm", min: 0, max: 10, step: 0.5, value: 5, icon: Nh3Icon },
  { key: "co2", label: "CO₂ Limit", unit: "ppm", min: 400, max: 1500, step: 50, value: 1000, icon: Co2Icon },
  { key: "light", label: "Light", unit: "Lux", min: 0, max: 50, step: 1, value: 18, icon: LightSensorIcon },
];

const deviceIcons: Record<string, Icon> = {
  "Water Pump": Waves,
  "Solenoid Valve": Faucet,
  "Exhaust Fans": Fan,
  Humidifier: CloudDrizzle,
  Heater: Heater,
};

export const shedDevices = ["Exhaust Fans", "Humidifier", "Heater"];

export const formatCoordinate = (value: number, positive: string, negative: string) => `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;

export const reading = (name: string) => sensorReadings.find((sensor) => sensor.name === name);

// How each reading behaves in its demo history: day/night swing, random wander, limits and target band.
const historySpec: Record<string, Pick<HistoryParam, "swing" | "noise" | "floor" | "ceil" | "target">> = {
  "Water Tank": { noise: 3, floor: 0, ceil: 100, target: [30, 100] },
  "Soil Moisture": { swing: -2, noise: 1, floor: 0, ceil: 100, target: [20, 45] },
  "Soil Temperature": { swing: 3, noise: 0.4, target: [20, 32] },
  "Soil EC": { noise: 0.04, floor: 0, target: [0.6, 1.2] },
  "Soil pH": { noise: 0.06, floor: 0, ceil: 14, target: [6, 7.5] },
  Temperature: { swing: 2.5, noise: 0.4, target: [23, 28] },
  "Relative Humidity": { swing: -6, noise: 1.5, floor: 0, ceil: 100, target: [70, 85] },
  NH3: { swing: 0.6, noise: 0.4, floor: 0, target: [0, 5] },
  CO2: { swing: 60, noise: 40, floor: 350, target: [400, 1000] },
  Light: { swing: 4, noise: 1, floor: 0, target: [10, 30] },
};

export function historyFor(sensor: ReturnType<typeof reading>, label: string, icon: Icon): HistoryParam | undefined {
  if (!sensor) return undefined;
  return {
    key: sensor.id,
    label,
    unit: sensor.unit,
    value: sensor.value,
    decimals: (String(sensor.value).split(".")[1] ?? "").length,
    icon,
    ...(historySpec[sensor.name] ?? { noise: 1 }),
  };
}

export const soilReadings = [
  { sensor: reading("Soil Temperature"), label: "Soil Temp.", icon: SoilTemperatureIcon, setpointKey: "soilTemp" },
  { sensor: reading("Soil EC"), label: "Soil EC", icon: SoilEcIcon, setpointKey: "soilEc" },
  { sensor: reading("Soil pH"), label: "Soil pH", icon: SoilPhIcon, setpointKey: "soilPh" },
];

export const farmAlerts = alertItems.filter((alert) => !alert.location.startsWith("Shed"));
export const shedAlerts = alertItems.filter((alert) => alert.location.startsWith("Shed"));

const severityColor: Record<string, string> = {
  Warning: amber,
  "Sensor Failure": "var(--d-danger)",
  Information: "var(--d-info)",
  "AI Recommendation": "var(--d-accent)",
};

export function SectionHeader({ icon: Icon, title, detail }: { icon: Icon; title: string; detail: string }) {
  return (
    <div className="mb-4 flex items-center gap-3 border-b border-[var(--d-line)] pb-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--d-accent-soft)" }}>
        <Icon className="h-5 w-5" style={{ color: green }} aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-base font-semibold text-[var(--d-text)]">{title}</h2>
        <div className="text-xs text-[var(--d-muted)]">{detail}</div>
      </div>
    </div>
  );
}

export function BigValue({ title, icon, value, unit, note, warn, history }: { title: string; icon: Icon; value: string | number; unit: string; note: string; warn?: boolean; history?: HistoryParam }) {
  return (
    <Widget title={title} icon={icon} history={history}>
      <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
        <div className="text-xs text-[var(--d-muted)]">Last value:</div>
        <div className="mt-3 text-4xl font-bold" style={{ color: warn ? amber : green }}>
          {value}
          <span className="ml-1 text-2xl">{unit}</span>
        </div>
        <div className="mt-3 text-xs text-[var(--d-muted)]">{note}</div>
      </div>
    </Widget>
  );
}

export function ReadingTile({ sensor, label, icon, setpoint }: { sensor: ReturnType<typeof reading>; label: string; icon: Icon; setpoint?: SetpointBinding }) {
  const warn = sensor?.status === "Warning";
  return (
    <Widget title={label} icon={icon} history={historyFor(sensor, label, icon)} action={setpoint && <SetpointChip binding={setpoint} current={sensor?.value} />}>
      <div className="flex flex-1 flex-col items-center justify-center py-3 text-center">
        <div className="text-2xl font-bold sm:text-3xl" style={{ color: warn ? amber : green }}>
          {sensor?.value}
        </div>
        <div className="mt-1 text-xs text-[var(--d-muted)]">{sensor?.unit}</div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.15em]" style={{ color: warn ? amber : muted }}>
          {sensor?.status}
        </div>
      </div>
    </Widget>
  );
}

export function WaterTankGauge({ className, setpoint }: { className?: string; setpoint?: SetpointBinding }) {
  const { palette } = useDashboardTheme();
  const tank = reading("Water Tank");
  const tankPct = tank ? tank.value : 0;
  const arc = Math.PI * 80;
  return (
    <Widget title="Water Tank 01" icon={WaterLevelIcon} history={historyFor(tank, "Water Tank 01", WaterLevelIcon)} className={className} action={setpoint && <SetpointChip binding={setpoint} current={tank?.value} />}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <svg viewBox="0 0 200 118" className="w-full max-w-[260px]" role="img" aria-label={`Water tank level ${tankPct}%`}>
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={palette.track} strokeWidth="34" />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" style={{ stroke: `var(--d-tint, ${palette.accent})` }} strokeWidth="34" strokeDasharray={`${(tankPct / 100) * arc} ${arc}`} />
          <text x="100" y="98" textAnchor="middle" fill={palette.text} fontSize="22" fontWeight="600">
            {tankPct.toFixed(2)}
          </text>
          <text x="20" y="116" textAnchor="middle" fill={palette.muted} fontSize="8">
            0
          </text>
          <text x="180" y="116" textAnchor="middle" fill={palette.muted} fontSize="8">
            100
          </text>
        </svg>
        <div className="mt-2 text-xs text-[var(--d-muted)]">
          {tank?.location} · {tank?.timestamp}
        </div>
      </div>
    </Widget>
  );
}

export function SoilMoistureGauge({ className, setpoint }: { className?: string; setpoint?: SetpointBinding }) {
  const { palette } = useDashboardTheme();
  const soil = reading("Soil Moisture");
  const soilPct = soil ? soil.value : 0;
  return (
    <Widget title="Soil Moisture" icon={SoilMoistureIcon} history={historyFor(soil, "Soil Moisture", SoilMoistureIcon)} className={className} action={setpoint && <SetpointChip binding={setpoint} current={soil?.value} />}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <svg viewBox="0 0 150 150" className="w-full max-w-[170px]" role="img" aria-label={`Soil moisture ${soilPct}%`}>
          <defs>
            <clipPath id="soilCircle">
              <circle cx="75" cy="75" r="70" />
            </clipPath>
          </defs>
          <circle cx="75" cy="75" r="70" fill={palette.track} />
          <rect x="0" y={145 - (soilPct / 100) * 140} width="150" height="150" style={{ fill: `var(--d-tint, ${palette.accent})` }} clipPath="url(#soilCircle)" />
          <text x="75" y="86" textAnchor="middle" fill={palette.text} fontSize="34" fontWeight="700">
            {soilPct}
          </text>
        </svg>
        <div className="mt-2 text-xs text-[var(--d-muted)]">
          % · {soil?.location} · {soil?.timestamp}
        </div>
      </div>
    </Widget>
  );
}

export function SetpointPanel({ items, values, onChange, className, embedded }: { items: Setpoint[]; values: Record<string, number>; onChange: (key: string, value: number) => void; className?: string; embedded?: boolean }) {
  const body = (
    <>
      <div className="flex flex-1 flex-wrap justify-around gap-x-2 gap-y-5 pt-2">
        {items.map((item) => (
          <div key={item.key} className="flex w-20 flex-col items-center">
            <item.icon className="mb-1 h-4 w-4 text-[var(--d-muted)]" aria-hidden="true" />
            <div className="h-8 text-center text-xs font-semibold leading-4 text-[var(--d-text)]">{item.label}</div>
            <div className="mt-2 flex items-stretch gap-2">
              <div className="flex w-10 flex-col justify-center text-right text-sm font-semibold" style={{ color: green }}>
                {values[item.key]}
              </div>
              <input
                type="range"
                aria-label={`${item.label} set point (${item.unit})`}
                min={item.min}
                max={item.max}
                step={item.step}
                value={values[item.key]}
                onChange={(event) => onChange(item.key, Number(event.target.value))}
                className="h-28 w-5 cursor-pointer accent-[var(--d-accent)] [direction:rtl] [writing-mode:vertical-lr]"
              />
              <div className="flex w-8 flex-col justify-between text-[10px] text-[var(--d-muted)]">
                <span>{item.max}</span>
                <span>{item.min}</span>
              </div>
            </div>
            <div className="mt-1 text-[10px] text-[var(--d-muted)]">{item.unit}</div>
          </div>
        ))}
      </div>
    </>
  );
  return embedded ? body : (
    <Widget title="Set Points" icon={SlidersVertical} className={className}>
      {body}
    </Widget>
  );
}

export function AlertList({ items, className }: { items: typeof alertItems; className?: string }) {
  return (
    <Widget title="Alerts" icon={AlertTriangle} className={className}>
      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-6 text-xs text-[var(--d-muted)]">No open alerts</div>
      ) : (
        <div className="space-y-3">
          {items.map((alert) => (
            <div key={alert.id} className="rounded-md bg-[var(--d-inset)] p-3" style={{ borderLeft: `3px solid ${severityColor[alert.severity] ?? muted}` }}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: severityColor[alert.severity] ?? muted }}>
                  {alert.severity}
                </div>
                <div className="text-[10px] text-[var(--d-muted)]">
                  {alert.timestamp} · {alert.location}
                </div>
              </div>
              <div className="mt-1 text-sm font-semibold text-[var(--d-text)]">
                {alert.parameter}: {alert.value}
              </div>
              <div className="mt-1 text-xs leading-5 text-[var(--d-soft)]">{alert.recommendedAction}</div>
            </div>
          ))}
        </div>
      )}
    </Widget>
  );
}

const modeNote = { auto: "Run by automation", semi: "Suggests, you approve", manual: "Asks for a target when turned on" };

export function DeviceTile({ name, on, onChange }: { name: string; on: boolean; onChange: () => void }) {
  const Icon = deviceIcons[name] ?? Power;
  const mode = useControllerMode(name);
  const { onToggle, target, editTarget, dialog } = useTargetedSwitch(name, on, onChange);
  return (
    <Widget title={name} icon={Icon}>
      {dialog}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-3">
        <ModeSelector name={name} />
        <Toggle on={on} onChange={onToggle} label={`${name} power`} disabled={mode === "auto"} />
        <div className="text-center">
          <div className="text-xs font-semibold" style={{ color: on ? green : muted }}>
            {on ? "ON" : "OFF"}
          </div>
          {target ? <TargetLine target={target} onEdit={editTarget} /> : <div className="mt-0.5 text-[10px] text-[var(--d-muted)]">{modeNote[mode]}</div>}
        </div>
      </div>
    </Widget>
  );
}

// Door contact sensor: status only, no motor control.
export function DoorTile() {
  const open = doorSensor.state === "Open";
  const DoorIcon = open ? DoorOpen : DoorClosed;
  return (
    <Widget title="Door" icon={DoorIcon}>
      <div className="flex flex-1 flex-col items-center justify-center py-3 text-center">
        <div className="text-2xl font-bold sm:text-3xl" style={{ color: open ? amber : green }}>
          {doorSensor.state}
        </div>
        <div className="mt-1 text-xs text-[var(--d-muted)]">since {doorSensor.since}</div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[var(--d-muted)]">Opened {doorSensor.openedToday}× today</div>
      </div>
    </Widget>
  );
}
