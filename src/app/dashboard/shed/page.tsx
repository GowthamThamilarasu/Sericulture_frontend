"use client";

import { ChartLine, Gauge, Layers, MonitorCog, Warehouse, Wind } from "lucide-react";

import { ClimateStatusIcons } from "@/components/dashboard/climate-control";

import { Widget } from "@/components/dashboard/dashboard-widgets";
import {
  AlertList,
  BigValue,
  DoorTile,
  ReadingTile,
  SectionHeader,
  historyFor,
  reading,
  shedAlerts,
} from "@/components/dashboard/monitor-widgets";
import { DashboardPage, InfoRow, PageHeader, Pill, StatTile, TrendChart } from "@/components/dashboard/page-kit";
import { Co2Icon, HumidityIcon, LightSensorIcon, Nh3Icon, TemperatureIcon } from "@/components/dashboard/sensor-icons";
import { demoShed, instarStages, temperatureHistory } from "@/data/mock";

const airReadings = [
  { sensor: reading("NH3"), label: "NH₃ (Ammonia)", icon: Nh3Icon },
  { sensor: reading("CO2"), label: "CO₂", icon: Co2Icon },
  { sensor: reading("Light"), label: "Light", icon: LightSensorIcon },
];

// The batch is in IV instar, so the "4th & 5th" band is the active one.
const activeStage = instarStages[instarStages.length - 1].stage;

export default function ShedMonitorPage() {
  const temperature = reading("Temperature");
  const humidity = reading("Relative Humidity");

  return (
    <DashboardPage tint="air">
      <PageHeader icon={Warehouse} eyebrow="Shed Monitor" title="Environmental condition and instar status" detail={`Silkworm rearing · ${demoShed.name} · ${demoShed.instar} · capacity ${demoShed.capacity.toLocaleString()}`} />

      <section aria-label="Shed sensors">
        <SectionHeader icon={TemperatureIcon} title="Shed Sensors" detail={`Live air readings · ${demoShed.name} · tap a card for its history`} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <BigValue title="Temperature" icon={TemperatureIcon} history={historyFor(temperature, "Shed Temperature", TemperatureIcon)} value={temperature?.value ?? "–"} unit="°C" note={temperature?.timestamp ?? ""} />
          <BigValue title="Humidity" icon={HumidityIcon} history={historyFor(humidity, "Shed Humidity", HumidityIcon)} value={humidity?.value ?? "–"} unit="%" note={humidity?.timestamp ?? ""} />
          <div className="grid grid-cols-2 gap-4 sm:col-span-2">
            {airReadings.map((item) => (
              <ReadingTile key={item.label} {...item} />
            ))}
            <DoorTile />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatTile label="Pressure" value="101.4" unit="kPa" icon={Gauge} />
          <StatTile label="Ventilation" value="Moderate" icon={Wind} tone="warn" />
          <StatTile label="Current Instar" value={demoShed.instar.replace(" INSTAR", "")} icon={Layers} note={demoShed.status} />
        </div>
      </section>

      <section aria-label="Climate status">
        <SectionHeader icon={MonitorCog} title="Climate Status" detail="Fans, humidity and temperature equipment · controlled from Climate Control" />
        <ClimateStatusIcons />
      </section>

      <section aria-label="Trends and alerts">
        <SectionHeader icon={ChartLine} title="Trends & Alerts" detail="Recent climate history, instar targets and open shed alerts" />
        <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
          <TrendChart id="shedTemperature" title="Temperature" unit="°C" data={temperatureHistory} tone="warn" icon={TemperatureIcon} />
          <Widget title="Instar Targets" icon={Layers}>
            <div className="space-y-3">
              {instarStages.map((stage) => (
                <div key={stage.stage} className="rounded-md bg-[var(--d-inset)] px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-[var(--d-text)]">{stage.stage}</div>
                    {stage.stage === activeStage && <Pill>Current</Pill>}
                  </div>
                  <InfoRow label="Temperature" value={stage.temperature} icon={TemperatureIcon} />
                  <InfoRow label="Humidity" value={stage.humidity} icon={HumidityIcon} />
                </div>
              ))}
            </div>
          </Widget>
          <AlertList items={shedAlerts} className="lg:col-span-2" />
        </div>
      </section>
    </DashboardPage>
  );
}
