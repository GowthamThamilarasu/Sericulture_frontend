"use client";

import { useState } from "react";
import { Activity, CalendarClock, ChartLine, CloudRain, CloudSun, Droplets, Faucet, Gauge, PlugZap, ShieldCheck, SlidersVertical, Sprout, Waves } from "lucide-react";

import { EnergyPanel, ProtectionPanel, SupplyPanel, supplyStatus, usePowerFeed } from "@/components/dashboard/farm-power";
import { FertigationBoard } from "@/components/dashboard/fertigation-board";
import { SchedulerPanel, VolumePanel, useIrrigationPlan } from "@/components/dashboard/irrigation-planner";
import {
  AlertList,
  ReadingTile,
  SectionHeader,
  SetpointPanel,
  SoilMoistureGauge,
  WaterTankGauge,
  farmAlerts,
  farmSetpoints,
  reading,
  soilReadings,
} from "@/components/dashboard/monitor-widgets";
import { DashboardPage, PageHeader, Pill, StatTile, TabWidget, TrendChart, type TrendSeries } from "@/components/dashboard/page-kit";
import { SoilEcIcon, SoilMoistureIcon, TemperatureIcon, WaterLevelIcon } from "@/components/dashboard/sensor-icons";
import { ValveControl } from "@/components/dashboard/valve-control";
import { demoFarm, ecHistory, soilMoistureHistory, temperatureHistory, waterLevelHistory } from "@/data/mock";

// Field readings with no history or set point: water quality, flow and weather.
const fieldStatus = [
  { label: "Water Temp.", value: "26.1", unit: "°C", icon: TemperatureIcon },
  { label: "Water EC", value: "0.65", unit: "mS/cm", icon: Activity },
  { label: "Flow Meter", value: "4.1", unit: "L/min", icon: Gauge },
  { label: "Rain", value: "No", icon: CloudRain },
  { label: "Weather", value: "Mild", icon: CloudSun },
];

const charts: TrendSeries[] = [
  { id: "farmMoisture", title: "Soil Moisture", unit: "%", data: soilMoistureHistory, tone: "accent", icon: SoilMoistureIcon },
  { id: "farmTemperature", title: "Temperature", unit: "°C", data: temperatureHistory, tone: "warn", icon: TemperatureIcon },
  { id: "farmEc", title: "Soil EC", unit: "mS/cm", data: ecHistory, tone: "accent", icon: SoilEcIcon },
  { id: "farmWaterLevel", title: "Water Level", unit: "%", data: waterLevelHistory, tone: "info", icon: WaterLevelIcon },
];

export default function FarmMonitorPage() {
  const [setpoints, setSetpoints] = useState(() => Object.fromEntries(farmSetpoints.map((item) => [item.key, item.value])));
  const plan = useIrrigationPlan();
  const power = usePowerFeed();
  const supply = supplyStatus(power);
  const block = reading("Soil Moisture")?.location ?? "Block A";

  return (
    <DashboardPage tint="plant">
      <PageHeader icon={Sprout} eyebrow="Farm Monitor" title="Field condition overview" detail={`${demoFarm.name} · Mulberry field · ${block} · ${demoFarm.acres} acres`} />

      <section aria-label="Field sensors">
        <SectionHeader icon={SoilMoistureIcon} title="Field Sensors" detail={`Live soil and water readings · ${block} · tap a card for its history`} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <WaterTankGauge />
          <SoilMoistureGauge />
          <div className="grid grid-cols-3 gap-4 sm:col-span-2">
            {soilReadings.map((item) => (
              <ReadingTile key={item.label} {...item} />
            ))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {fieldStatus.map((item) => (
            <StatTile key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section aria-label="Irrigation controls">
        <SectionHeader icon={Waves} title="Irrigation Controls" detail="Valves, timing schedules, water volumes and the pump's power supply" />
        <div className="grid items-start gap-4 xl:grid-cols-3">
          <TabWidget
            title="Irrigation"
            icon={Waves}
            className="xl:col-span-2"
            tabs={[
              { id: "valves", label: "Pump & Valves", icon: Faucet, content: <ValveControl embedded />, keepMounted: true },
              { id: "schedule", label: "Scheduler", icon: CalendarClock, content: <SchedulerPanel plan={plan} /> },
              { id: "volume", label: "Volume", icon: Droplets, content: <VolumePanel plan={plan} /> },
              { id: "setpoints", label: "Set Points", icon: SlidersVertical, content: <SetpointPanel embedded items={farmSetpoints} values={setpoints} onChange={(key, value) => setSetpoints((current) => ({ ...current, [key]: value }))} /> },
            ]}
          />
          <TabWidget
            title="Pump & Power"
            icon={PlugZap}
            tint="light"
            action={<Pill tone={supply.tone}>{supply.label}</Pill>}
            tabs={[
              { id: "supply", label: "3-Phase", icon: PlugZap, content: <SupplyPanel feed={power} /> },
              { id: "energy", label: "Energy", icon: Gauge, content: <EnergyPanel feed={power} /> },
              { id: "protection", label: "Protection", icon: ShieldCheck, content: <ProtectionPanel feed={power} /> },
            ]}
          />
        </div>
      </section>

      <section aria-label="Fertigation">
        <FertigationBoard />
      </section>

      <section aria-label="Trends and alerts">
        <SectionHeader icon={ChartLine} title="Trends & Alerts" detail="Recent history for the field and open farm alerts" />
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {charts.map((chart) => (
            <TrendChart key={chart.id} {...chart} />
          ))}
          <AlertList items={farmAlerts} className="lg:col-span-2" />
        </div>
      </section>
    </DashboardPage>
  );
}
