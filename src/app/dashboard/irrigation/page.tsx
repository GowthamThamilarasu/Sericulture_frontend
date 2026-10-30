"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, ChartLine, Clock, Droplets, Gauge, History, Target, Waves } from "lucide-react";

import { Widget } from "@/components/dashboard/dashboard-widgets";
import { SectionHeader, SetpointPanel, farmSetpoints, reading } from "@/components/dashboard/monitor-widgets";
import { SchedulerPanel, VolumePanel, useIrrigationPlan } from "@/components/dashboard/irrigation-planner";
import { DashboardPage, InfoRow, PageHeader, Pill, StatTile, TabWidget, TrendChart } from "@/components/dashboard/page-kit";
import { SoilMoistureIcon } from "@/components/dashboard/sensor-icons";
import { ValveControl } from "@/components/dashboard/valve-control";
import { WaterSourceButton } from "@/components/dashboard/water-sources";
import { irrigationHistory, irrigationSessions } from "@/data/mock";

export default function IrrigationPage() {
  const [setpoints, setSetpoints] = useState(() => Object.fromEntries(farmSetpoints.map((item) => [item.key, item.value])));
  const soil = reading("Soil Moisture");
  const plan = useIrrigationPlan();

  return (
    <DashboardPage tint="water">
      <PageHeader icon={Waves} eyebrow="Irrigation" title="Water delivery and schedule control" detail="Pump, field valves, watering schedules and soil moisture targets" />

      <section aria-label="Irrigation status">
        <SectionHeader icon={Gauge} title="Status" detail="Where the field is against its moisture target" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <StatTile label="Soil Moisture" value={soil?.value ?? "–"} unit="%" icon={SoilMoistureIcon} note={soil?.location} />
          <StatTile label="Target Moisture" value={setpoints.soil} unit="%" icon={Target} note="From the set point below" />
          <StatTile label="Flow" value="4.1" unit="L/min" icon={Gauge} />
          <StatTile label="Next Recommended" value="17:45" icon={CalendarClock} tone="info" note="Today" />
          <WaterSourceButton />
        </div>
      </section>

      <section aria-label="Irrigation controls">
        <SectionHeader icon={Droplets} title="Controls" detail="Run the pump and valves, and set the targets automation works to" />
        <div className="grid items-start gap-4 xl:grid-cols-3">
          <ValveControl className="xl:col-span-2" />
          <SetpointPanel items={farmSetpoints} values={setpoints} onChange={(key, value) => setSetpoints((current) => ({ ...current, [key]: value }))} />
        </div>
      </section>

      <section aria-label="Irrigation schedule">
        <SectionHeader icon={CalendarClock} title="Schedule" detail="When each valve waters and how much · changes are shared with the Farm Monitor" />
        <TabWidget
          title="Scheduler"
          icon={CalendarClock}
          tabs={[
            { id: "schedule", label: "Scheduler", icon: CalendarClock, content: <SchedulerPanel plan={plan} /> },
            { id: "volume", label: "Volume", icon: Droplets, content: <VolumePanel plan={plan} /> },
          ]}
        />
      </section>

      <section aria-label="Irrigation history">
        <SectionHeader icon={ChartLine} title="History" detail="Today's soil moisture and recent irrigation runs" />
        <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
          <TrendChart id="irrigationMoisture" title="Soil Moisture" unit="%" data={irrigationHistory} tone="info" icon={SoilMoistureIcon} />
          <Widget title="Session Summary" icon={Clock}>
            <InfoRow label="Flow" value="4.1 L/min" icon={Gauge} />
            <InfoRow label="Water used today" value="420 L" icon={Droplets} />
            <InfoRow label="Last irrigation" value="08:15" icon={History} />
            <InfoRow label="Next recommended" value="Today 17:45" icon={CalendarClock} tone="info" />
          </Widget>
          <Widget title="Recent Sessions" icon={History} className="lg:col-span-2">
            <div className="grid gap-3 md:grid-cols-3">
              {irrigationSessions.map((session) => (
                <div key={session.id} className="rounded-md bg-[var(--d-inset)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--d-muted)]">{session.start}</div>
                    <Pill>
                      <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
                      {session.status}
                    </Pill>
                  </div>
                  <div className="mt-2 text-xl font-bold text-[var(--d-accent)]">{session.duration}</div>
                  <div className="text-xs text-[var(--d-muted)]">{session.waterUsed} L delivered</div>
                </div>
              ))}
            </div>
          </Widget>
        </div>
      </section>
    </DashboardPage>
  );
}
