"use client";

import { Activity, Bot, BrushCleaning, Cpu, HeartPulse, Layers, Leaf, ShieldCheck, ShieldAlert, Skull, Utensils, Wind } from "lucide-react";

import { Widget } from "@/components/dashboard/dashboard-widgets";
import { SectionHeader } from "@/components/dashboard/monitor-widgets";
import { DashboardPage, PageHeader, Pill, StatTile, type Tone } from "@/components/dashboard/page-kit";
import { Co2Icon, HumidityIcon, Nh3Icon, TemperatureIcon } from "@/components/dashboard/sensor-icons";
import { silkwormBatch } from "@/data/mock";

const riskTone: Tone = silkwormBatch.riskZone >= 60 ? "danger" : silkwormBatch.riskZone >= 30 ? "warn" : "accent";
const stressTone: Tone = silkwormBatch.stressRisk === "High" ? "danger" : silkwormBatch.stressRisk === "Moderate" ? "warn" : "accent";

const environment = [
  { label: "Temperature", value: silkwormBatch.temperature, unit: "°C", icon: TemperatureIcon },
  { label: "Humidity", value: silkwormBatch.humidity, unit: "%", icon: HumidityIcon },
  { label: "NH₃", value: silkwormBatch.nh3, unit: "ppm", icon: Nh3Icon, tone: "warn" as Tone },
  { label: "CO₂", value: silkwormBatch.co2, unit: "ppm", icon: Co2Icon },
  { label: "Ventilation", value: silkwormBatch.ventilation, icon: Wind, tone: "warn" as Tone },
];

const care = [
  { label: "Feeding", value: silkwormBatch.feeding, icon: Utensils },
  { label: "Bed Condition", value: silkwormBatch.bedCondition, icon: Layers },
  { label: "Cleaning", value: silkwormBatch.cleaning, icon: BrushCleaning },
  { label: "Mortality", value: silkwormBatch.mortality, icon: Skull },
  { label: "Mulberry Quality", value: silkwormBatch.mulberryQuality, icon: Leaf },
];

const reasons = ["RH increasing", "NH₃ increasing", "Ventilation insufficient"];

export default function SilkwormPage() {
  return (
    <DashboardPage tint="light">
      <PageHeader icon={ShieldCheck} eyebrow="Silkworm Monitor" title="Batch condition and risk overview" detail={`Batch ${silkwormBatch.id} · ${silkwormBatch.instar} instar`} badge="Demo AI Insight" />

      <section aria-label="Batch status">
        <SectionHeader icon={HeartPulse} title="Batch Status" detail="Condition and risk scored from the shed readings" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Current Instar" value={silkwormBatch.instar} icon={Layers} />
          <StatTile label="Overall Condition" value={silkwormBatch.condition} icon={HeartPulse} />
          <Widget title="Risk Zone" icon={ShieldAlert}>
            <div className="text-2xl font-bold" style={{ color: `var(--d-${riskTone})` }}>
              {silkwormBatch.riskZone}
              <span className="ml-1 text-xs font-medium text-[var(--d-muted)]">/ 100</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--d-track)]" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={silkwormBatch.riskZone} aria-label="Risk zone score">
              <div className="h-full rounded-full" style={{ width: `${silkwormBatch.riskZone}%`, backgroundColor: `var(--d-${riskTone})` }} />
            </div>
          </Widget>
          <StatTile label="Stress Risk" value={silkwormBatch.stressRisk} icon={Activity} tone={stressTone} />
        </div>
      </section>

      <section aria-label="AI insight">
        <Widget title="AI Insight Summary" icon={Bot} action={<Pill tone="warn">Demo</Pill>}>
          <p className="text-sm leading-6 text-[var(--d-soft)]">
            Overall condition is <strong className="text-[var(--d-text)]">{silkwormBatch.condition.toLowerCase()}</strong> with a risk zone score of{" "}
            <strong className="text-[var(--d-text)]">{silkwormBatch.riskZone} / 100</strong> and <strong style={{ color: `var(--d-${stressTone})` }}>{silkwormBatch.stressRisk.toLowerCase()}</strong> stress risk.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {reasons.map((reason) => (
              <Pill key={reason} tone="warn">
                {reason}
              </Pill>
            ))}
          </div>
        </Widget>
      </section>

      <section aria-label="Rearing environment">
        <SectionHeader icon={Cpu} title="Rearing Environment" detail="Shed conditions the batch is living in" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {environment.map((item) => (
            <StatTile key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section aria-label="Care and health">
        <SectionHeader icon={Utensils} title="Care & Health" detail="Feeding, bed hygiene and losses" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {care.map((item) => (
            <StatTile key={item.label} {...item} />
          ))}
        </div>
      </section>
    </DashboardPage>
  );
}
