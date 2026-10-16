"use client";

import { useState } from "react";
import { Beaker, BookOpenCheck, Container, Gauge, RotateCw, Target, Zap } from "lucide-react";

import { Widget } from "@/components/dashboard/dashboard-widgets";
import { FertigationBoard } from "@/components/dashboard/fertigation-board";
import { SectionHeader } from "@/components/dashboard/monitor-widgets";
import { ControlRow, DashboardPage, InfoRow, PageHeader, Pill, StatTile, buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";
import { WaterLevelIcon } from "@/components/dashboard/sensor-icons";
import { fertigationSessions } from "@/data/mock";

const devices = [
  { name: "Dose Pump", icon: Gauge, status: "Standby" },
  { name: "Mixing Tank", icon: Beaker, status: "Balanced" },
  { name: "Agitator", icon: RotateCw, status: "Idle" },
  { name: "Tank Filling Valve", icon: WaterLevelIcon, status: "Tank 72%" },
];

export default function FertigationPage() {
  const [active, setActive] = useState(fertigationSessions[0].id);
  const recipe = fertigationSessions.find((session) => session.id === active) ?? fertigationSessions[0];

  return (
    <DashboardPage tint="nutrient">
      <PageHeader icon={Gauge} eyebrow="Fertigation" title="Nutrient dosing and EC control" detail={`Active recipe: ${recipe.recipe}`} />

      <section aria-label="Dosing status">
        <SectionHeader icon={Zap} title="Status" detail="Nutrient solution against the active recipe" />
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatTile label="Current EC" value="0.72" unit="mS/cm" icon={Zap} tone="warn" note="Below target" />
          <StatTile label="Target EC" value={recipe.ecTarget} unit="mS/cm" icon={Target} />
          <StatTile label="Dose" value={recipe.dose} unit="mL" icon={Beaker} />
          <StatTile label="Recipe Status" value={recipe.status} icon={BookOpenCheck} />
        </div>
      </section>

      <section aria-label="Live nutrient readings">
        <FertigationBoard />
      </section>

      <section aria-label="Dosing controls">
        <SectionHeader icon={Container} title="Controls" detail="Dosing equipment and approved recipes" />
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Widget title="Control Devices" icon={Container}>
            <div className="space-y-3">
              {devices.map((device) => (
                <ControlRow key={device.name} {...device} />
              ))}
            </div>
          </Widget>

          <Widget title="Approved Recipes" icon={BookOpenCheck}>
            <div className="space-y-3">
              {fertigationSessions.map((session) => {
                const selected = session.id === active;
                return (
                  <div key={session.id} className={`rounded-md bg-[var(--d-inset)] p-3 ${selected ? "ring-2 ring-[var(--d-accent)]" : ""}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-[var(--d-text)]">{session.recipe}</div>
                      <Pill tone={session.status === "Ready" ? "accent" : "info"}>{session.status}</Pill>
                    </div>
                    <InfoRow label="Target EC" value={`${session.ecTarget} mS/cm`} icon={Target} />
                    <InfoRow label="Dose" value={`${session.dose} mL`} icon={Beaker} />
                    <button type="button" onClick={() => setActive(session.id)} disabled={selected} className={`mt-2 ${selected ? buttonSecondary : buttonPrimary}`}>
                      {selected ? "Active recipe" : "Use this recipe"}
                    </button>
                  </div>
                );
              })}
            </div>
          </Widget>
        </div>
      </section>
    </DashboardPage>
  );
}
