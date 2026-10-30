"use client";

import { ChartLine, Fan, MonitorCog, SlidersHorizontal } from "lucide-react";

import { ClimateEquipment, ClimateModeSwitch, useClimate } from "@/components/dashboard/climate-control";
import { ReadingTile, SectionHeader, SetpointPanel, reading, shedSetpoints } from "@/components/dashboard/monitor-widgets";
import { DashboardPage, PageHeader, TrendChart } from "@/components/dashboard/page-kit";
import { Co2Icon, HumidityIcon, LightSensorIcon, Nh3Icon, TemperatureIcon } from "@/components/dashboard/sensor-icons";
import { demoShed, temperatureHistory } from "@/data/mock";

const climateReadings = [
  { sensor: reading("Temperature"), label: "Temperature", icon: TemperatureIcon },
  { sensor: reading("Relative Humidity"), label: "Humidity", icon: HumidityIcon },
  { sensor: reading("NH3"), label: "NH₃", icon: Nh3Icon },
  { sensor: reading("CO2"), label: "CO₂", icon: Co2Icon },
  { sensor: reading("Light"), label: "Light", icon: LightSensorIcon },
];

// The only place climate equipment is controlled; other tabs show its status as icons.
export default function ClimatePage() {
  const { mode, limits, setLimit } = useClimate();

  return (
    <DashboardPage tint="heat">
      <PageHeader icon={MonitorCog} eyebrow="Climate Control" title="Operational climate management" detail={`${demoShed.name} · ${demoShed.instar}`} />

      <section aria-label="Control mode">
        <SectionHeader icon={SlidersHorizontal} title="Control Mode" detail="How the shed's climate equipment is run · applies to every device below" />
        <ClimateModeSwitch />
      </section>

      <section aria-label="Climate readings">
        <SectionHeader icon={TemperatureIcon} title="Shed Climate" detail="Live readings · tap a card for its history" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {climateReadings.map((item) => (
            <ReadingTile key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section aria-label="Climate equipment">
        <SectionHeader
          icon={Fan}
          title="Equipment"
          detail={mode === "auto" ? "Running automatically from the readings and limits" : mode === "semi" ? "Review the suggested changes, then approve or keep" : "Switch each device on or off"}
        />
        <ClimateEquipment />
      </section>

      <section aria-label="Limits and trend">
        <SectionHeader icon={ChartLine} title="Limits & Trend" detail="Targets the climate equipment works to, and today's temperature" />
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <SetpointPanel items={shedSetpoints} values={limits} onChange={setLimit} />
          <TrendChart id="climateTemperature" title="Temperature" unit="°C" data={temperatureHistory} tone="warn" icon={TemperatureIcon} />
        </div>
      </section>
    </DashboardPage>
  );
}
