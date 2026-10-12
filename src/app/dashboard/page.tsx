"use client";

import { useState } from "react";
import { AlertTriangle, Cloud, Droplets, Fan, Flame, MapPin, Power, Sun, Waves, Wind } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { actuators, alertItems, demoFarm, demoShed, sensorReadings, temperatureHistory } from "@/data/mock";

const green = "#3fbf5f";
const muted = "#9aa09c";

const humidityDemo = [76, 75, 74, 72, 71, 73, 73];
const climateHistory = temperatureHistory.map((point, index) => ({
  time: point.time,
  temperature: point.value,
  humidity: humidityDemo[index],
}));

const setpointDefaults = [
  { key: "soil", label: "Soil Moisture", unit: "%", min: 20, max: 45, step: 1, value: 32 },
  { key: "temp", label: "Max Temp.", unit: "°C", min: 20, max: 35, step: 0.5, value: 28 },
  { key: "rh", label: "Max Humidity", unit: "%", min: 50, max: 95, step: 1, value: 80 },
  { key: "nh3", label: "NH₃ Limit", unit: "ppm", min: 0, max: 10, step: 0.5, value: 5 },
  { key: "co2", label: "CO₂ Limit", unit: "ppm", min: 400, max: 1500, step: 50, value: 1000 },
  { key: "light", label: "Light", unit: "Lux", min: 0, max: 50, step: 1, value: 18 },
  { key: "tank", label: "Tank Min.", unit: "%", min: 0, max: 100, step: 5, value: 30 },
];

const deviceIcons: Record<string, typeof Power> = {
  "Water Pump": Droplets,
  "Solenoid Valve": Waves,
  "Exhaust Fans": Fan,
  Humidifier: Wind,
  Heater: Flame,
};

const reading = (name: string) => sensorReadings.find((sensor) => sensor.name === name);

const quickReadings = [
  { sensor: reading("NH3"), label: "NH₃", icon: Wind },
  { sensor: reading("CO2"), label: "CO₂", icon: Cloud },
  { sensor: reading("Light"), label: "Light", icon: Sun },
];

const severityColor: Record<string, string> = {
  Warning: "#f5b942",
  "Sensor Failure": "#ef5a5a",
  Information: "#7fb4ff",
  "AI Recommendation": green,
};

function Widget({ title, action, className, children }: { title: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={`flex flex-col overflow-hidden rounded-lg bg-[#232524] ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
        <h2 className="text-[15px] font-semibold text-white">{title}</h2>
        {action}
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4">{children}</div>
    </section>
  );
}

function BigValue({ title, value, unit, note, warn }: { title: string; value: string | number; unit: string; note: string; warn?: boolean }) {
  return (
    <Widget title={title}>
      <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
        <div className="text-xs text-[#9aa09c]">Last value:</div>
        <div className="mt-3 text-4xl font-bold" style={{ color: warn ? "#f5b942" : green }}>
          {value}
          <span className="ml-1 text-2xl">{unit}</span>
        </div>
        <div className="mt-3 text-xs text-[#9aa09c]">{note}</div>
      </div>
    </Widget>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className="relative h-11 w-20 rounded-full transition-colors"
      style={{ backgroundColor: on ? green : "#555856" }}
    >
      <span className={`absolute top-1.5 h-8 w-8 rounded-full bg-white shadow transition-all ${on ? "left-[2.6rem]" : "left-1.5"}`} />
    </button>
  );
}

export default function DashboardHomePage() {
  const [setpoints, setSetpoints] = useState(() => Object.fromEntries(setpointDefaults.map((item) => [item.key, item.value])));
  const [devices, setDevices] = useState(() => Object.fromEntries(actuators.map((item) => [item.id, item.status === "ON"])));

  const tank = reading("Water Tank");
  const soil = reading("Soil Moisture");
  const temperature = reading("Temperature");
  const humidity = reading("Relative Humidity");
  const tankPct = tank ? tank.value : 0;
  const soilPct = soil ? soil.value : 0;
  const arc = Math.PI * 80;

  return (
    <div className="-m-4 min-h-[calc(100vh-65px)] bg-[#111312] p-4 text-white md:-m-6 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#1e201f] px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-white">{demoFarm.name}</h1>
          <div className="text-xs text-[#9aa09c]">
            {demoFarm.location} · {demoFarm.acres} acres · {demoShed.name} · {demoShed.instar}
          </div>
        </div>
        <span className="rounded-full bg-[#f5b942]/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#f5b942]">
          Demo / Simulated Data
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
        <Widget title="Water Tank 01" className="xl:col-span-4">
          <div className="flex flex-1 flex-col items-center justify-center">
            <svg viewBox="0 0 200 118" className="w-full max-w-[260px]" role="img" aria-label={`Water tank level ${tankPct}%`}>
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#555856" strokeWidth="34" />
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={green} strokeWidth="34" strokeDasharray={`${(tankPct / 100) * arc} ${arc}`} />
              <text x="100" y="98" textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="600">{tankPct.toFixed(2)}</text>
              <text x="20" y="116" textAnchor="middle" fill={muted} fontSize="8">0</text>
              <text x="180" y="116" textAnchor="middle" fill={muted} fontSize="8">100</text>
            </svg>
            <div className="mt-2 text-xs text-[#9aa09c]">{tank?.location} · {tank?.timestamp}</div>
          </div>
        </Widget>

        <Widget title="Location" className="xl:col-span-4">
          <div className="relative -mx-4 -mb-4 flex-1 overflow-hidden bg-[#1a1c1b]" style={{ minHeight: 170 }}>
            <svg viewBox="0 0 340 170" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <g stroke="#3a3d3b" fill="none">
                <path d="M110 -10 L70 180" strokeWidth="12" />
                <path d="M-10 130 L130 90" strokeWidth="10" />
                <path d="M100 40 L350 95" strokeWidth="4" />
                <path d="M150 -10 L165 60 L215 180" strokeWidth="3" />
                <path d="M255 -10 L235 110 L270 180" strokeWidth="3" />
                <path d="M190 45 L245 55 L238 95 L200 90 Z" strokeWidth="3" />
                <path d="M300 30 L350 -10" strokeWidth="5" />
              </g>
            </svg>
            <div className="absolute left-[24%] top-[52%] -translate-x-1/2 -translate-y-full text-white">
              <MapPin className="h-8 w-8 fill-white text-[#1a1c1b]" />
            </div>
            <div className="absolute bottom-3 right-3 rounded-md bg-[#232524]/90 px-3 py-2 text-xs">
              <div className="font-semibold text-white">{demoFarm.location}</div>
              <div className="text-[#9aa09c]">{demoFarm.climate}</div>
            </div>
          </div>
        </Widget>

        <div className="grid grid-cols-2 gap-4 md:col-span-2 xl:col-span-4">
          <BigValue title="Shed Temperature" value={temperature?.value ?? "–"} unit="°C" note={temperature?.timestamp ?? ""} />
          <BigValue title="Humidity" value={humidity?.value ?? "–"} unit="%" note={humidity?.timestamp ?? ""} />
        </div>

        <Widget title="Temperature & Humidity" className="md:col-span-2 xl:col-span-8">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={climateHistory} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="#343735" vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#c5cbc7", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#c5cbc7", fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1c1b", border: "1px solid #3a3d3b", borderRadius: 8, color: "#fff" }} />
                <Legend verticalAlign="top" height={30} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: "#fff" }} />
                <Line type="monotone" dataKey="temperature" name="Temperature (°C)" stroke={green} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#f1f3f2" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Widget>

        <Widget title="Soil Moisture" className="xl:col-span-4">
          <div className="flex flex-1 flex-col items-center justify-center">
            <svg viewBox="0 0 150 150" className="w-full max-w-[170px]" role="img" aria-label={`Soil moisture ${soilPct}%`}>
              <defs>
                <clipPath id="soilCircle">
                  <circle cx="75" cy="75" r="70" />
                </clipPath>
              </defs>
              <circle cx="75" cy="75" r="70" fill="#555856" />
              <rect x="0" y={145 - (soilPct / 100) * 140} width="150" height="150" fill={green} clipPath="url(#soilCircle)" />
              <text x="75" y="86" textAnchor="middle" fill="#ffffff" fontSize="34" fontWeight="700">{soilPct}</text>
            </svg>
            <div className="mt-2 text-xs text-[#9aa09c]">% · {soil?.location} · {soil?.timestamp}</div>
          </div>
        </Widget>

        <Widget title="Controls" action={<span className="text-[10px] uppercase tracking-[0.15em] text-[#9aa09c]">Set points</span>} className="md:col-span-2 xl:col-span-8">
          <div className="grid flex-1 grid-cols-4 gap-x-2 gap-y-5 pt-2 sm:grid-cols-7">
            {setpointDefaults.map((item) => (
              <div key={item.key} className="flex flex-col items-center">
                <div className="h-8 text-center text-xs font-semibold leading-4 text-white">{item.label}</div>
                <div className="mt-2 flex items-stretch gap-2">
                  <div className="flex w-10 flex-col justify-center text-right text-sm font-semibold" style={{ color: green }}>
                    {setpoints[item.key]}
                  </div>
                  <input
                    type="range"
                    aria-label={`${item.label} set point (${item.unit})`}
                    min={item.min}
                    max={item.max}
                    step={item.step}
                    value={setpoints[item.key]}
                    onChange={(event) => setSetpoints((current) => ({ ...current, [item.key]: Number(event.target.value) }))}
                    className="h-28 w-5 cursor-pointer accent-[#3fbf5f] [direction:rtl] [writing-mode:vertical-lr]"
                  />
                  <div className="flex w-8 flex-col justify-between text-[10px] text-[#9aa09c]">
                    <span>{item.max}</span>
                    <span>{item.min}</span>
                  </div>
                </div>
                <div className="mt-1 text-[10px] text-[#9aa09c]">{item.unit}</div>
              </div>
            ))}
          </div>
        </Widget>

        <div className="grid grid-cols-2 gap-4 md:col-span-2 xl:col-span-4">
          {actuators.slice(0, 2).map((device) => (
            <DeviceTile key={device.id} name={device.name} mode={device.mode} on={devices[device.id]} onChange={() => setDevices((current) => ({ ...current, [device.id]: !current[device.id] }))} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:col-span-2 xl:col-span-6">
          {actuators.slice(2).map((device) => (
            <DeviceTile key={device.id} name={device.name} mode={device.mode} on={devices[device.id]} onChange={() => setDevices((current) => ({ ...current, [device.id]: !current[device.id] }))} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 md:col-span-2 xl:col-span-6">
          {quickReadings.map(({ sensor, label, icon: Icon }) => (
            <Widget key={label} title={label} action={<Icon className="h-4 w-4 text-[#9aa09c]" />}>
              <div className="flex flex-1 flex-col items-center justify-center py-3 text-center">
                <div className="text-2xl font-bold sm:text-3xl" style={{ color: sensor?.status === "Warning" ? "#f5b942" : green }}>
                  {sensor?.value}
                </div>
                <div className="mt-1 text-xs text-[#9aa09c]">{sensor?.unit}</div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.15em]" style={{ color: sensor?.status === "Warning" ? "#f5b942" : muted }}>
                  {sensor?.status}
                </div>
              </div>
            </Widget>
          ))}
        </div>

        <Widget title="Devices & Sensors" className="md:col-span-2 xl:col-span-7">
          <div className="divide-y divide-white/10">
            {sensorReadings.map((sensor) => (
              <div key={sensor.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: sensor.status === "Warning" ? "#f5b942" : green }} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white">{sensor.name}</div>
                    <div className="text-xs text-[#9aa09c]">{sensor.location}</div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold text-white">
                    {sensor.value} <span className="text-xs font-normal text-[#9aa09c]">{sensor.unit}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-[#9aa09c]">{sensor.status}</div>
                </div>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Alerts" action={<AlertTriangle className="h-4 w-4 text-[#f5b942]" />} className="md:col-span-2 xl:col-span-5">
          <div className="space-y-3">
            {alertItems.map((alert) => (
              <div key={alert.id} className="rounded-md bg-[#2c2f2d] p-3" style={{ borderLeft: `3px solid ${severityColor[alert.severity] ?? muted}` }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: severityColor[alert.severity] ?? muted }}>
                    {alert.severity}
                  </div>
                  <div className="text-[10px] text-[#9aa09c]">{alert.timestamp} · {alert.location}</div>
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {alert.parameter}: {alert.value}
                </div>
                <div className="mt-1 text-xs leading-5 text-[#c5cbc7]">{alert.recommendedAction}</div>
              </div>
            ))}
          </div>
        </Widget>
      </div>
    </div>
  );
}

function DeviceTile({ name, mode, on, onChange }: { name: string; mode: string; on: boolean; onChange: () => void }) {
  const Icon = deviceIcons[name] ?? Power;
  return (
    <Widget title={name} action={<Icon className="h-4 w-4 text-[#9aa09c]" />}>
      <div className="flex flex-1 flex-col items-center justify-center py-4">
        <Toggle on={on} onChange={onChange} label={`${name} power`} />
        <div className="mt-4 text-xs font-semibold" style={{ color: on ? green : muted }}>
          {on ? "ON" : "OFF"}
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#9aa09c]">{mode}</div>
      </div>
    </Widget>
  );
}
