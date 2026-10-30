"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bug,
  CalendarClock,
  ClipboardList,
  Droplets,
  FlaskConical,
  Layers,
  Leaf,
  Palette,
  Pencil,
  Pill as PillIcon,
  Plus,
  Ruler,
  ScanSearch,
  Scissors,
  ShieldCheck,
  Shovel,
  Sprout,
  TestTube,
  TrendingUp,
} from "lucide-react";

import { formatDate, useToday } from "@/components/dashboard/batch-store";
import { type Icon, Widget } from "@/components/dashboard/dashboard-widgets";
import { ActivityDialog, BlockDialog, LeafScan, activityTypes, fieldClass } from "@/components/dashboard/mulberry-forms";
import { addDays, daysBetween, feedingSafety, nextManuring, useMulberry } from "@/components/dashboard/mulberry-store";
import { SectionHeader } from "@/components/dashboard/monitor-widgets";
import { tintClass } from "@/components/dashboard/tints";
import { DashboardPage, PageHeader, Pill, StatTile, type Tone, ViewTabs, buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";
import { mulberryPlots } from "@/data/mock";
import type { FieldActivity, FieldActivityType, MulberryBlock } from "@/types";

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

const typeIcon: Record<FieldActivityType, Icon> = {
  Manuring: Shovel,
  Medication: PillIcon,
  "Pest control": Bug,
  Defect: AlertTriangle,
  Pruning: Scissors,
  Weeding: Sprout,
  "Leaf harvest": Leaf,
  Irrigation: Droplets,
  "Soil test": TestTube,
  Other: ClipboardList,
};
const severityTone: Record<string, Tone> = { Low: "accent", Moderate: "warn", High: "danger" };

type Editing = { kind: "block"; block: MulberryBlock | null } | { kind: "activity"; activity: FieldActivity | null; type?: FieldActivityType } | null;

function BlockCard({ block, activities, today, onEdit }: { block: MulberryBlock; activities: FieldActivity[]; today: string; onEdit: () => void }) {
  const manuring = nextManuring(block, activities);
  const dueIn = manuring.due ? daysBetween(today, manuring.due) : null;
  const facts = [
    { label: "Area", value: `${block.area} acres` },
    { label: "Irrigation", value: block.irrigation },
    { label: "Planting", value: block.plantingSystem },
    { label: "Planted", value: formatDate(block.plantedOn) },
  ];
  return (
    <button type="button" onClick={onEdit} className="dash-card group flex flex-col rounded-xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-4 text-left transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-md">
      <span className="flex w-full items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block text-base font-bold text-[var(--d-text)]">{block.name}</span>
          <span className="block truncate text-sm font-semibold text-[var(--d-accent)]">{block.variety}</span>
        </span>
        <Pencil className="h-4 w-4 shrink-0 text-[var(--d-muted)] opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      </span>
      <span className="mt-3 grid grid-cols-2 gap-2">
        {facts.map((fact) => (
          <span key={fact.label} className="min-w-0 rounded-lg bg-[var(--d-inset)] px-2.5 py-2">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">{fact.label}</span>
            <span className="block truncate text-xs font-semibold text-[var(--d-text)]" title={fact.value}>
              {fact.value}
            </span>
          </span>
        ))}
      </span>
      <span className="mt-3 flex items-center gap-2 border-t border-[var(--d-line)] pt-3 text-xs">
        <Shovel className="h-3.5 w-3.5 shrink-0 text-[var(--d-accent)]" aria-hidden="true" />
        <span className="text-[var(--d-soft)]">Next manuring</span>
        <span className={`ml-auto font-semibold ${dueIn !== null && dueIn < 0 ? "text-[var(--d-warn)]" : "text-[var(--d-text)]"}`}>
          {manuring.due ? `${formatDate(manuring.due)}${dueIn !== null && dueIn < 0 ? ` · ${-dueIn} d overdue` : dueIn === 0 ? " · today" : ""}` : "Not logged yet"}
        </span>
      </span>
    </button>
  );
}

function FeedingSafety({ blocks, activities, today }: { blocks: MulberryBlock[]; activities: FieldActivity[]; today: string }) {
  return (
    <Widget title="Leaf Feeding Safety" icon={ShieldCheck}>
      <p className="mb-3 text-xs text-[var(--d-muted)]">Leaf from a sprayed block is unsafe for silkworms until the product&apos;s waiting period has passed.</p>
      <div className="space-y-2">
        {blocks.map((block) => {
          const safety = feedingSafety(block, activities, today);
          return (
            <div key={block.id} className="flex items-center gap-3 rounded-lg bg-[var(--d-inset)] p-3" style={{ borderLeft: `3px solid ${safety.safe ? "var(--d-accent)" : "var(--d-danger)"}` }}>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[var(--d-text)]">{block.name}</div>
                <div className="truncate text-[11px] text-[var(--d-muted)]">
                  {safety.spray ? `${safety.spray.product ?? safety.spray.title} · ${formatDate(safety.spray.date)} · ${safety.spray.waitDays} d wait` : "No sprays logged"}
                </div>
              </div>
              {safety.safe ? <Pill>Safe to feed</Pill> : <Pill tone="danger">{`Wait ${safety.daysLeft} d · ${formatDate(safety.safeFrom)}`}</Pill>}
            </div>
          );
        })}
      </div>
    </Widget>
  );
}

function Upcoming({ blocks, activities, today, onOpen }: { blocks: MulberryBlock[]; activities: FieldActivity[]; today: string; onOpen: (activity: FieldActivity) => void }) {
  const name = (id: string) => (id === "all" ? "All blocks" : (blocks.find((block) => block.id === id)?.name ?? "Removed block"));
  const planned = activities.filter((item) => item.status === "Planned").map((item) => ({ key: item.id, date: item.date, label: item.title, type: item.type, block: name(item.blockId), activity: item as FieldActivity | null }));
  const manuring = blocks
    .map((block) => ({ block, next: nextManuring(block, activities) }))
    .filter(({ next }) => next.due && !next.planned)
    .map(({ block, next }) => ({ key: `due-${block.id}`, date: next.due as string, label: `Manuring due (every ${block.manuringEveryDays} d)`, type: "Manuring" as FieldActivityType, block: block.name, activity: null }));
  const items = [...planned, ...manuring].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);

  return (
    <Widget title="Upcoming" icon={CalendarClock}>
      {items.length === 0 ? (
        <div className="py-4 text-center text-xs text-[var(--d-muted)]">Nothing planned. Log an activity as Planned to see it here.</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const TypeIcon = typeIcon[item.type];
            const days = daysBetween(today, item.date);
            return (
              <button
                key={item.key}
                type="button"
                disabled={!item.activity}
                onClick={() => item.activity && onOpen(item.activity)}
                className="flex w-full items-center gap-3 rounded-lg bg-[var(--d-inset)] p-2.5 text-left enabled:hover:bg-[var(--d-chip)]"
              >
                <TypeIcon className="h-4 w-4 shrink-0 text-[var(--d-accent)]" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[var(--d-text)]">{item.label}</span>
                  <span className="block text-[11px] text-[var(--d-muted)]">
                    {item.block} · {formatDate(item.date)}
                  </span>
                </span>
                <span className={`shrink-0 text-xs font-semibold ${days < 0 ? "text-[var(--d-warn)]" : "text-[var(--d-soft)]"}`}>{days < 0 ? `${-days} d late` : days === 0 ? "Today" : `in ${days} d`}</span>
              </button>
            );
          })}
        </div>
      )}
    </Widget>
  );
}

// Latest defect records, with the leaf photo and AI finding when there is one.
function DefectRecords({ blocks, activities, onOpen, onAll }: { blocks: MulberryBlock[]; activities: FieldActivity[]; onOpen: (activity: FieldActivity) => void; onAll: () => void }) {
  const defects = activities.filter((item) => item.type === "Defect");
  const name = (id: string) => (id === "all" ? "All blocks" : (blocks.find((block) => block.id === id)?.name ?? "Removed block"));
  return (
    <Widget
      title="Defect Records"
      icon={AlertTriangle}
      action={
        <button type="button" onClick={onAll} className="text-[11px] font-semibold text-[var(--d-accent)] hover:underline">
          All records
        </button>
      }
    >
      {defects.length === 0 ? (
        <div className="py-4 text-center text-xs text-[var(--d-muted)]">No defects recorded. Analysed leaves you save appear here.</div>
      ) : (
        <div className="space-y-2">
          {defects.slice(0, 5).map((item) => (
            <button key={item.id} type="button" onClick={() => onOpen(item)} className="flex w-full items-start gap-3 rounded-lg bg-[var(--d-inset)] p-2.5 text-left hover:bg-[var(--d-chip)]">
              {item.photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- local data URL
                <img src={item.photo} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--d-accent-soft)]">
                  <Leaf className="h-5 w-5 text-[var(--d-accent)]" aria-hidden="true" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-semibold text-[var(--d-text)]">{item.defect ?? item.title}</span>
                  {item.severity && <Pill tone={severityTone[item.severity]}>{`${item.severity}${item.affected !== undefined ? ` · ${item.affected}%` : ""}`}</Pill>}
                </span>
                <span className="block text-[11px] text-[var(--d-muted)]">
                  {name(item.blockId)} · {formatDate(item.date)}
                  {item.aiFinding && " · AI checked"}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </Widget>
  );
}

function ActivityLog({ blocks, activities, today, onOpen, onAdd }: { blocks: MulberryBlock[]; activities: FieldActivity[]; today: string; onOpen: (activity: FieldActivity) => void; onAdd: (type?: FieldActivityType) => void }) {
  const [type, setType] = useState<FieldActivityType | "All">("All");
  const [blockId, setBlockId] = useState("any");
  const name = (id: string) => (id === "all" ? "All blocks" : (blocks.find((block) => block.id === id)?.name ?? "Removed block"));
  const shown = activities.filter((item) => (type === "All" || item.type === type) && (blockId === "any" || item.blockId === blockId || item.blockId === "all"));
  const count = (value: FieldActivityType) => activities.filter((item) => item.type === value).length;

  return (
    <Widget
      title="Field Records"
      icon={ClipboardList}
      action={
        <button type="button" onClick={() => onAdd(type === "All" ? undefined : type)} className={buttonPrimary}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Log activity
        </button>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {(["Manuring", "Medication", "Pest control", "Defect"] as const).map((quick) => {
          const QuickIcon = typeIcon[quick];
          return (
            <button key={quick} type="button" onClick={() => onAdd(quick)} className={buttonSecondary}>
              <QuickIcon className="h-3.5 w-3.5" aria-hidden="true" /> {quick === "Defect" ? "Record defect" : `Add ${quick.toLowerCase()}`}
            </button>
          );
        })}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 gap-1 overflow-x-auto rounded-lg bg-[var(--d-chip)] p-1" role="tablist" aria-label="Filter by activity">
          {(["All", ...activityTypes] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={type === value}
              onClick={() => setType(value)}
              className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${type === value ? "accent-fill" : "text-[var(--d-muted)] hover:text-[var(--d-text)]"}`}
            >
              {value}
              {value !== "All" && count(value) > 0 && <span className="ml-1 opacity-70">{count(value)}</span>}
            </button>
          ))}
        </div>
        <select aria-label="Filter by block" value={blockId} onChange={(event) => setBlockId(event.target.value)} className={`${fieldClass} !w-auto !py-1.5`}>
          <option value="any">All blocks</option>
          {blocks.map((block) => (
            <option key={block.id} value={block.id}>
              {block.name}
            </option>
          ))}
        </select>
      </div>

      {shown.length === 0 ? (
        <div className="py-8 text-center text-xs text-[var(--d-muted)]">No records for this filter yet.</div>
      ) : (
        <ul className="divide-y divide-[var(--d-line)]">
          {shown.map((item) => {
            const TypeIcon = typeIcon[item.type];
            const safeFrom = item.waitDays ? addDays(item.date, item.waitDays) : null;
            const waiting = safeFrom !== null && item.status === "Done" && safeFrom > today;
            return (
              <li key={item.id}>
                <button type="button" onClick={() => onOpen(item)} className="flex w-full items-start gap-3 rounded-lg px-1 py-3 text-left transition-colors hover:bg-[var(--d-chip)]">
                  {item.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local data URL
                    <img src={item.photo} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--d-accent-soft)]">
                      <TypeIcon className="h-4 w-4 text-[var(--d-accent)]" aria-hidden="true" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold text-[var(--d-text)]">{item.title}</span>
                      <Pill tone="muted">{item.type}</Pill>
                      {item.status === "Planned" && <Pill tone="info">Planned</Pill>}
                      {item.severity && <Pill tone={severityTone[item.severity]}>{`${item.severity}${item.affected !== undefined ? ` · ${item.affected}%` : ""}`}</Pill>}
                      {waiting && <Pill tone="danger">{`Don't feed until ${formatDate(safeFrom)}`}</Pill>}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--d-muted)]">
                      {formatDate(item.date)} · {name(item.blockId)}
                      {item.product && ` · ${item.product}`}
                      {item.dose && ` · ${item.dose}`}
                      {item.waitDays !== undefined && ` · ${item.waitDays} d wait`}
                    </span>
                    {(item.aiFinding || item.notes) && <span className="mt-1 line-clamp-2 block text-xs text-[var(--d-soft)]">{item.aiFinding ?? item.notes}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Widget>
  );
}

export default function MulberryPage() {
  const { blocks, activities } = useMulberry();
  const today = useToday();
  const [editing, setEditing] = useState<Editing>(null);
  const totalArea = blocks.reduce((sum, block) => sum + block.area, 0);
  const varieties = new Set(blocks.map((block) => block.variety));
  const irrigation = new Set(blocks.map((block) => block.irrigation));
  const openDefects = activities.filter((item) => item.type === "Defect" && daysBetween(item.date, today) <= 30).length;
  const [view, setView] = useState<"overview" | "health" | "records">("overview");
  const recent = activities.filter((item) => item.status === "Done" && daysBetween(item.date, today) <= 30);
  const planned = activities.filter((item) => item.status === "Planned").length;
  const unsafeBlocks = blocks.filter((block) => !feedingSafety(block, activities, today).safe).length;
  const views = [
    { id: "overview", label: "Plantation", icon: Sprout },
    { id: "health", label: "Leaf Health & AI", icon: ScanSearch, count: openDefects },
    { id: "records", label: "Field Records", icon: ClipboardList, count: activities.length },
  ] as const;

  return (
    <DashboardPage tint="plant">
      <PageHeader icon={Leaf} eyebrow="Mulberry" title="Plantation, field work and leaf health" detail={`${blocks.length} blocks · ${totalArea.toLocaleString(undefined, { maximumFractionDigits: 1 })} acres under mulberry`} />

      <ViewTabs label="Mulberry views" idPrefix="mulberry" views={views} value={view} onChange={setView} />

      {view === "records" && (
        <div role="tabpanel" id="mulberry-view-records" aria-labelledby="mulberry-tab-records" className="space-y-8">
          <section aria-label="Field records summary">
            <SectionHeader icon={ClipboardList} title="Field Records" detail="Manuring, medication, pest control, defects, pruning and other work · tap a record to edit it" />
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <StatTile label="Done (30 days)" value={recent.length} icon={ClipboardList} note={`${activities.length} records in all`} />
              <StatTile label="Manuring (30 days)" value={recent.filter((item) => item.type === "Manuring").length} icon={Shovel} />
              <StatTile label="Sprays (30 days)" value={recent.filter((item) => item.type === "Medication" || item.type === "Pest control").length} icon={Bug} tone={unsafeBlocks ? "warn" : "accent"} note={unsafeBlocks ? `${unsafeBlocks} block${unsafeBlocks > 1 ? "s" : ""} not safe to feed yet` : "All blocks safe to feed"} />
              <StatTile label="Planned" value={planned} icon={CalendarClock} />
            </div>
          </section>
          <div className="grid items-start gap-4 xl:grid-cols-[1fr_22rem]">
            <ActivityLog blocks={blocks} activities={activities} today={today} onOpen={(activity) => setEditing({ kind: "activity", activity })} onAdd={(type) => setEditing({ kind: "activity", activity: null, type })} />
            <Upcoming blocks={blocks} activities={activities} today={today} onOpen={(activity) => setEditing({ kind: "activity", activity })} />
          </div>
        </div>
      )}

      {view === "health" && (
        <div role="tabpanel" id="mulberry-view-health" aria-labelledby="mulberry-tab-health" className="space-y-8">
          <section aria-label="Leaf health">
            <SectionHeader icon={ScanSearch} title="Leaf Health & AI Analysis" detail="Photograph a defective leaf for analysis, and check which blocks are safe to feed" />
            <div className="grid items-start gap-4 lg:grid-cols-[1.3fr_1fr]">
              <Widget title="Leaf Defect Analysis" icon={ScanSearch} action={<Pill tone="muted">AI · demo</Pill>}>
                <LeafScan />
              </Widget>
              <div className="space-y-4">
                <FeedingSafety blocks={blocks} activities={activities} today={today} />
                <DefectRecords blocks={blocks} activities={activities} onOpen={(activity) => setEditing({ kind: "activity", activity })} onAll={() => setView("records")} />
              </div>
            </div>
          </section>
        </div>
      )}

      {view === "overview" && (
        <div role="tabpanel" id="mulberry-view-overview" aria-labelledby="mulberry-tab-overview" className="space-y-8">
          <section aria-label="Plantation">
            <SectionHeader icon={Sprout} title="Plantation" detail="Variety, area cultivated and irrigation type per block · tap a block to change it" />
            <div className="mb-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
              <StatTile label="Area cultivated" value={totalArea.toLocaleString(undefined, { maximumFractionDigits: 1 })} unit="acres" icon={Ruler} />
              <StatTile label="Varieties" value={varieties.size} icon={Leaf} note={[...varieties].join(", ")} />
              <StatTile label="Irrigation" value={irrigation.size === 1 ? [...irrigation][0] : `${irrigation.size} types`} icon={Droplets} note={irrigation.size > 1 ? [...irrigation].join(", ") : undefined} />
              <StatTile label="Defects (30 days)" value={openDefects} icon={AlertTriangle} tone={openDefects ? "warn" : "accent"} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {blocks.map((block) => (
                <BlockCard key={block.id} block={block} activities={activities} today={today} onEdit={() => setEditing({ kind: "block", block })} />
              ))}
              <button
                type="button"
                onClick={() => setEditing({ kind: "block", block: null })}
                className="flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--d-card-border)] text-sm font-semibold text-[var(--d-muted)] transition-colors hover:border-[var(--d-accent)] hover:text-[var(--d-accent)]"
              >
                <Plus className="h-5 w-5" aria-hidden="true" /> Add block
              </button>
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
        </div>
      )}

      {editing?.kind === "block" && <BlockDialog block={editing.block} onClose={() => setEditing(null)} />}
      {editing?.kind === "activity" && <ActivityDialog activity={editing.activity} initialType={editing.type} onClose={() => setEditing(null)} />}
    </DashboardPage>
  );
}
