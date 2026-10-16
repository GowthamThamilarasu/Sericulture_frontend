"use client";

import { useState } from "react";
import { ChartLine, CloudDrizzle, Fan, Heater, MonitorCog, Snowflake, Wind } from "lucide-react";

import { Widget } from "@/components/dashboard/dashboard-widgets";
import { ReadingTile, SectionHeader, SetpointPanel, reading, shedSetpoints } from "@/components/dashboard/monitor-widgets";
import { ControlRow, DashboardPage, PageHeader, TrendChart } from "@/components/dashboard/page-kit";
import { Co2Icon, HumidityIcon, LightSensorIcon, Nh3Icon, TemperatureIcon } from "@/components/dashboard/sensor-icons";
import { demoShed, temperatureHistory } from "@/data/mock";

const climateReadings = [
  { sensor: reading("Temperature"), label: "Temperature", icon: TemperatureIcon },
  { sensor: reading("Relative Humidity"), label: "Humidity", icon: HumidityIcon },
  { sensor: reading("NH3"), label: "NH₃", icon: Nh3Icon },
  { sensor: reading("CO2"), label: "CO₂", icon: Co2Icon },
  { sensor: reading("Light"), label: "Light", icon: LightSensorIcon },
];

const equipment = [
  { group: "Ventilation", icon: Wind, items: [{ name: "Fan Stage 1", icon: Fan, status: "Running" }, { name: "Fan Stage 2", icon: Fan, status: "Off" }, { name: "Circulation Fan", icon: Wind, status: "Running" }] },
  { group: "Humidity", icon: CloudDrizzle, items: [{ name: "Fogger", icon: CloudDrizzle, status: "Off" }, { name: "Humidifier", icon: CloudDrizzle, status: "Off" }] },
  { group: "Temperature", icon: Heater, items: [{ name: "Heater", icon: Heater, status: "Off" }, { name: "Cooling", icon: Snowflake, status: "Off" }] },
];

export default function ClimatePage() {
  const [setpoints, setSetpoints] = useState(() => Object.fromEntries(shedSetpoints.map((item) => [item.key, item.value])));

  return (
    <DashboardPage tint="heat">
      <PageHeader icon={MonitorCog} eyebrow="Climate Control" title="Operational climate management" detail={`${demoShed.name} · ${demoShed.instar}`} />

      <section aria-label="Climate readings">
        <SectionHeader icon={TemperatureIcon} title="Shed Climate" detail="Live readings · tap a card for its history" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {climateReadings.map((item) => (
            <ReadingTile key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section aria-label="Climate equipment">
        <SectionHeader icon={Fan} title="Equipment" detail="Choose how each device is run: Auto, Semi or Manual" />
        <div className="grid items-start gap-4 lg:grid-cols-3">
          {equipment.map((group) => (
            <Widget key={group.group} title={group.group} icon={group.icon}>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <ControlRow key={item.name} {...item} tone={item.status === "Running" ? "accent" : "muted"} />
                ))}
              </div>
            </Widget>
          ))}
        </div>
      </section>

      <section aria-label="Limits and trend">
        <SectionHeader icon={ChartLine} title="Limits & Trend" detail="Targets the climate equipment works to, and today's temperature" />
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <SetpointPanel items={shedSetpoints} values={setpoints} onChange={(key, value) => setSetpoints((current) => ({ ...current, [key]: value }))} />
          <TrendChart id="climateTemperature" title="Temperature" unit="°C" data={temperatureHistory} tone="warn" icon={TemperatureIcon} />
        </div>
      </section>
    </DashboardPage>
  );
}
