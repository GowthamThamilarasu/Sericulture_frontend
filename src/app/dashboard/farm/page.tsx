"use client";

import { Activity, CalendarClock, ChartLine, CircleGauge, CloudRain, CloudSun, Droplets, Faucet, Gauge, PlugZap, Settings2, ShieldCheck, Sprout, Waves } from "lucide-react";

import { FarmDeviceManager } from "@/components/dashboard/farm-setup";
import { EnergyPanel, ProtectionPanel, SupplyPanel, supplyStatus, usePowerFeed } from "@/components/dashboard/farm-power";
import { FertigationBoard } from "@/components/dashboard/fertigation-board";
import { SchedulerPanel, VolumePanel, useIrrigationPlan } from "@/components/dashboard/irrigation-planner";
import { AlertList, SectionHeader, SetpointsLink, farmAlerts, reading } from "@/components/dashboard/monitor-widgets";
import { DashboardPage, PageHeader, Pill, TabWidget, TrendChart, type TrendSeries } from "@/components/dashboard/page-kit";
import { SensorChipGrid, type SensorChipProps, farmSensorChips } from "@/components/dashboard/sensor-chip";
import { SoilEcIcon, SoilMoistureIcon, TemperatureIcon, WaterLevelIcon } from "@/components/dashboard/sensor-icons";
import { ValveControl } from "@/components/dashboard/valve-control";
import { demoFarm, ecHistory, soilMoistureHistory, temperatureHistory, waterLevelHistory } from "@/data/mock";

// Field readings with no history or set point: water quality, flow, line pressure and weather.
const fieldStatus: SensorChipProps[] = [
  { label: "Water Temp.", value: "26.1", unit: "°C", icon: TemperatureIcon, tint: "heat", status: "Normal", note: "Supply water" },
  { label: "Water EC", value: "0.65", unit: "mS/cm", icon: Activity, tint: "nutrient", status: "Normal", note: "Supply water" },
  { label: "Flow Meter", value: "4.1", unit: "L/min", icon: Gauge, tint: "water", motion: "tick", status: "Normal", note: "Main line" },
  { label: "Line Pressure", value: "1.8", unit: "bar", icon: CircleGauge, tint: "air", motion: "tick", status: "Normal", note: "Irrigation line" },
  { label: "Rain", value: "No", icon: CloudRain, tint: "water", note: "Rain sensor" },
  { label: "Weather", value: "Mild", icon: CloudSun, tint: "light", note: "Local forecast" },
];

const fieldChips = [...farmSensorChips(), ...fieldStatus];

const charts: TrendSeries[] = [
  { id: "farmMoisture", title: "Soil Moisture", unit: "%", data: soilMoistureHistory, tone: "accent", icon: SoilMoistureIcon },
  { id: "farmTemperature", title: "Temperature", unit: "°C", data: temperatureHistory, tone: "warn", icon: TemperatureIcon },
  { id: "farmEc", title: "Soil EC", unit: "mS/cm", data: ecHistory, tone: "accent", icon: SoilEcIcon },
  { id: "farmWaterLevel", title: "Water Level", unit: "%", data: waterLevelHistory, tone: "info", icon: WaterLevelIcon },
];

export default function FarmMonitorPage() {
  const plan = useIrrigationPlan();
  const power = usePowerFeed();
  const supply = supplyStatus(power);
  const block = reading("Soil Moisture")?.location ?? "Block A";

  return (
    <DashboardPage tint="plant">
      <PageHeader icon={Sprout} eyebrow="Farm Monitor" title="Field condition overview" detail={`${demoFarm.name} · Mulberry field · ${block} · ${demoFarm.acres} acres`} />

      <section aria-label="Field sensors">
        <SectionHeader icon={SoilMoistureIcon} title="Field Sensors" detail={`Live soil and water readings · ${block} · tap a card for its history`} action={<SetpointsLink area="irrigation" />} />
        <SensorChipGrid items={fieldChips} />
      </section>

      <section aria-label="Irrigation controls">
        <SectionHeader icon={Waves} title="Irrigation Controls" detail="Pumps, valves, schedules and water volumes · add or remove pumps and valves under Add / remove" />
        <div className="grid gap-4">
          <TabWidget
            title="Irrigation"
            icon={Waves}
            tabs={[
              { id: "valves", label: "Pump & Valves", icon: Faucet, content: <ValveControl embedded />, keepMounted: true },
              { id: "setup", label: "Add / remove", icon: Settings2, content: <FarmDeviceManager /> },
              { id: "schedule", label: "Scheduler", icon: CalendarClock, content: <SchedulerPanel plan={plan} /> },
              { id: "volume", label: "Volume", icon: Droplets, content: <VolumePanel plan={plan} /> },
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
