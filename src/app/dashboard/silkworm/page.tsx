"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Activity, Bot, BrushCleaning, Pill as PillIcon, ScanSearch, Gauge, Lightbulb, ListChecks, Sprout, TrendingUp, CalendarDays, Cpu, Dna, Egg, HeartPulse, History, Layers, Leaf, MapPin, Settings2, ShieldCheck, ShieldAlert, Skull, Utensils, Warehouse, Wind, X } from "lucide-react";

import { BatchSettings, CocoonYieldButton } from "@/components/dashboard/batch-settings";
import { dueMedications, useSilkwormHealth } from "@/components/dashboard/silkworm-health";
import { MedicationPanel, SilkwormPhotoCheck } from "@/components/dashboard/silkworm-medication";
import { batchProgress, formatDate, stages, totalDays, useBatches, useToday } from "@/components/dashboard/batch-store";
import { type Icon, Widget } from "@/components/dashboard/dashboard-widgets";
import { SectionHeader, shedSetpoints } from "@/components/dashboard/monitor-widgets";
import { DashboardPage, PageHeader, Pill, StatTile, type Tone, ViewTabs, buttonSecondary } from "@/components/dashboard/page-kit";
import { Co2Icon, HumidityIcon, Nh3Icon, TemperatureIcon } from "@/components/dashboard/sensor-icons";
import { instarStages, silkwormBatch } from "@/data/mock";
import type { BatchRecord, InstarKey } from "@/types";

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

// Target climate for an instar (instarStages groups I–II and IV–V).
const targetFor = (instar: InstarKey) => (instar === "Spinning" ? null : instarStages[instar === "I" || instar === "II" ? 0 : instar === "III" ? 1 : 2]);

type Progress = ReturnType<typeof batchProgress>;

function BatchFact({ icon: Icon, label, value }: { icon: typeof Dna; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-[var(--d-inset)] px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-[var(--d-accent)]" aria-hidden="true" />
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">{label}</div>
        <div className="truncate text-sm font-semibold text-[var(--d-text)]" title={value}>
          {value}
        </div>
      </div>
    </div>
  );
}

// Large ring with the instar numeral; the ring fills through the days of the current instar.
function InstarRing({ progress }: { progress: Progress }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const stage = stages[progress.stageIndex];
  const share = progress.finished ? 1 : stage && progress.dayInStage !== null ? Math.min(1, progress.dayInStage / stage.days) : 0;
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="9" style={{ stroke: "var(--d-track)" }} />
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${share * circumference} ${circumference}`} style={{ stroke: "var(--d-accent)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--d-muted)]">{progress.finished ? "Batch" : "Instar"}</span>
        <span className="font-serif text-5xl font-bold leading-none text-[var(--d-accent)]">{progress.finished ? "✓" : stage.key === "Spinning" ? "Spin" : stage.key}</span>
      </div>
    </div>
  );
}

// Batch settings popup. Not portalled, so it keeps the dashboard theme variables.
function BatchSettingsButton() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={buttonSecondary}>
        <Settings2 className="h-3.5 w-3.5" aria-hidden="true" /> Batch settings
      </Dialog.Trigger>
      {open && (
        <>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <Dialog.Title className="text-lg font-semibold">Batch settings</Dialog.Title>
                <Dialog.Description className="mt-1 text-xs text-[var(--d-muted)]">Choose the batch to follow, or change its number, farm, breed and dates. Also in Settings → Silkworm Batch.</Dialog.Description>
              </div>
              <Dialog.Close aria-label="Close" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>
            <BatchSettings />
          </Dialog.Content>
        </>
      )}
    </Dialog.Root>
  );
}

// The batch at full size: ID, breed and instar, with the path from brushing to spinning.
function BatchProfile({ batch, progress, batches, onSelect }: { batch: BatchRecord; progress: Progress; batches: BatchRecord[]; onSelect: (id: string) => void }) {
  const stage = stages[progress.stageIndex];
  const target = stage && !progress.finished ? targetFor(stage.key) : null;

  return (
    <section aria-label="Batch profile" className="dash-card rounded-xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--d-line)] pb-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <label htmlFor="batch-switch" className="shrink-0 text-xs font-semibold text-[var(--d-soft)]">
            Viewing batch
          </label>
          <select
            id="batch-switch"
            value={batch.id}
            onChange={(event) => onSelect(event.target.value)}
            className="min-w-0 max-w-full rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] px-3 py-1.5 text-sm font-semibold text-[var(--d-text)] outline-none focus:border-[var(--d-accent)]"
          >
            {batches.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} · {item.breed} · {item.status}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <CocoonYieldButton batch={batch} />
          <BatchSettingsButton />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--d-muted)]">Batch ID</div>
          <div className="mt-1 break-all font-mono text-3xl font-bold tracking-tight text-[var(--d-text)] md:text-4xl">{batch.id}</div>

          <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--d-muted)]">Breed</div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold text-[var(--d-text)] md:text-3xl">{batch.breed}</span>
            <Pill>{batch.breedType}</Pill>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <BatchFact icon={MapPin} label="Farm" value={batch.farm} />
            <BatchFact icon={Warehouse} label="Shed" value={batch.shed} />
            <BatchFact icon={Egg} label="Layings brushed" value={`${batch.layings} DFLs`} />
            <BatchFact icon={CalendarDays} label="Brushed on" value={formatDate(batch.brushedOn)} />
            <BatchFact icon={Dna} label={progress.finished ? (batch.status === "Failed" ? "Ended on" : "Harvested on") : "Expected spinning"} value={progress.finished ? formatDate(batch.harvestedOn) : progress.expectedSpinning} />
            <BatchFact icon={Layers} label="Status" value={batch.status} />
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-xl bg-[var(--d-inset)] p-5 sm:flex-row sm:items-center">
          <InstarRing progress={progress} />
          <div className="min-w-0 flex-1">
            {progress.finished ? (
              <>
                <div className="text-xl font-bold text-[var(--d-text)]">{batch.status === "Failed" ? "Batch ended" : "Harvested"}</div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-[var(--d-line)] pb-2">
                    <span className="text-[var(--d-muted)]">Cocoon yield</span>
                    <span className="font-semibold text-[var(--d-text)]">{batch.cocoonKg === null ? "–" : `${batch.cocoonKg} kg`}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-b border-[var(--d-line)] pb-2">
                    <span className="text-[var(--d-muted)]">Grade</span>
                    <span className="font-semibold text-[var(--d-text)]">{batch.grade ?? "–"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[var(--d-muted)]">Mortality</span>
                    <span className="font-semibold text-[var(--d-text)]">{batch.mortality === null ? "–" : `${batch.mortality}%`}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-xl font-bold text-[var(--d-text)]">{stage.key === "Spinning" ? "Spinning" : `Instar ${stage.key}`}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--d-soft)]">
                  <Pill tone="muted">{stage.phase}</Pill>
                  {progress.dayInStage !== null ? (
                    <span>
                      Day <strong className="tabular-nums text-[var(--d-text)]">{progress.dayInStage}</strong> of {stage.days}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--d-muted)]">Set by hand in batch settings</span>
                  )}
                </div>
                {target && (
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-[var(--d-line)] pb-2">
                      <span className="text-[var(--d-muted)]">Target temperature</span>
                      <span className="font-semibold text-[var(--d-text)]">
                        {target.temperature} <span className="font-normal text-[var(--d-muted)]">· now {silkwormBatch.temperature} °C</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[var(--d-muted)]">Target humidity</span>
                      <span className="font-semibold text-[var(--d-text)]">
                        {target.humidity} <span className="font-normal text-[var(--d-muted)]">· now {silkwormBatch.humidity}%</span>
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-xs">
          <span className="font-semibold text-[var(--d-soft)]">Brushing to spinning</span>
          <span className="text-[var(--d-muted)]">
            {progress.finished ? (
              "Completed"
            ) : (
              <>
                Day <strong className="tabular-nums text-[var(--d-text)]">{progress.dayOfBatch}</strong> of about {totalDays}
              </>
            )}
          </span>
        </div>
        <ol className="flex gap-1.5" aria-label="Rearing stages">
          {stages.map((item, index) => {
            const done = index < progress.stageIndex;
            const now = index === progress.stageIndex;
            const fill = done ? 100 : now ? (progress.dayInStage === null ? 50 : Math.min(100, (progress.dayInStage / item.days) * 100)) : 0;
            return (
              <li key={item.key} className="min-w-0" style={{ flexGrow: item.days, flexBasis: 0 }} aria-current={now ? "step" : undefined}>
                <div className={`h-2.5 overflow-hidden rounded-full bg-[var(--d-track)] ${now ? "ring-2 ring-[var(--d-accent)] ring-offset-2 ring-offset-[var(--d-card)]" : ""}`}>
                  <div className="h-full rounded-full bg-[var(--d-accent)]" style={{ width: `${fill}%` }} />
                </div>
                <div className={`mt-1.5 truncate text-center text-xs font-bold ${now ? "text-[var(--d-accent)]" : done ? "text-[var(--d-text)]" : "text-[var(--d-muted)]"}`}>{item.label}</div>
                <div className="hidden truncate text-center text-[10px] text-[var(--d-muted)] sm:block">{item.days} d</div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

const statusTone: Record<BatchRecord["status"], Tone> = { Rearing: "accent", Harvested: "muted", Failed: "danger" };
const per100 = (batch: BatchRecord) => (batch.cocoonKg === null ? null : (batch.cocoonKg / batch.layings) * 100);

function BatchHistory({ batches, activeId, onSelect, today }: { batches: BatchRecord[]; activeId: string; onSelect: (id: string) => void; today: string }) {
  const harvested = batches.filter((batch) => batch.status === "Harvested" && batch.cocoonKg !== null);
  const averageYield = harvested.reduce((sum, batch) => sum + (per100(batch) ?? 0), 0) / Math.max(harvested.length, 1);
  const best = harvested.reduce<BatchRecord | null>((top, batch) => (!top || (per100(batch) ?? 0) > (per100(top) ?? 0) ? batch : top), null);
  const peak = Math.max(...harvested.map((batch) => per100(batch) ?? 0), 1);

  return (
    <Widget title="Batch History" icon={History} action={<span className="text-[11px] text-[var(--d-muted)]">{batches.length} batches · tap a row to view it</span>}>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatTile label="Harvested" value={harvested.length} icon={Layers} note={`of ${batches.length} batches`} />
        <StatTile label="Avg. yield" value={harvested.length ? averageYield.toFixed(1) : "–"} unit="kg / 100 DFLs" icon={Egg} />
        <StatTile label="Best batch" value={best?.id ?? "–"} icon={ShieldCheck} note={best ? `${per100(best)?.toFixed(1)} kg / 100 DFLs` : undefined} />
      </div>

      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--d-line)] text-[10px] uppercase tracking-[0.15em] text-[var(--d-muted)]">
              <th scope="col" className="py-2 pr-3 font-semibold">Batch ID</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Breed</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Farm · Shed</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Brushed → Harvested</th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">DFLs</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Cocoon yield</th>
              <th scope="col" className="py-2 pr-3 text-center font-semibold">Grade</th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">Mortality</th>
              <th scope="col" className="py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => {
              const yieldPer100 = per100(batch);
              const viewing = batch.id === activeId;
              const instar = batch.status === "Rearing" ? stages[batchProgress(batch, today).stageIndex]?.key : null;
              return (
                <tr
                  key={batch.id}
                  onClick={() => onSelect(batch.id)}
                  aria-selected={viewing}
                  className={`cursor-pointer border-b border-[var(--d-line)] transition-colors last:border-b-0 hover:bg-[var(--d-chip)] ${viewing ? "bg-[var(--d-accent-soft)]" : ""}`}
                >
                  <th scope="row" className="whitespace-nowrap py-2.5 pr-3 font-mono text-[13px] font-bold text-[var(--d-text)]">
                    <button type="button" onClick={() => onSelect(batch.id)} className="hover:underline">
                      {batch.id}
                    </button>
                  </th>
                  <td className="py-2.5 pr-3">
                    <div className="whitespace-nowrap font-semibold text-[var(--d-text)]">{batch.breed}</div>
                    <div className="whitespace-nowrap text-[11px] text-[var(--d-muted)]">{batch.breedType}</div>
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="max-w-[12rem] truncate text-[var(--d-soft)]" title={batch.farm}>
                      {batch.farm}
                    </div>
                    <div className="text-[11px] text-[var(--d-muted)]">{batch.shed}</div>
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-3 text-[var(--d-soft)]">
                    {formatDate(batch.brushedOn)} → {batch.harvestedOn ? formatDate(batch.harvestedOn) : <span className="text-[var(--d-accent)]">in progress</span>}
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-[var(--d-soft)]">{batch.layings}</td>
                  <td className="py-2.5 pr-3">
                    {yieldPer100 === null ? (
                      <span className="text-[var(--d-muted)]">–</span>
                    ) : (
                      <div className="min-w-[9rem]">
                        <div className="flex items-baseline justify-between gap-2 tabular-nums">
                          <span className="font-semibold text-[var(--d-text)]">{batch.cocoonKg} kg</span>
                          <span className="text-[11px] text-[var(--d-muted)]">{yieldPer100.toFixed(1)} / 100</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-[var(--d-track)]">
                          <div className="h-full rounded-full bg-[var(--d-accent)]" style={{ width: `${Math.min(100, (yieldPer100 / peak) * 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-center font-bold text-[var(--d-text)]">{batch.grade ?? "–"}</td>
                  <td className={`py-2.5 pr-3 text-right tabular-nums ${batch.mortality !== null && batch.mortality > 10 ? "font-semibold text-[var(--d-danger-text)]" : "text-[var(--d-soft)]"}`}>
                    {batch.mortality === null ? "–" : `${batch.mortality}%`}
                  </td>
                  <td className="whitespace-nowrap py-2.5">
                    <Pill tone={statusTone[batch.status]}>{instar ? (instar === "Spinning" ? "Spinning" : `Instar ${instar}`) : batch.status}</Pill>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Widget>
  );
}

// ---- AI insights (demo: rule-based on the live shed readings and the instar's targets) ----

type Level = "OK" | "Watch" | "Act";
const levelTone: Record<Level, Tone> = { OK: "accent", Watch: "warn", Act: "danger" };
const limit = (key: string) => shedSetpoints.find((item) => item.key === key)?.value ?? 0;
const range = (text: string) => {
  const match = text.match(/([\d.]+)\s*[–-]\s*([\d.]+)/);
  return match ? ([Number(match[1]), Number(match[2])] as const) : null;
};

type Factor = { label: string; icon: Icon; reading: string; target: string; level: Level; action: string };

function riskFactors(instar: InstarKey | null): Factor[] {
  const target = instar ? targetFor(instar) : null;
  const factors: Factor[] = [];
  const temp = target && range(target.temperature);
  if (temp) {
    const t = silkwormBatch.temperature;
    const off = t < temp[0] ? temp[0] - t : t > temp[1] ? t - temp[1] : 0;
    factors.push({
      label: "Temperature",
      icon: TemperatureIcon,
      reading: `${t} °C`,
      target: target.temperature,
      level: off === 0 ? "OK" : off <= 1 ? "Watch" : "Act",
      action: t > temp[1] ? `Run the exhaust fans and open vents in the afternoon to bring the shed down to ${temp[1]} °C.` : t < temp[0] ? `Close vents at night and use the heater to hold at least ${temp[0]} °C.` : "Within the instar's range.",
    });
  }
  const rh = target && range(target.humidity);
  if (rh) {
    const h = silkwormBatch.humidity;
    const off = h < rh[0] ? rh[0] - h : h > rh[1] ? h - rh[1] : 0;
    factors.push({
      label: "Humidity",
      icon: HumidityIcon,
      reading: `${h}%`,
      target: target.humidity,
      level: off === 0 ? "OK" : off <= 5 ? "Watch" : "Act",
      action: h > rh[1] ? "Ventilate and dust the bed with slaked lime or bed disinfectant to dry it." : h < rh[0] ? "Run the humidifier or hang wet gunny cloth near the racks." : "Within the instar's range.",
    });
  }
  const nh3 = limit("nh3");
  factors.push({
    label: "Ammonia (NH₃)",
    icon: Nh3Icon,
    reading: `${silkwormBatch.nh3} ppm`,
    target: `below ${nh3} ppm`,
    level: silkwormBatch.nh3 > nh3 ? "Act" : silkwormBatch.nh3 > nh3 * 0.7 ? "Watch" : "OK",
    action: silkwormBatch.nh3 > nh3 * 0.7 ? "Clean the bed and remove litter and leftover leaf today; ammonia builds up from wet litter." : "Bed hygiene is keeping ammonia low.",
  });
  const co2 = limit("co2");
  factors.push({
    label: "CO₂",
    icon: Co2Icon,
    reading: `${silkwormBatch.co2} ppm`,
    target: `below ${co2} ppm`,
    level: silkwormBatch.co2 > co2 ? "Act" : silkwormBatch.co2 > co2 * 0.85 ? "Watch" : "OK",
    action: silkwormBatch.co2 > co2 * 0.85 ? "Increase air exchange; CO₂ is approaching its limit." : "Air exchange is adequate.",
  });
  const poorAir = silkwormBatch.ventilation !== "Good" && silkwormBatch.ventilation !== "Adequate";
  factors.push({
    label: "Ventilation",
    icon: Wind,
    reading: silkwormBatch.ventilation,
    target: "Adequate",
    level: poorAir ? "Watch" : "OK",
    action: poorAir ? "Run the exhaust fans for 15 minutes every hour and keep the leeward windows open." : "Air flow is adequate.",
  });
  return factors;
}

// What to do at each stage.
const stageGuidance: Record<InstarKey, string[]> = {
  I: ["Feed tender, chopped top leaves 3–4 times a day.", "Keep beds thin and covered with paraffin paper to hold humidity.", "Stop feeding during the moult and keep the bed dry."],
  II: ["Feed tender, chopped leaves 3–4 times a day.", "Widen the bed as the larvae grow.", "Dust bed disinfectant after the moult, before the first feed."],
  III: ["Feed tender leaves 3 times a day.", "Clean the bed once a day.", "Give more space: overcrowding raises disease risk."],
  IV: ["Feed whole leaves or shoots 3 times a day.", "Clean the bed daily and remove leftover leaf.", "Dust bed disinfectant after the moult."],
  V: ["Peak feeding: most of the batch's leaf is eaten in this instar. Feed shoots 3–4 times a day.", "Keep spacing wide and the shed well ventilated.", "Have clean mountages ready by day 6."],
  Spinning: ["Move ripe larvae onto the mountages.", "Keep the shed airy, with humidity around 60–70%.", "Do not disturb the mountages for 3 days."],
};

function AiInsights({ batch, progress, batches }: { batch: BatchRecord; progress: Progress; batches: BatchRecord[] }) {
  const stage = progress.finished ? null : stages[progress.stageIndex];
  const factors = riskFactors(stage?.key ?? null);
  const attention = factors.filter((factor) => factor.level !== "OK");
  const harvested = batches.filter((item) => item.status === "Harvested" && item.cocoonKg !== null && item.breed === batch.breed);
  const pool = harvested.length ? harvested : batches.filter((item) => item.status === "Harvested" && item.cocoonKg !== null);
  const average = pool.reduce((sum, item) => sum + ((item.cocoonKg ?? 0) / item.layings) * 100, 0) / Math.max(pool.length, 1);
  const forecast = (average * batch.layings) / 100 * (1 - silkwormBatch.riskZone / 200);

  return (
    <div className="space-y-8">
      <section aria-label="AI summary">
        <SectionHeader icon={Bot} title="AI Insights" detail={`Batch ${batch.id} · ${batch.breed} · scored from the shed readings and the instar's targets`} />
        <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Widget title="AI Insight Summary" icon={Bot} action={<Pill tone="warn">Demo</Pill>}>
            <p className="text-sm leading-6 text-[var(--d-soft)]">
              Overall condition is <strong className="text-[var(--d-text)]">{silkwormBatch.condition.toLowerCase()}</strong> with a risk zone score of{" "}
              <strong className="text-[var(--d-text)]">{silkwormBatch.riskZone} / 100</strong> and <strong style={{ color: `var(--d-${stressTone})` }}>{silkwormBatch.stressRisk.toLowerCase()}</strong> stress risk.{" "}
              {attention.length ? `${attention.length} factor${attention.length > 1 ? "s" : ""} need${attention.length > 1 ? "" : "s"} attention.` : "All factors are within target."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {reasons.map((reason) => (
                <Pill key={reason} tone="warn">
                  {reason}
                </Pill>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-[var(--d-soft)]">Risk zone</span>
                <span className="font-bold tabular-nums" style={{ color: `var(--d-${riskTone})` }}>
                  {silkwormBatch.riskZone} / 100
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--d-track)]" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={silkwormBatch.riskZone} aria-label="Risk zone score">
                <div className="h-full rounded-full" style={{ width: `${silkwormBatch.riskZone}%`, backgroundColor: `var(--d-${riskTone})` }} />
              </div>
            </div>
          </Widget>

          <Widget title="Yield Forecast" icon={TrendingUp} action={<Pill tone="muted">Estimate</Pill>}>
            {progress.finished ? (
              <p className="text-sm text-[var(--d-soft)]">This batch is finished: {batch.cocoonKg === null ? "no yield recorded." : `${batch.cocoonKg} kg of cocoons were harvested.`}</p>
            ) : pool.length === 0 ? (
              <p className="text-sm text-[var(--d-soft)]">Record a harvested batch&apos;s cocoon yield to get a forecast.</p>
            ) : (
              <>
                <div className="text-3xl font-bold tabular-nums text-[var(--d-accent)]">
                  {Math.round(forecast * 0.9)}–{Math.round(forecast * 1.1)}
                  <span className="ml-1 text-sm font-semibold text-[var(--d-muted)]">kg cocoons</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--d-muted)]">
                  From {pool.length} past {harvested.length ? batch.breed : ""} batch{pool.length > 1 ? "es" : ""} averaging {average.toFixed(1)} kg per 100 DFLs, scaled to {batch.layings} DFLs and lowered for the current risk score.
                </p>
              </>
            )}
          </Widget>
        </div>
      </section>

      <section aria-label="Silkworm photo check">
        <SectionHeader icon={ScanSearch} title="Photo Check" detail="Upload or take a photo of the larvae for an AI health check" />
        <SilkwormPhotoCheck batch={batch} />
      </section>

      <section aria-label="Risk factors">
        <SectionHeader icon={Gauge} title="Risk Factors" detail={stage ? `Each reading against the ${stage.key === "Spinning" ? "spinning" : `instar ${stage.key}`} target` : "Each reading against its limit"} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {factors.map((factor) => (
            <div key={factor.label} className="dash-card rounded-xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-4" style={{ borderLeft: `4px solid var(--d-${levelTone[factor.level]})` }}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-[var(--d-text)]">
                  <factor.icon className="h-4 w-4 text-[var(--d-accent)]" aria-hidden="true" />
                  {factor.label}
                </span>
                <Pill tone={levelTone[factor.level]}>{factor.level}</Pill>
              </div>
              <div className="mt-2 text-2xl font-bold tabular-nums text-[var(--d-text)]">{factor.reading}</div>
              <div className="text-[11px] text-[var(--d-muted)]">Target {factor.target}</div>
              <p className="mt-2 text-xs leading-5 text-[var(--d-soft)]">{factor.action}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Recommendations">
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Widget title="Recommended Actions" icon={ListChecks}>
            {attention.length === 0 ? (
              <p className="py-2 text-sm text-[var(--d-soft)]">Nothing urgent. Keep to the feeding and cleaning routine.</p>
            ) : (
              <ol className="space-y-2">
                {[...attention]
                  .sort((a, b) => (a.level === b.level ? 0 : a.level === "Act" ? -1 : 1))
                  .map((factor, index) => (
                    <li key={factor.label} className="flex gap-3 rounded-lg bg-[var(--d-inset)] p-3 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full accent-fill text-xs font-bold">{index + 1}</span>
                      <span className="text-[var(--d-soft)]">
                        <strong className="text-[var(--d-text)]">{factor.label}:</strong> {factor.action}
                      </span>
                    </li>
                  ))}
              </ol>
            )}
          </Widget>

          <Widget title={stage ? `${stage.key === "Spinning" ? "Spinning" : `Instar ${stage.key}`} Guidance` : "Stage Guidance"} icon={Lightbulb}>
            {stage ? (
              <ul className="space-y-2">
                {stageGuidance[stage.key].map((tip) => (
                  <li key={tip} className="flex gap-2.5 text-sm text-[var(--d-soft)]">
                    <Sprout className="mt-0.5 h-4 w-4 shrink-0 text-[var(--d-accent)]" aria-hidden="true" />
                    {tip}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--d-soft)]">The batch is finished. Clean and disinfect the shed and equipment before brushing the next batch.</p>
            )}
          </Widget>
        </div>
        <p className="mt-3 text-[11px] text-[var(--d-muted)]">Demo insights worked out from the shed readings and standard rearing targets. They will come from the AI model once it is connected.</p>
      </section>
    </div>
  );
}

export default function SilkwormPage() {
  const { batches, active, setActive } = useBatches();
  const today = useToday();
  const progress = batchProgress(active, today);
  const stage = stages[progress.stageIndex];
  const stageLabel = progress.finished ? active.status : stage.key === "Spinning" ? "Spinning" : `Instar ${stage.key}`;
  const [view, setView] = useState<"batch" | "ai" | "medication" | "history">("batch");
  const { health } = useSilkwormHealth();
  const dueCount = dueMedications(active, health, today).length;
  const attention = riskFactors(progress.finished ? null : stage.key).filter((factor) => factor.level !== "OK").length;
  const views = [
    { id: "batch", label: "Batch", icon: Layers },
    { id: "ai", label: "AI Insights", icon: Bot, count: attention },
    { id: "medication", label: "Medication", icon: PillIcon, count: dueCount },
    { id: "history", label: "Batch History", icon: History, count: batches.length },
  ] as const;

  return (
    <DashboardPage tint="light">
      <PageHeader icon={ShieldCheck} eyebrow="Silkworm Monitor" title="Batch condition and risk overview" detail={`Batch ${active.id} · ${active.breed} · ${stageLabel}`} badge="Demo AI Insight" />

      <ViewTabs label="Silkworm views" idPrefix="silkworm" views={views} value={view} onChange={setView} />

      {view === "ai" && (
        <div role="tabpanel" id="silkworm-view-ai" aria-labelledby="silkworm-tab-ai">
          <AiInsights batch={active} progress={progress} batches={batches} />
        </div>
      )}

      {view === "medication" && (
        <div role="tabpanel" id="silkworm-view-medication" aria-labelledby="silkworm-tab-medication">
          <section aria-label="Medication">
            <SectionHeader icon={PillIcon} title="Medication" detail={`Batch ${active.id} · disinfectants, treatments and pest control, planned by presets or added by hand`} />
            <MedicationPanel batch={active} />
          </section>
        </div>
      )}

      {view === "history" && (
        <div role="tabpanel" id="silkworm-view-history" aria-labelledby="silkworm-tab-history">
          <section aria-label="Batch history">
            <SectionHeader icon={History} title="Batch History" detail="Every rearing batch by ID, with breed, dates, cocoon yield and losses · tap a row to view that batch" />
            <BatchHistory
              batches={batches}
              activeId={active.id}
              onSelect={(id) => {
                setActive(id);
                setView("batch");
              }}
              today={today}
            />
          </section>
        </div>
      )}

      {view === "batch" && (
        <div role="tabpanel" id="silkworm-view-batch" aria-labelledby="silkworm-tab-batch" className="space-y-8">
          <BatchProfile batch={active} progress={progress} batches={batches} onSelect={setActive} />

          <section aria-label="Batch status">
            <SectionHeader icon={HeartPulse} title="Batch Status" detail="Condition and risk scored from the shed readings · details under AI Insights" />
            <div className="grid gap-4 sm:grid-cols-3">
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
        </div>
      )}
    </DashboardPage>
  );
}
