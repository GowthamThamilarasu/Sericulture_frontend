"use client";

import { BookOpen, Bug, Layers, Leaf, MapPin, Thermometer } from "lucide-react";

import { Widget } from "@/components/dashboard/dashboard-widgets";
import { SectionHeader } from "@/components/dashboard/monitor-widgets";
import { tintClass } from "@/components/dashboard/tints";
import { DashboardPage, InfoRow, PageHeader, Pill } from "@/components/dashboard/page-kit";
import { Co2Icon, HumidityIcon, LightSensorIcon, Nh3Icon, TemperatureIcon, WaterLevelIcon } from "@/components/dashboard/sensor-icons";
import { instarStages, knowledgeSections } from "@/data/mock";

const parameters = [
  { label: "Temperature", icon: TemperatureIcon },
  { label: "Relative humidity", icon: HumidityIcon },
  { label: "CO₂", icon: Co2Icon },
  { label: "NH₃", icon: Nh3Icon },
  { label: "Light", icon: LightSensorIcon },
  { label: "Water level", icon: WaterLevelIcon },
];

export default function KnowledgePage() {
  return (
    <DashboardPage tint="soil">
      <PageHeader icon={BookOpen} eyebrow="Knowledge Center" title="Instar and varietal reference library" detail="Operating ranges and varieties used across the farm" badge={null} />

      <section aria-label="Rearing reference">
        <SectionHeader icon={Layers} title="Rearing Reference" detail="Target ranges for each instar" />
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Widget title="Instar Management" icon={Layers}>
            <div className="space-y-3">
              {instarStages.map((stage) => (
                <div key={stage.stage} className="rounded-md bg-[var(--d-inset)] px-3 py-2">
                  <div className="text-sm font-semibold text-[var(--d-text)]">{stage.stage}</div>
                  <div className="text-xs text-[var(--d-muted)]">{stage.description}</div>
                  <InfoRow label="Temperature" value={stage.temperature} icon={TemperatureIcon} />
                  <InfoRow label="Humidity" value={stage.humidity} icon={HumidityIcon} />
                </div>
              ))}
            </div>
          </Widget>

          <Widget title="Environmental Parameters" icon={Thermometer}>
            <p className="text-sm leading-6 text-[var(--d-soft)]">Each of these is managed within documented operating ranges for the current instar, along with ventilation.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {parameters.map((item) => (
                <div key={item.label} className={`flex items-center gap-2 rounded-md border border-[var(--d-card-border)] bg-[var(--d-card)] p-3 text-sm font-medium text-[var(--d-text)] ${tintClass(item.icon)}`}>
                  <item.icon className="h-4 w-4 shrink-0 text-[var(--d-tint,var(--d-accent))]" aria-hidden="true" />
                  {item.label}
                </div>
              ))}
            </div>
          </Widget>
        </div>
      </section>

      <section aria-label="Varieties">
        <SectionHeader icon={Leaf} title="Varieties" detail="Mulberry and silkworm varieties in use" />
        <div className="grid items-start gap-4 md:grid-cols-2">
          <Widget title="Mulberry Varieties" icon={Leaf}>
            <div className="flex flex-wrap gap-2">
              {knowledgeSections.mulberry.map((variety) => (
                <Pill key={variety}>{variety}</Pill>
              ))}
            </div>
          </Widget>

          <Widget title="Silkworm Varieties" icon={Bug}>
            <div className="flex flex-wrap gap-2">
              {knowledgeSections.silkworm.map((type) => (
                <Pill key={type} tone="info">
                  {type}
                </Pill>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Common in Tamil Nadu
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {knowledgeSections.tamilNadu.map((type) => (
                <Pill key={type} tone="warn">
                  {type}
                </Pill>
              ))}
            </div>
          </Widget>
        </div>
      </section>
    </DashboardPage>
  );
}
