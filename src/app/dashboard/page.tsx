"use client";

import { useState } from "react";
import { AlertTriangle, CloudDrizzle, DoorClosed, DoorOpen, Fan, Faucet, Heater, MapPin, Power, SlidersVertical, Sprout, Warehouse, Waves } from "lucide-react";

import { ModeSelector, useControllerMode } from "@/components/dashboard/controller-mode";
import { useDashboardTheme } from "@/components/dashboard/dashboard-theme";
import { type Icon, Toggle, Widget } from "@/components/dashboard/dashboard-widgets";
import { FertigationBoard } from "@/components/dashboard/fertigation-board";
import { type HistoryParam, HistoryProvider } from "@/components/dashboard/history-dialog";
import { TargetLine, useTargetedSwitch } from "@/components/dashboard/target-dialog";
import { ValveControl } from "@/components/dashboard/valve-control";
import { Co2Icon, HumidityIcon, LightSensorIcon, Nh3Icon, SoilEcIcon, SoilMoistureIcon, SoilPhIcon, SoilTemperatureIcon, TemperatureIcon, WaterLevelIcon } from "@/components/dashboard/sensor-icons";
import { actuators, alertItems, demoFarm, doorSensor, demoShed, sensorReadings } from "@/data/mock";

// Theme colors as CSS variables (see .dash-theme in globals.css); SVG and chart props use the palette instead.
const green = "var(--d-accent)";
const muted = "var(--d-muted)";
const amber = "var(--d-warn)";

type Setpoint = { key: string; label: string; unit: string; min: number; max: number; step: number; value: number; icon: Icon };

const farmSetpoints: Setpoint[] = [
  { key: "soil", label: "Soil Moisture", unit: "%", min: 20, max: 45, step: 1, value: 32, icon: SoilMoistureIcon },
  { key: "tank", label: "Tank Min.", unit: "%", min: 0, max: 100, step: 5, value: 30, icon: WaterLevelIcon },
];

const shedSetpoints: Setpoint[] = [
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

const shedDevices = ["Exhaust Fans", "Humidifier", "Heater"];

const formatCoordinate = (value: number, positive: string, negative: string) => `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;

const reading = (name: string) => sensorReadings.find((sensor) => sensor.name === name);

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

function historyFor(sensor: ReturnType<typeof reading>, label: string, icon: Icon): HistoryParam | undefined {
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

const soilReadings = [
  { sensor: reading("Soil Temperature"), label: "Soil Temp.", icon: SoilTemperatureIcon },
  { sensor: reading("Soil EC"), label: "Soil EC", icon: SoilEcIcon },
  { sensor: reading("Soil pH"), label: "Soil pH", icon: SoilPhIcon },
];

const airReadings = [
  { sensor: reading("NH3"), label: "NH₃ (Ammonia)", icon: Nh3Icon },
  { sensor: reading("CO2"), label: "CO₂", icon: Co2Icon },
  { sensor: reading("Light"), label: "Light", icon: LightSensorIcon },
];

const farmAlerts = alertItems.filter((alert) => !alert.location.startsWith("Shed"));
const shedAlerts = alertItems.filter((alert) => alert.location.startsWith("Shed"));

const severityColor: Record<string, string> = {
  Warning: amber,
  "Sensor Failure": "var(--d-danger)",
  Information: "var(--d-info)",
  "AI Recommendation": green,
};

function SectionHeader({ icon: Icon, title, detail }: { icon: Icon; title: string; detail: string }) {
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

function BigValue({ title, icon, value, unit, note, warn, history }: { title: string; icon: Icon; value: string | number; unit: string; note: string; warn?: boolean; history?: HistoryParam }) {
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

function ReadingTile({ sensor, label, icon }: { sensor: ReturnType<typeof reading>; label: string; icon: Icon }) {
  const warn = sensor?.status === "Warning";
  return (
    <Widget title={label} icon={icon} history={historyFor(sensor, label, icon)}>
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

// Door contact sensor: status only, no motor control.
function DoorTile() {
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

function SetpointPanel({ items, values, onChange, className }: { items: Setpoint[]; values: Record<string, number>; onChange: (key: string, value: number) => void; className?: string }) {
  return (
    <Widget title="Set Points" icon={SlidersVertical} className={className}>
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
    </Widget>
  );
}

function AlertList({ items, className }: { items: typeof alertItems; className?: string }) {
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

export default function DashboardHomePage() {
  const [setpoints, setSetpoints] = useState(() => Object.fromEntries([...farmSetpoints, ...shedSetpoints].map((item) => [item.key, item.value])));
  const [devices, setDevices] = useState(() => Object.fromEntries(actuators.map((item) => [item.id, item.status === "ON"])));

  const updateSetpoint = (key: string, value: number) => setSetpoints((current) => ({ ...current, [key]: value }));
  const deviceTiles = (names: string[]) =>
    actuators
      .filter((device) => names.includes(device.name))
      .map((device) => <DeviceTile key={device.id} name={device.name} on={devices[device.id]} onChange={() => setDevices((current) => ({ ...current, [device.id]: !current[device.id] }))} />);

  const tank = reading("Water Tank");
  const soil = reading("Soil Moisture");
  const temperature = reading("Temperature");
  const humidity = reading("Relative Humidity");
  const tankPct = tank ? tank.value : 0;
  const soilPct = soil ? soil.value : 0;
  const arc = Math.PI * 80;
  const { palette } = useDashboardTheme();

  return (
    <HistoryProvider>
      <div className="-m-4 min-h-[calc(100vh-65px)] bg-[var(--d-page)] p-4 text-[var(--d-text)] md:-m-6 md:p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--d-card-border)] bg-[var(--d-banner)] px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold text-[var(--d-text)]">{demoFarm.name}</h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--d-muted)]">
              <a
                href={`https://www.google.com/maps?q=${demoFarm.latitude},${demoFarm.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Google Maps"
                className="inline-flex items-center gap-1 font-semibold tabular-nums text-[var(--d-accent)] hover:underline"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {formatCoordinate(demoFarm.latitude, "N", "S")}, {formatCoordinate(demoFarm.longitude, "E", "W")}
              </a>
              <span>
                · {demoFarm.acres} acres · {demoShed.name} · {demoShed.instar}
              </span>
            </div>
          </div>
          <span className="rounded-full bg-[var(--d-warn-soft)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-warn)]">Demo / Simulated Data</span>
        </header>

        <div className="grid items-start gap-6 xl:grid-cols-2">
          <section aria-label="Shed monitoring">
            <SectionHeader icon={Warehouse} title="Shed Monitoring" detail={`Silkworm rearing · ${demoShed.name} · ${demoShed.instar}`} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                <BigValue
                  title="Temperature"
                  icon={TemperatureIcon}
                  history={historyFor(temperature, "Shed Temperature", TemperatureIcon)}
                  value={temperature?.value ?? "–"}
                  unit="°C"
                  note={temperature?.timestamp ?? ""}
                />
                <BigValue title="Humidity" icon={HumidityIcon} history={historyFor(humidity, "Shed Humidity", HumidityIcon)} value={humidity?.value ?? "–"} unit="%" note={humidity?.timestamp ?? ""} />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:col-span-2 sm:grid-cols-4">
                {airReadings.map((item) => (
                  <ReadingTile key={item.label} {...item} />
                ))}
                <DoorTile />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:col-span-2 sm:grid-cols-3">{deviceTiles(shedDevices)}</div>

              <SetpointPanel items={shedSetpoints} values={setpoints} onChange={updateSetpoint} className="sm:col-span-2" />
              <AlertList items={shedAlerts} className="sm:col-span-2" />
            </div>
          </section>

          <section aria-label="Farm monitoring">
            <SectionHeader icon={Sprout} title="Farm Monitoring" detail={`Mulberry field · ${soil?.location ?? "Block A"} · ${demoFarm.acres} acres`} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Widget title="Water Tank 01" icon={WaterLevelIcon} history={historyFor(tank, "Water Tank 01", WaterLevelIcon)}>
                <div className="flex flex-1 flex-col items-center justify-center">
                  <svg viewBox="0 0 200 118" className="w-full max-w-[260px]" role="img" aria-label={`Water tank level ${tankPct}%`}>
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={palette.track} strokeWidth="34" />
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={palette.accent} strokeWidth="34" strokeDasharray={`${(tankPct / 100) * arc} ${arc}`} />
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

              <Widget title="Soil Moisture" icon={SoilMoistureIcon} history={historyFor(soil, "Soil Moisture", SoilMoistureIcon)}>
                <div className="flex flex-1 flex-col items-center justify-center">
                  <svg viewBox="0 0 150 150" className="w-full max-w-[170px]" role="img" aria-label={`Soil moisture ${soilPct}%`}>
                    <defs>
                      <clipPath id="soilCircle">
                        <circle cx="75" cy="75" r="70" />
                      </clipPath>
                    </defs>
                    <circle cx="75" cy="75" r="70" fill={palette.track} />
                    <rect x="0" y={145 - (soilPct / 100) * 140} width="150" height="150" fill={palette.accent} clipPath="url(#soilCircle)" />
                    <text x="75" y="86" textAnchor="middle" fill={palette.text} fontSize="34" fontWeight="700">
                      {soilPct}
                    </text>
                  </svg>
                  <div className="mt-2 text-xs text-[var(--d-muted)]">
                    % · {soil?.location} · {soil?.timestamp}
                  </div>
                </div>
              </Widget>

              <div className="grid grid-cols-3 gap-4 sm:col-span-2">
                {soilReadings.map((item) => (
                  <ReadingTile key={item.label} {...item} />
                ))}
              </div>

              <FertigationBoard className="sm:col-span-2" />
              <ValveControl className="sm:col-span-2" />

              <SetpointPanel items={farmSetpoints} values={setpoints} onChange={updateSetpoint} className="sm:col-span-2" />
              <AlertList items={farmAlerts} className="sm:col-span-2" />
            </div>
          </section>
        </div>
      </div>
    </HistoryProvider>
  );
}

const modeNote = { auto: "Run by automation", semi: "Suggests, you approve", manual: "Asks for a target when turned on" };

function DeviceTile({ name, on, onChange }: { name: string; on: boolean; onChange: () => void }) {
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
