"use client";

import { useState } from "react";
import { MapPin, Sprout, Warehouse } from "lucide-react";

import { ClimateStatusIcons } from "@/components/dashboard/climate-control";
import { FertigationBoard } from "@/components/dashboard/fertigation-board";
import { HistoryProvider } from "@/components/dashboard/history-dialog";
import {
  AlertList,
  BigValue,
  DoorTile,
  ReadingTile,
  SectionHeader,
  SetpointPanel,
  SoilMoistureGauge,
  WaterTankGauge,
  farmAlerts,
  farmSetpoints,
  formatCoordinate,
  historyFor,
  reading,
  shedAlerts,
  soilReadings,
} from "@/components/dashboard/monitor-widgets";
import { ValveControl } from "@/components/dashboard/valve-control";
import { Co2Icon, HumidityIcon, LightSensorIcon, Nh3Icon, TemperatureIcon } from "@/components/dashboard/sensor-icons";
import { demoFarm, demoShed } from "@/data/mock";

const airReadings = [
  { sensor: reading("NH3"), label: "NH₃ (Ammonia)", icon: Nh3Icon },
  { sensor: reading("CO2"), label: "CO₂", icon: Co2Icon },
  { sensor: reading("Light"), label: "Light", icon: LightSensorIcon },
];


export default function DashboardHomePage() {
  const [setpoints, setSetpoints] = useState(() => Object.fromEntries(farmSetpoints.map((item) => [item.key, item.value])));
  const updateSetpoint = (key: string, value: number) => setSetpoints((current) => ({ ...current, [key]: value }));

  const soil = reading("Soil Moisture");
  const temperature = reading("Temperature");
  const humidity = reading("Relative Humidity");

  return (
    <HistoryProvider>
      <div className="page-plant -m-4 min-h-[calc(100vh-65px)] bg-[var(--d-page)] p-4 text-[var(--d-text)] md:-m-6 md:p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg dash-card border border-[var(--d-card-border)] bg-[var(--d-banner)] px-4 py-3">
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

              <ClimateStatusIcons className="sm:col-span-2" />
              <AlertList items={shedAlerts} className="sm:col-span-2" />
            </div>
          </section>

          <section aria-label="Farm monitoring">
            <SectionHeader icon={Sprout} title="Farm Monitoring" detail={`Mulberry field · ${soil?.location ?? "Block A"} · ${demoFarm.acres} acres`} />
            <div className="grid gap-4 sm:grid-cols-2">
              <WaterTankGauge />
              <SoilMoistureGauge />

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
