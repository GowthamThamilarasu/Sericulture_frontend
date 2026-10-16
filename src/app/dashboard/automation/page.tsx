"use client";

import { Beaker, Blinds, CloudDrizzle, Droplets, Fan, Faucet, FlaskConical, Heater, Lightbulb, PanelTop, RotateCw, Snowflake, Warehouse, Waves, Wind, Zap } from "lucide-react";

import { controllerModes, useControllerModes } from "@/components/dashboard/controller-mode";
import { type Icon, Widget } from "@/components/dashboard/dashboard-widgets";
import { SectionHeader } from "@/components/dashboard/monitor-widgets";
import { ControlRow, DashboardPage, PageHeader, StatTile } from "@/components/dashboard/page-kit";
import { WaterLevelIcon } from "@/components/dashboard/sensor-icons";

const groups: { group: string; icon: Icon; items: { name: string; icon: Icon }[] }[] = [
  {
    group: "Irrigation",
    icon: Waves,
    items: [
      { name: "Water Pump", icon: Waves },
      { name: "Solenoid Valve", icon: Faucet },
      { name: "Drip Irrigation", icon: Droplets },
    ],
  },
  {
    group: "Fertigation",
    icon: FlaskConical,
    items: [
      { name: "Dose Pump", icon: FlaskConical },
      { name: "Mixing Tank", icon: Beaker },
      { name: "Agitator", icon: RotateCw },
      { name: "Tank Filling Valve", icon: WaterLevelIcon },
    ],
  },
  {
    group: "Shed",
    icon: Warehouse,
    items: [
      { name: "Exhaust Fans", icon: Fan },
      { name: "Circulation Fans", icon: Wind },
      { name: "Foggers", icon: CloudDrizzle },
      { name: "Humidifier", icon: CloudDrizzle },
      { name: "Heater", icon: Heater },
      { name: "Cooling", icon: Snowflake },
      { name: "Motorized Ventilation", icon: PanelTop },
      { name: "Lights", icon: Lightbulb },
      { name: "Curtains", icon: Blinds },
      { name: "Louvers", icon: Blinds },
    ],
  },
];

const allDevices = groups.flatMap((group) => group.items.map((item) => item.name));

export default function AutomationCenterPage() {
  const modes = useControllerModes(allDevices);
  const counts = Object.fromEntries(controllerModes.map((mode) => [mode.value, modes.filter((value) => value === mode.value).length]));

  return (
    <DashboardPage tint="slate">
      <PageHeader icon={Zap} eyebrow="Automation Center" title="Review and approve automation actions" detail={`${allDevices.length} controllable devices across the farm and shed`} />

      <section aria-label="Mode summary">
        <SectionHeader icon={Zap} title="Control Modes" detail="How many devices run in each mode" />
        <div className="grid gap-4 sm:grid-cols-3">
          {controllerModes.map((mode) => (
            <StatTile key={mode.value} label={mode.label} value={counts[mode.value]} unit="devices" icon={mode.icon} tone={mode.value === "manual" ? "warn" : "accent"} note={mode.detail} />
          ))}
        </div>
      </section>

      <section aria-label="Devices">
        <SectionHeader icon={Fan} title="Devices" detail="Choose how each device is run: Auto, Semi or Manual" />
        <div className="grid items-start gap-4 lg:grid-cols-3">
          {groups.map((group) => (
            <Widget key={group.group} title={group.group} icon={group.icon}>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <ControlRow key={item.name} name={item.name} icon={item.icon} status="Last action 2h ago" />
                ))}
              </div>
            </Widget>
          ))}
        </div>
      </section>
    </DashboardPage>
  );
}
