"use client";

import { FlaskConical, MapPin, Sprout, Warehouse } from "lucide-react";

import { ClimateStatusIcons } from "@/components/dashboard/climate-control";
import { FertigationBoard } from "@/components/dashboard/fertigation-board";
import { HistoryProvider } from "@/components/dashboard/history-dialog";
import { SectionHeader, SetpointsLink, formatCoordinate, reading } from "@/components/dashboard/monitor-widgets";
import { SensorChipGrid, farmSensorChips, overviewGrid, shedSensorChips } from "@/components/dashboard/sensor-chip";
import { ValveStatusStrip } from "@/components/dashboard/valve-control";
import { demoFarm, demoShed } from "@/data/mock";

const shedChips = shedSensorChips();
const farmChips = farmSensorChips();

export default function DashboardHomePage() {
  const soil = reading("Soil Moisture");

  return (
    <HistoryProvider>
      <div className="page-plant -m-4 min-h-[calc(100vh-65px)] bg-[var(--d-page)] p-4 text-[var(--d-text)] md:-m-6 md:p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg dash-card border border-[var(--d-card-border)] bg-[var(--d-banner)] px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold text-[var(--d-text)]">{demoFarm.name}</h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--d-muted)]">
              <a
                href={`https://www.google.com/maps?q=${demoFarm.latitude},${demoFarm.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Google Maps"
                className="inline-flex items-center gap-1 font-semibold tabular-nums text-[var(--d-accent)] hover:underline"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {formatCoordinate(demoFarm.latitude, "N", "S")}, {formatCoordinate(demoFarm.longitude, "E", "W")}
              </a>
              <span>
                · {demoFarm.acres} acres · {demoShed.name} · {demoShed.instar}
              </span>
            </div>
          </div>
          <span className="rounded-full bg-[var(--d-warn-soft)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-warn)]">Demo / Simulated Data</span>
        </header>

        {/* Three columns on wide screens: Shed, Farm and Fertigation. Two on laptops (Fertigation below), one on phones. */}
        <div className="grid items-start gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <section aria-label="Shed monitoring" className="min-w-0">
            <SectionHeader icon={Warehouse} title="Shed" detail={`Silkworm rearing · ${demoShed.name} · ${demoShed.instar}`} />
            <div className="grid gap-3">
              <SensorChipGrid items={shedChips} className={overviewGrid} size="sm" />
              <ClimateStatusIcons />
            </div>
          </section>

          <section aria-label="Farm monitoring" className="min-w-0">
            <SectionHeader icon={Sprout} title="Farm" detail={`Mulberry field · ${soil?.location ?? "Block A"} · ${demoFarm.acres} acres`} />
            <div className="grid gap-3">
              <SensorChipGrid items={farmChips} className={overviewGrid} size="sm" />
              <ValveStatusStrip />
            </div>
          </section>

          <section aria-label="Fertigation" className="min-w-0 lg:col-span-2 xl:col-span-1">
            <SectionHeader icon={FlaskConical} title="Fertigation" detail="Live nutrient readings · active recipe" action={<SetpointsLink area="fertigation" />} />
            <FertigationBoard compact />
          </section>
        </div>
      </div>
    </HistoryProvider>
  );
}
