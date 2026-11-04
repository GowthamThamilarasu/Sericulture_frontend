"use client";

import { ChartLine, Fan, MonitorCog, SlidersHorizontal } from "lucide-react";

import { ClimateEquipment, ClimateModeSwitch, useClimate } from "@/components/dashboard/climate-control";
import { ReadingTile, SectionHeader, SetpointsLink, reading } from "@/components/dashboard/monitor-widgets";
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
  const { mode } = useClimate();

  return (
    <DashboardPage tint="heat">
      <PageHeader icon={MonitorCog} eyebrow="Climate Control" title="Operational climate management" detail={`${demoShed.name} · ${demoShed.instar}`} />

      <section aria-label="Control mode">
        <SectionHeader icon={SlidersHorizontal} title="Control Mode" detail={mode === "mixed" ? "Devices use different modes · pick one to set every device at once" : "Sets every shed device at once · each device can also be changed on its own below"} />
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
          detail={mode === "mixed" ? "Devices use different modes · each row shows and changes its own" : mode === "auto" ? "Running automatically from the active shed model and limits" : mode === "semi" ? "Switching a device on asks for the value it should reach" : "Switch each device on or off · no target asked"}
          action={<SetpointsLink area="shed" />}
        />
        <ClimateEquipment />
      </section>

      <section aria-label="Temperature trend">
        <SectionHeader icon={ChartLine} title="Trend" detail="Today's shed temperature" />
        <TrendChart id="climateTemperature" title="Temperature" unit="°C" data={temperatureHistory} tone="warn" icon={TemperatureIcon} />
      </section>
    </DashboardPage>
  );
}
