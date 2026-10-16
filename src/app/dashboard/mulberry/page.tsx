"use client";

import { Bug, Droplets, FlaskConical, Layers, Leaf, Palette, Ruler, Shovel, Sprout, TrendingUp } from "lucide-react";

import { Widget } from "@/components/dashboard/dashboard-widgets";
import { SectionHeader } from "@/components/dashboard/monitor-widgets";
import { tintClass } from "@/components/dashboard/tints";
import { DashboardPage, PageHeader, Pill, StatTile } from "@/components/dashboard/page-kit";
import { farmPlots, mulberryPlots } from "@/data/mock";

const traits = [
  { key: "leafSize", label: "Leaf Size", icon: Ruler },
  { key: "leafColour", label: "Leaf Colour", icon: Palette },
  { key: "leafDensity", label: "Leaf Density", icon: Layers },
  { key: "visibleDamage", label: "Visible Damage", icon: Bug },
  { key: "growthVariation", label: "Growth Variation", icon: TrendingUp },
  { key: "soilCondition", label: "Soil Condition", icon: Shovel },
  { key: "irrigation", label: "Irrigation", icon: Droplets },
  { key: "fertilization", label: "Fertilization", icon: FlaskConical },
] as const;

export default function MulberryPage() {
  return (
    <DashboardPage tint="plant">
      <PageHeader icon={Leaf} eyebrow="Mulberry" title="Variety performance and growth condition" detail={`${farmPlots.length} blocks · ${farmPlots.reduce((sum, plot) => sum + plot.area, 0)} acres under mulberry`} />

      <section aria-label="Field blocks">
        <SectionHeader icon={Sprout} title="Field Blocks" detail="Variety, area and soil moisture per block" />
        <div className="grid gap-4 sm:grid-cols-3">
          {farmPlots.map((plot) => (
            <StatTile key={plot.id} label={`${plot.name} · ${plot.variety}`} value={plot.soilMoisture} unit="% moisture" icon={Sprout} tone={plot.health === "Healthy" ? "accent" : "warn"} note={`${plot.area} acres · ${plot.health}`} />
          ))}
        </div>
      </section>

      <section aria-label="Variety performance">
        <SectionHeader icon={Leaf} title="Variety Performance" detail="Leaf and growth observations per variety" />
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {mulberryPlots.map((plot) => (
            <Widget key={plot.id} title={plot.variety} icon={Leaf} action={<Pill>{plot.growthStage}</Pill>}>
              <div className="grid gap-3 sm:grid-cols-2">
                {traits.map((trait) => (
                  <div key={trait.key} className={`flex items-center gap-3 rounded-md border border-[var(--d-card-border)] bg-[var(--d-card)] p-3 ${tintClass(trait.icon)}`}>
                    <trait.icon className="h-4 w-4 shrink-0 text-[var(--d-tint,var(--d-accent))]" aria-hidden="true" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--d-muted)]">{trait.label}</div>
                      <div className="text-sm font-semibold text-[var(--d-text)]">{plot[trait.key]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Widget>
          ))}
        </div>
      </section>
    </DashboardPage>
  );
}
