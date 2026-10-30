"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import {
  Bell,
  Camera,
  Check,
  ChevronDown,
  Cloud,
  CloudSun,
  Cpu,
  Droplets,
  Egg,
  Fan,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Plus,
  Radio,
  Router,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sprout,
  Sun,
  Thermometer,
  Trash2,
  UsersRound,
  Warehouse,
  Waves,
  Wifi,
  WifiOff,
  Wind,
  Wrench,
  X,
} from "lucide-react";

import { BatchSettings } from "@/components/dashboard/batch-settings";
import { DeviceStore, ServiceCenter, TeamUsers } from "@/components/dashboard/settings-extras";
import { DashboardPage, PageHeader, activeHighlight } from "@/components/dashboard/page-kit";

// Matches the palette of the main dashboard page.
const green = "var(--d-accent)";

// Demo mode: settings and devices are kept in this browser only.
const storageKey = "paari-settings-v1";

type FarmSettings = {
  name: string;
  owner: string;
  location: string;
  area: string;
  mulberryVariety: string;
  irrigation: string;
  soilType: string;
  cropCalendarStart: string;
};

type ShedSettings = {
  name: string;
  size: string;
  rearingCapacity: string;
  currentInstar: string;
  tempMin: string;
  tempMax: string;
  humidityMin: string;
  humidityMax: string;
  co2Max: string;
  nh3Max: string;
  ventilationMode: string;
  lightHours: string;
};

type AlertSettings = {
  app: boolean;
  sms: boolean;
  whatsapp: boolean;
  email: boolean;
  quietHours: boolean;
  autoAutomation: boolean;
};

type Device = {
  id: string;
  name: string;
  type: string;
  connection: string;
  serial: string;
  location: string;
  online: boolean;
};

type Saved = { farm?: FarmSettings; shed?: ShedSettings; alerts?: AlertSettings; devices?: Device[] };

const defaultFarm: FarmSettings = {
  name: "Paari Demo Farm",
  owner: "Farm Manager",
  location: "Kallakurichi, Tamil Nadu",
  area: "2.5",
  mulberryVariety: "V1",
  irrigation: "Drip",
  soilType: "Red loam",
  cropCalendarStart: "2026-06-01",
};

const defaultShed: ShedSettings = {
  name: "Rearing Shed A1",
  size: "50 × 20 ft",
  rearingCapacity: "300",
  currentInstar: "IV",
  tempMin: "24",
  tempMax: "28",
  humidityMin: "70",
  humidityMax: "85",
  co2Max: "1000",
  nh3Max: "10",
  ventilationMode: "Automatic",
  lightHours: "16",
};

const defaultAlerts: AlertSettings = { app: true, sms: true, whatsapp: true, email: false, quietHours: false, autoAutomation: true };

const defaultDevices: Device[] = [
  { id: "d1", name: "Shed climate sensor", type: "Climate sensor", connection: "Wi-Fi", serial: "PST-TH-1021", location: "Rearing Shed A1", online: true },
  { id: "d2", name: "Gas monitor", type: "Gas sensor", connection: "Wi-Fi", serial: "PST-GS-0448", location: "Rearing Shed A1", online: true },
  { id: "d3", name: "Plot 1 soil probe", type: "Soil sensor", connection: "LoRaWAN", serial: "PST-SM-2290", location: "Mulberry Plot 1", online: false },
  { id: "d4", name: "Exhaust fan relay", type: "Fan controller", connection: "Wi-Fi", serial: "PST-RL-0310", location: "Rearing Shed A1", online: true },
];

const deviceTypes: Array<{ name: string; detail: string; icon: typeof Cpu }> = [
  { name: "Climate sensor", detail: "Temperature & humidity", icon: Thermometer },
  { name: "Gas sensor", detail: "CO₂ / NH₃", icon: Wind },
  { name: "Light sensor", detail: "Lux level", icon: Sun },
  { name: "Soil sensor", detail: "Moisture & pH", icon: Sprout },
  { name: "Weather station", detail: "Rain, wind, sun", icon: CloudSun },
  { name: "Camera", detail: "Shed or field view", icon: Camera },
  { name: "Fan controller", detail: "Ventilation", icon: Fan },
  { name: "Humidifier", detail: "Fogger / mister", icon: Cloud },
  { name: "Irrigation valve", detail: "Drip / sprinkler", icon: Waves },
  { name: "Fertigation pump", detail: "Nutrient dosing", icon: Droplets },
  { name: "Gateway", detail: "Hub for other devices", icon: Router },
];

const typeIcon = (type: string) => deviceTypes.find((item) => item.name === type)?.icon ?? Cpu;

const connections = ["Wi-Fi", "LoRaWAN", "Zigbee", "Bluetooth", "Ethernet", "Modbus RS-485", "4G / SIM"];

const inputClass =
  "h-11 w-full rounded-xl border border-[var(--d-line)] bg-[var(--d-inset)] px-3.5 text-sm text-[var(--d-text)] placeholder:text-[var(--d-muted)] outline-none transition focus:border-[var(--d-accent)] focus:ring-4 focus:ring-[var(--d-accent-soft)]";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-[var(--d-soft)]">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-[var(--d-muted)]">{hint}</span>}
    </label>
  );
}

function TextInput({ value, onChange, type = "text", suffix, placeholder, required }: { value: string; onChange: (value: string) => void; type?: string; suffix?: string; placeholder?: string; required?: boolean }) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} ${suffix ? "pr-16" : ""}`}
      />
      {suffix && <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-medium text-[var(--d-muted)]">{suffix}</span>}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} appearance-none pr-10`}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--d-muted)]" />
    </div>
  );
}

function Segmented({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--d-line)] bg-[var(--d-inset)] p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${value === option ? "accent-fill" : "text-[var(--d-muted)] hover:text-[var(--d-text)]"}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-[var(--d-accent)]" : "bg-[var(--d-track)]"}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
    </button>
  );
}

function Panel({ icon: Icon, title, description, children }: { icon: typeof Cpu; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="dash-card rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-5 sm:p-6">
      <div className="mb-6 flex items-start gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--d-accent-soft)] text-[var(--d-accent)]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-[var(--d-text)]">{title}</h2>
          <p className="mt-0.5 text-sm text-[var(--d-muted)]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function RangeCard({ icon: Icon, label, unit, min, max, onMin, onMax }: { icon: typeof Cpu; label: string; unit: string; min: string; max: string; onMin: (value: string) => void; onMax: (value: string) => void }) {
  return (
    <div className="rounded-xl border border-[var(--d-line)] bg-[var(--d-inset)] p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-[var(--d-soft)]">
          <Icon className="h-4 w-4 text-[var(--d-accent)]" /> {label}
        </span>
        <span className="text-sm font-semibold text-[var(--d-text)]">
          {min}–{max}
          <span className="ml-1 text-xs font-normal text-[var(--d-muted)]">{unit}</span>
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <TextInput type="number" value={min} onChange={onMin} suffix="Min" />
        <TextInput type="number" value={max} onChange={onMax} suffix="Max" />
      </div>
    </div>
  );
}

function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function writeSaved(data: Saved) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch {
    // Storage unavailable (private window); changes stay for this visit only.
  }
}

const tabs = [
  { value: "farm", label: "Farm", detail: "Land & plantation", icon: MapPin },
  { value: "shed", label: "Shed", detail: "Rearing & climate", icon: Warehouse },
  { value: "batch", label: "Silkworm Batch", detail: "Batch, breed & farm", icon: Egg },
  { value: "devices", label: "Devices", detail: "Connected & new devices", icon: Cpu },
  { value: "service", label: "Service Center", detail: "Notifications & requests", icon: Wrench },
  { value: "store", label: "Device Store", detail: "Devices from Paari Seritech", icon: ShoppingBag },
  { value: "users", label: "Users", detail: "Team & access", icon: UsersRound },
  { value: "alerts", label: "Alerts & System", detail: "Notifications", icon: Bell },
];

// Saved settings live in localStorage, so the form renders on the client only.
export default dynamic(() => Promise.resolve(SettingsView), { ssr: false });

function initialState() {
  const stored = loadSaved();
  return {
    farm: { ...defaultFarm, ...stored?.farm },
    shed: { ...defaultShed, ...stored?.shed },
    alerts: { ...defaultAlerts, ...stored?.alerts },
    devices: stored?.devices ?? defaultDevices,
  };
}

function SettingsView() {
  const [initial] = useState(initialState);
  const [saved, setSaved] = useState({ farm: initial.farm, shed: initial.shed, alerts: initial.alerts });
  const [farm, setFarm] = useState(initial.farm);
  const [shed, setShed] = useState(initial.shed);
  const [alerts, setAlerts] = useState(initial.alerts);
  const [devices, setDevices] = useState(initial.devices);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const dirty = JSON.stringify({ farm, shed, alerts }) !== JSON.stringify(saved);

  const save = () => {
    setSaved({ farm, shed, alerts });
    writeSaved({ farm, shed, alerts, devices });
    setToast("Settings saved");
  };

  const discard = () => {
    setFarm(saved.farm);
    setShed(saved.shed);
    setAlerts(saved.alerts);
  };

  const updateDevices = (next: Device[], message: string) => {
    setDevices(next);
    writeSaved({ ...saved, devices: next });
    setToast(message);
  };

  const farmField = (key: keyof FarmSettings) => (value: string) => setFarm((prev) => ({ ...prev, [key]: value }));
  const shedField = (key: keyof ShedSettings) => (value: string) => setShed((prev) => ({ ...prev, [key]: value }));
  const toggleAlert = (key: keyof AlertSettings) => () => setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));

  const online = devices.filter((device) => device.online).length;

  return (
    <DashboardPage tint="slate">
      <PageHeader icon={SettingsIcon} eyebrow="Settings" title="Farm, shed & device configuration" detail="Set up your farm once. Alerts, automation and reports use these values." badge={null} />

      <Tabs.Root defaultValue="farm" orientation="vertical" className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Tabs.List className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-6 lg:flex-col lg:self-start lg:overflow-visible lg:pb-0">
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="group flex shrink-0 items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-left outline-none transition-all hover:bg-[var(--d-chip-hover)] focus-visible:ring-2 focus-visible:ring-[var(--d-accent)] data-[state=active]:accent-fill data-[state=active]:accent-glow"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--d-accent-soft)] text-[var(--d-accent)] transition group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                <tab.icon className="h-[18px] w-[18px]" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[var(--d-text)] group-data-[state=active]:text-white">{tab.label}</span>
                <span className="hidden text-xs text-[var(--d-muted)] group-data-[state=active]:text-white/80 lg:block">{tab.detail}</span>
              </span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="min-w-0">
          <Tabs.Content value="farm" className="space-y-6 outline-none">
            <Panel icon={Leaf} title="Farm profile" description="Who runs the farm and where it is.">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Farm name"><TextInput value={farm.name} onChange={farmField("name")} /></Field>
                <Field label="Owner / manager"><TextInput value={farm.owner} onChange={farmField("owner")} /></Field>
                <Field label="Location"><TextInput value={farm.location} onChange={farmField("location")} /></Field>
                <Field label="Total area"><TextInput type="number" value={farm.area} onChange={farmField("area")} suffix="acres" /></Field>
              </div>
            </Panel>

            <Panel icon={Sprout} title="Mulberry plantation" description="Used to plan pruning, fertigation and leaf harvest.">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Mulberry variety"><Select value={farm.mulberryVariety} onChange={farmField("mulberryVariety")} options={["V1", "S36", "G4", "MR2", "Other"]} /></Field>
                <Field label="Soil type"><Select value={farm.soilType} onChange={farmField("soilType")} options={["Red loam", "Black cotton", "Sandy loam", "Laterite", "Alluvial"]} /></Field>
                <Field label="Crop calendar start"><TextInput type="date" value={farm.cropCalendarStart} onChange={farmField("cropCalendarStart")} /></Field>
                <Field label="Irrigation method"><Segmented value={farm.irrigation} onChange={farmField("irrigation")} options={["Drip", "Sprinkler", "Flood", "Rain-fed"]} /></Field>
              </div>
            </Panel>
          </Tabs.Content>

          <Tabs.Content value="shed" className="space-y-6 outline-none">
            <Panel icon={Warehouse} title="Rearing shed" description="The shed and the batch currently being reared.">
              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Shed name"><TextInput value={shed.name} onChange={shedField("name")} /></Field>
                <Field label="Shed size"><TextInput value={shed.size} onChange={shedField("size")} /></Field>
                <Field label="Rearing capacity"><TextInput type="number" value={shed.rearingCapacity} onChange={shedField("rearingCapacity")} suffix="DFLs" /></Field>
              </div>
              <p className="mt-5 text-xs text-[var(--d-muted)]">The batch being reared, its breed and instar are set under Silkworm Batch.</p>
            </Panel>

            <Panel icon={Thermometer} title="Climate targets" description="Alerts and automation act when readings leave these ranges.">
              <div className="grid gap-4 md:grid-cols-2">
                <RangeCard icon={Thermometer} label="Temperature" unit="°C" min={shed.tempMin} max={shed.tempMax} onMin={shedField("tempMin")} onMax={shedField("tempMax")} />
                <RangeCard icon={Droplets} label="Humidity" unit="% RH" min={shed.humidityMin} max={shed.humidityMax} onMin={shedField("humidityMin")} onMax={shedField("humidityMax")} />
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <Field label="CO₂ limit"><TextInput type="number" value={shed.co2Max} onChange={shedField("co2Max")} suffix="ppm" /></Field>
                <Field label="NH₃ limit"><TextInput type="number" value={shed.nh3Max} onChange={shedField("nh3Max")} suffix="ppm" /></Field>
                <Field label="Light period"><TextInput type="number" value={shed.lightHours} onChange={shedField("lightHours")} suffix="hrs/day" /></Field>
              </div>
              <div className="mt-5">
                <Field label="Ventilation mode">
                  <Segmented value={shed.ventilationMode} onChange={shedField("ventilationMode")} options={["Automatic", "Scheduled", "Manual"]} />
                </Field>
              </div>
            </Panel>
          </Tabs.Content>

          <Tabs.Content value="batch" className="space-y-6 outline-none">
            <Panel icon={Egg} title="Silkworm batch" description="Pick the batch the Silkworm tab follows, add a new one, or change its number, farm, breed and dates. Saved straight away, separately from the other settings.">
              <BatchSettings />
            </Panel>
          </Tabs.Content>

          <Tabs.Content value="devices" className="space-y-6 outline-none">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total devices", value: devices.length, color: "var(--d-text)" },
                { label: "Online", value: online, color: green },
                { label: "Offline", value: devices.length - online, color: "var(--d-warn)" },
              ].map((stat) => (
                <div key={stat.label} className="dash-card rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-4">
                  <div className="text-xs text-[var(--d-muted)]">{stat.label}</div>
                  <div className="mt-1 text-2xl font-semibold" style={{ color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <section className="dash-card rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[var(--d-text)]">Connected devices</h2>
                  <p className="mt-0.5 text-sm text-[var(--d-muted)]">Sensors, cameras and controllers linked to this farm.</p>
                </div>
                <AddDeviceDialog
                  locations={[shed.name, "Mulberry Plot 1", "Mulberry Plot 2", "Leaf storage room", "Pump house"]}
                  onAdd={(device) => updateDevices([...devices, device], `${device.name} added`)}
                />
              </div>

              {devices.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--d-line)] p-10 text-center">
                  <Cpu className="mx-auto h-8 w-8 text-[var(--d-muted)]" />
                  <p className="mt-3 text-sm text-[var(--d-muted)]">No devices yet. Add your first sensor or controller.</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {devices.map((device) => {
                    const Icon = typeIcon(device.type);
                    return (
                      <div key={device.id} className="group flex items-start gap-3.5 rounded-2xl border border-[var(--d-line)] bg-[var(--d-inset)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--d-accent-soft)] text-[var(--d-accent)]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium text-[var(--d-text)]">{device.name}</span>
                            <span className={`h-2 w-2 shrink-0 rounded-full ${device.online ? "bg-[var(--d-accent)] shadow-[0_0_8px_#3fbf5f]" : "bg-[var(--d-warn)]"}`} />
                          </div>
                          <div className="mt-0.5 truncate text-[13px] text-[var(--d-muted)]">{device.type} · {device.location}</div>
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--d-chip)] px-2 py-0.5 text-[11px] text-[var(--d-soft)]">
                              {device.online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />} {device.connection}
                            </span>
                            <span className="rounded-md bg-[var(--d-chip)] px-2 py-0.5 font-mono text-[11px] text-[var(--d-muted)]">{device.serial}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${device.name}`}
                          onClick={() => updateDevices(devices.filter((item) => item.id !== device.id), `${device.name} removed`)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--d-muted)] transition hover:bg-[var(--d-danger-soft)] hover:text-[var(--d-danger-text)] sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </Tabs.Content>

          <Tabs.Content value="service" className="space-y-6 outline-none">
            <ServiceCenter devices={devices.map((device) => device.name)} />
          </Tabs.Content>

          <Tabs.Content value="store" className="space-y-6 outline-none">
            <DeviceStore />
          </Tabs.Content>

          <Tabs.Content value="users" className="space-y-6 outline-none">
            <TeamUsers />
          </Tabs.Content>

          <Tabs.Content value="alerts" className="space-y-6 outline-none">
            <Panel icon={Bell} title="Notification channels" description="Where critical alerts and daily summaries are sent.">
              <div className="divide-y divide-[var(--d-line)]">
                {[
                  { key: "app" as const, label: "In-app notifications", detail: "Shown in the dashboard bell", icon: Smartphone },
                  { key: "sms" as const, label: "SMS", detail: "Critical alerts only", icon: MessageCircle },
                  { key: "whatsapp" as const, label: "WhatsApp", detail: "Alerts and daily summary", icon: MessageCircle },
                  { key: "email" as const, label: "Email", detail: "Weekly reports", icon: Mail },
                ].map((row) => (
                  <div key={row.key} className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0">
                    <row.icon className="h-[18px] w-[18px] shrink-0 text-[var(--d-muted)]" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[var(--d-text)]">{row.label}</div>
                      <div className="text-xs text-[var(--d-muted)]">{row.detail}</div>
                    </div>
                    <Switch on={alerts[row.key]} onChange={toggleAlert(row.key)} label={row.label} />
                  </div>
                ))}
              </div>
            </Panel>

            <Panel icon={ShieldCheck} title="Automation & safety" description="How the system responds when limits are crossed.">
              <div className="divide-y divide-[var(--d-line)]">
                {[
                  { key: "autoAutomation" as const, label: "Act automatically", detail: "Run fans, foggers and valves without waiting for approval" },
                  { key: "quietHours" as const, label: "Quiet hours (10 pm – 6 am)", detail: "Hold non-critical alerts overnight" },
                ].map((row) => (
                  <div key={row.key} className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[var(--d-text)]">{row.label}</div>
                      <div className="text-xs text-[var(--d-muted)]">{row.detail}</div>
                    </div>
                    <Switch on={alerts[row.key]} onChange={toggleAlert(row.key)} label={row.label} />
                  </div>
                ))}
              </div>
            </Panel>

            <Panel icon={Radio} title="System information" description="About this installation.">
              <dl className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Version", "1.0"],
                  ["Mode", "Demo"],
                  ["Data source", "Simulation engine"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-[var(--d-inset)] p-4">
                    <dt className="text-xs text-[var(--d-muted)]">{label}</dt>
                    <dd className="mt-1 text-sm font-medium text-[var(--d-text)]">{value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </Tabs.Content>
        </div>
      </Tabs.Root>

      <p className="text-center text-xs text-[var(--d-muted)]">Demo mode: changes are saved in this browser only.</p>

      {/* Appears only when there are unsaved changes. */}
      <div
        className={`fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-[var(--d-line)] bg-[var(--d-popup)] p-3 pl-5 shadow-2xl backdrop-blur transition-all duration-300 ${dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--d-warn)]" />
        <span className="flex-1 text-sm text-[var(--d-soft)]">You have unsaved changes</span>
        <button type="button" onClick={discard} className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--d-soft)] transition hover:bg-[var(--d-chip-hover)]">
          Discard
        </button>
        <button type="button" onClick={save} className="rounded-xl accent-fill px-4 py-2 text-sm font-semibold transition hover:opacity-90">
          Save changes
        </button>
      </div>

      <div
        role="status"
        className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-[var(--d-line)] bg-[var(--d-accent-soft)] px-4 py-3 text-sm text-[var(--d-text)] shadow-xl transition-all duration-300 ${toast ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"}`}
      >
        <Check className="h-4 w-4 text-[var(--d-accent)]" /> {toast}
      </div>
    </DashboardPage>
  );
}

function AddDeviceDialog({ locations, onAdd }: { locations: string[]; onAdd: (device: Device) => void }) {
  const blank = { name: "", type: deviceTypes[0].name, connection: connections[0], serial: "", location: locations[0] };
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const field = (key: keyof typeof blank) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setForm(blank);
      }}
    >
      <Dialog.Trigger asChild>
        <button type="button" className="inline-flex items-center gap-2 rounded-xl accent-fill px-4 py-2.5 text-sm font-semibold transition hover:opacity-90">
          <Plus className="h-4 w-4" /> Add device
        </button>
      </Dialog.Trigger>
      {/* No portal: the window renders inside the dashboard so it keeps the light/dark theme colours. */}
      <>
        <Dialog.Overlay className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[66] max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--d-line)] bg-[var(--d-popup)] p-6 text-[var(--d-text)] shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold">Add a smart device</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-[var(--d-muted)]">
                Power on the device, choose its type, then enter the serial number from its label.
              </Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--d-muted)] transition hover:bg-[var(--d-chip-hover)] hover:text-[var(--d-text)]">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form
            className="mt-6 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              onAdd({
                id: `d${Date.now()}`,
                name: form.name.trim(),
                type: form.type,
                connection: form.connection,
                serial: form.serial.trim().toUpperCase(),
                location: form.location,
                online: true,
              });
              setOpen(false);
              setForm(blank);
            }}
          >
            <div>
              <span className="mb-2 block text-[13px] font-medium text-[var(--d-soft)]">Device type</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {deviceTypes.map((type) => {
                  const active = form.type === type.name;
                  return (
                    <button
                      key={type.name}
                      type="button"
                      onClick={() => field("type")(type.name)}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${active ? activeHighlight : "border-[var(--d-line)] bg-[var(--d-inset)] hover:-translate-y-0.5 hover:shadow-md"}`}
                    >
                      <type.icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-white" : "text-[var(--d-accent)]"}`} />
                      <span className="min-w-0">
                        <span className={`block truncate text-sm font-medium ${active ? "text-white" : "text-[var(--d-text)]"}`}>{type.name}</span>
                        <span className={`block truncate text-[11px] ${active ? "text-white/80" : "text-[var(--d-muted)]"}`}>{type.detail}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Device name"><TextInput required value={form.name} onChange={field("name")} placeholder="e.g. Shed B humidity sensor" /></Field>
              <Field label="Serial number / device ID"><TextInput required value={form.serial} onChange={field("serial")} placeholder="e.g. PST-TH-1044" /></Field>
              <Field label="Connection"><Select value={form.connection} onChange={field("connection")} options={connections} /></Field>
              <Field label="Install location"><Select value={form.location} onChange={field("location")} options={locations} /></Field>
            </div>

            <div className="flex justify-end gap-2 border-t border-[var(--d-line)] pt-5">
              <Dialog.Close type="button" className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--d-soft)] transition hover:bg-[var(--d-chip-hover)]">
                Cancel
              </Dialog.Close>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl accent-fill px-5 py-2.5 text-sm font-semibold transition hover:opacity-90">
                <Plus className="h-4 w-4" /> Add device
              </button>
            </div>
          </form>
        </Dialog.Content>
      </>
    </Dialog.Root>
  );
}
