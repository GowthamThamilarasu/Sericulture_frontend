"use client";

import { useSyncExternalStore, useState } from "react";
import { Bug, Check, ChevronDown, Clock, Cpu, Database, Droplets, FlaskConical, Leaf, RotateCcw, Sparkles, Target, X } from "lucide-react";

import { type Icon } from "@/components/dashboard/dashboard-widgets";
import { DashboardPage, PageHeader, buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";
import { aiInsights } from "@/data/mock";

type Category = "Irrigation" | "Fertigation" | "Mulberry" | "Silkworm";

// Extra detail for each insight: why the model says it, how sure it is and what it would do.
const detail: Record<string, { category: Category; confidence: number; impact: "High" | "Medium" | "Low"; horizon: string; metric: { value: string; label: string }; action: string; reasons: string[]; data: string[] }> = {
  ai1: {
    category: "Irrigation",
    confidence: 84,
    impact: "High",
    horizon: "Next 8 hours",
    metric: { value: "8 h", label: "until soil reaches critical moisture" },
    action: "Run Valve 1 (Block A) for 420 L before 16:00",
    reasons: ["Soil moisture fell 4% since sunrise", "No rain in the 24-hour forecast", "Afternoon temperature expected near 33 °C"],
    data: ["Soil moisture", "Weather forecast", "Evapotranspiration"],
  },
  ai2: {
    category: "Irrigation",
    confidence: 78,
    impact: "Medium",
    horizon: "Today & tomorrow",
    metric: { value: "420 L", label: "recommended today · 350 L tomorrow" },
    action: "Reduce tomorrow's schedule by 70 L",
    reasons: ["Rain likely tomorrow afternoon", "Bore well yield steady at 3,600 L/h", "Block A canopy at full leaf"],
    data: ["Rain probability", "Irrigation history", "Water source"],
  },
  ai3: {
    category: "Fertigation",
    confidence: 91,
    impact: "High",
    horizon: "Today",
    metric: { value: "0.72 → 1.05", label: "EC now → target (mS/cm)" },
    action: "Dose the agronomist-approved blend: 84 mL",
    reasons: ["EC has stayed below target for 3 days", "Shoot growth phase after pruning", "N and K tank stock available"],
    data: ["EC sensor", "Recipe targets", "Tank levels"],
  },
  ai4: {
    category: "Mulberry",
    confidence: 74,
    impact: "Low",
    horizon: "This week",
    metric: { value: "Low", label: "visible leaf damage across blocks" },
    action: "No action needed; recheck Block C leaf spot on Monday",
    reasons: ["Leaf colour and density stable", "Growth variation inside the normal band", "One moderate leaf-spot record in Block C"],
    data: ["Leaf photos", "Field records", "Growth stage"],
  },
  ai5: {
    category: "Silkworm",
    confidence: 82,
    impact: "Medium",
    horizon: "Next 24 hours",
    metric: { value: "18 / 100", label: "risk zone score · stress moderate" },
    action: "Increase ventilation and clean the bed in Shed A1",
    reasons: ["NH₃ rising, now 4.2 ppm", "Humidity drifting up", "Ventilation rated insufficient"],
    data: ["Shed climate", "Gas sensors", "Instar targets"],
  },
};

const categoryIcon: Record<Category, Icon> = { Irrigation: Droplets, Fertigation: FlaskConical, Mulberry: Leaf, Silkworm: Bug };
const impactStyle = { High: "bg-[var(--d-danger-soft)] text-[var(--d-danger-text)]", Medium: "bg-[var(--d-warn-soft)] text-[var(--d-warn)]", Low: "bg-[var(--d-accent-soft)] text-[var(--d-accent)]" };
const titleCase = (text: string) => text.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

// ---- Decisions, saved per browser ----

type Decision = "approved" | "rejected";
const storageKey = "ai-insight-decisions";
const listeners = new Set<() => void>();
const empty: Record<string, Decision> = {};
let decisions: Record<string, Decision> | null = null;
const readDecisions = () => {
  if (decisions) return decisions;
  try {
    decisions = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
  } catch {
    decisions = {};
  }
  return decisions ?? empty;
};
function decide(id: string, decision: Decision | null) {
  const next = { ...readDecisions() };
  if (decision) next[id] = decision;
  else delete next[id];
  decisions = next;
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // Storage blocked: decisions hold until the page reloads.
  }
  listeners.forEach((listener) => listener());
}
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

function ScoreRing({ value, size = 112, stroke = 10, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-white/15" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} strokeLinecap="round" stroke="url(#ai-ring)" strokeDasharray={`${(value / 100) * circumference} ${circumference}`} />
        <defs>
          <linearGradient id="ai-ring" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#e3f9a6" />
            <stop offset="1" stopColor="#6fe07f" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-3xl font-extrabold tabular-nums leading-none">{value}</span>
        {label && <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/70">{label}</span>}
      </div>
    </div>
  );
}

function ConfidenceRing({ value }: { value: number }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-11 w-11 shrink-0" title={`${value}% confidence`}>
      <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="20" cy="20" r={radius} fill="none" strokeWidth="4" style={{ stroke: "var(--d-track)" }} />
        <circle cx="20" cy="20" r={radius} fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(value / 100) * circumference} ${circumference}`} style={{ stroke: "var(--d-accent)" }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums text-[var(--d-text)]">{value}%</span>
      <span className="sr-only">{value}% confidence</span>
    </div>
  );
}

export default function AIInsightsPage() {
  const saved = useSyncExternalStore(subscribe, readDecisions, () => empty);
  const [filter, setFilter] = useState<Category | "All">("All");
  const [open, setOpen] = useState<string | null>(null);
  const approved = aiInsights.filter((item) => saved[item.id] === "approved").length;
  const rejected = aiInsights.filter((item) => saved[item.id] === "rejected").length;
  const awaiting = aiInsights.length - approved - rejected;
  const shown = aiInsights.filter((item) => filter === "All" || detail[item.id]?.category === filter);
  const categories = (["All", "Irrigation", "Fertigation", "Mulberry", "Silkworm"] as const).map((name) => ({ name, count: name === "All" ? aiInsights.length : aiInsights.filter((item) => detail[item.id]?.category === name).length }));
  const averageConfidence = Math.round(aiInsights.reduce((sum, item) => sum + (detail[item.id]?.confidence ?? 0), 0) / aiInsights.length);

  return (
    <DashboardPage tint="nutrient">
      <PageHeader icon={Cpu} eyebrow="AI Insights" title="Predictive analytics and farmer review" detail="Each recommendation waits for your approval before anything runs" />

      <section aria-label="AI summary" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f5c2e] via-[#11692f] to-[#082f17] p-6 text-white shadow-[0_24px_60px_-28px_rgb(6_40_20_/_0.9)] md:p-8">
        <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#6fe07f]/25 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/4 h-60 w-60 rounded-full bg-[#e3b23c]/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <ScoreRing value={82} label="Farm health" />
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c8f5cf] ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> AI summary · demo
            </div>
            <h2 className="mt-3 text-2xl font-bold leading-tight md:text-3xl">The farm is in good shape. Two actions would help most today.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">Irrigate Block A before late afternoon and bring EC up to target. Shed air quality needs watching while NH₃ rises.</p>
          </div>
          <dl className="grid grid-cols-3 gap-2 md:w-72 md:grid-cols-1">
            {[
              { label: "Awaiting review", value: awaiting },
              { label: "Approved", value: approved },
              { label: "Average confidence", value: `${averageConfidence}%` },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/10 px-4 py-2.5 ring-1 ring-white/10">
                <dt className="text-[11px] text-white/65">{stat.label}</dt>
                <dd className="text-xl font-bold tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div role="tablist" aria-label="Insight category" className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => {
          const CategoryIcon = item.name === "All" ? Sparkles : categoryIcon[item.name];
          const active = filter === item.name;
          return (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(item.name)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${active ? "accent-fill shadow-md" : "border border-[var(--d-card-border)] bg-[var(--d-card)] text-[var(--d-soft)] hover:text-[var(--d-text)]"}`}
            >
              <CategoryIcon className="h-4 w-4" aria-hidden="true" />
              {item.name}
              <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-black/15" : "bg-[var(--d-chip)]"}`}>{item.count}</span>
            </button>
          );
        })}
      </div>

      <section aria-label="Recommendations" className="grid items-start gap-5 lg:grid-cols-2">
        {shown.map((item) => {
          const info = detail[item.id];
          const CategoryIcon = info ? categoryIcon[info.category] : Cpu;
          const decision = saved[item.id];
          const expanded = open === item.id;
          return (
            <article
              key={item.id}
              className={`dash-card group relative overflow-hidden rounded-3xl border bg-[var(--d-card)] transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-lg ${decision === "approved" ? "border-[var(--d-accent)]" : "border-[var(--d-card-border)]"} ${decision === "rejected" ? "opacity-70" : ""}`}
            >
              <div className="h-1 w-full bg-gradient-to-r from-[#00a218] via-[#6fe07f] to-[#e3b23c]" />
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6fe07f] to-[#00a218] text-white shadow-[0_10px_22px_-10px_rgb(0_162_24_/_0.8)]">
                    <CategoryIcon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--d-accent)]">{info?.category ?? "Insight"}</div>
                    <h3 className="text-base font-bold text-[var(--d-text)]">{titleCase(item.title)}</h3>
                    {info && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                        <span className={`rounded-full px-2 py-0.5 ${impactStyle[info.impact]}`}>{info.impact} impact</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--d-chip)] px-2 py-0.5 text-[var(--d-soft)]">
                          <Clock className="h-3 w-3" aria-hidden="true" /> {info.horizon}
                        </span>
                      </div>
                    )}
                  </div>
                  {info && <ConfidenceRing value={info.confidence} />}
                </div>

                <p className="mt-4 text-[15px] font-medium leading-6 text-[var(--d-text)]">{item.summary}</p>

                {info && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[var(--d-inset)] p-3.5">
                      <div className="text-2xl font-extrabold tabular-nums text-[var(--d-accent)]">{info.metric.value}</div>
                      <div className="text-xs text-[var(--d-muted)]">{info.metric.label}</div>
                    </div>
                    <div className="rounded-2xl bg-[var(--d-inset)] p-3.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--d-muted)]">
                        <Target className="h-3.5 w-3.5" aria-hidden="true" /> Suggested action
                      </div>
                      <div className="mt-1 text-sm font-semibold leading-5 text-[var(--d-text)]">{info.action}</div>
                    </div>
                  </div>
                )}

                {info && (
                  <div className="mt-3">
                    <button type="button" onClick={() => setOpen(expanded ? null : item.id)} aria-expanded={expanded} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--d-accent)] hover:underline">
                      Why the AI suggests this <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>
                    {expanded && (
                      <div className="mt-2 rounded-2xl border border-[var(--d-card-border)] p-3.5">
                        <ul className="space-y-1.5">
                          {info.reasons.map((reason) => (
                            <li key={reason} className="flex gap-2 text-sm text-[var(--d-soft)]">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--d-accent)]" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs text-[var(--d-muted)]">{item.detail}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <Database className="h-3.5 w-3.5 text-[var(--d-muted)]" aria-label="Data used" />
                          {info.data.map((source) => (
                            <span key={source} className="rounded-full bg-[var(--d-chip)] px-2 py-0.5 text-[11px] text-[var(--d-soft)]">
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={`flex flex-wrap items-center gap-2 border-t px-5 py-3.5 ${decision === "approved" ? "border-[var(--d-card-border)] bg-[var(--d-accent-soft)]" : "border-[var(--d-line)]"}`}>
                {decision ? (
                  <>
                    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${decision === "approved" ? "text-[var(--d-accent)]" : "text-[var(--d-muted)]"}`}>
                      {decision === "approved" ? <Check className="h-4 w-4" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />}
                      {decision === "approved" ? "Approved: will run under automation" : "Rejected"}
                    </span>
                    <button type="button" onClick={() => decide(item.id, null)} className={`${buttonSecondary} ml-auto`}>
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Undo
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-[var(--d-muted)]">Waiting for your review</span>
                    <div className="ml-auto flex gap-2">
                      <button type="button" onClick={() => decide(item.id, "rejected")} className={buttonSecondary}>
                        <X className="h-3.5 w-3.5" aria-hidden="true" /> Reject
                      </button>
                      <button type="button" onClick={() => decide(item.id, "approved")} className={buttonPrimary}>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                      </button>
                    </div>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <p className="text-center text-[11px] text-[var(--d-muted)]">Demo insights from simulated data. Live predictions will come from the AI models once your sensors are connected.</p>
    </DashboardPage>
  );
}
