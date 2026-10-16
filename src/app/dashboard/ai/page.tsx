"use client";

import { useState } from "react";
import { Bug, Check, Cpu, Droplets, FlaskConical, Leaf, RotateCcw, ShieldAlert, Sparkles, X } from "lucide-react";

import { type Icon, Widget } from "@/components/dashboard/dashboard-widgets";
import { SectionHeader } from "@/components/dashboard/monitor-widgets";
import { DashboardPage, PageHeader, Pill, StatTile, buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";
import { aiInsights } from "@/data/mock";

const insightIcons: Record<string, Icon> = {
  "IRRIGATION PREDICTION": Droplets,
  "WATER REQUIREMENT": Droplets,
  FERTIGATION: FlaskConical,
  "MULBERRY HEALTH": Leaf,
  "SILKWORM RISK": Bug,
};

type Decision = "approved" | "rejected";

const titleCase = (text: string) => text.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AIInsightsPage() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const decide = (id: string, decision: Decision | null) =>
    setDecisions((current) => {
      const next = { ...current };
      if (decision) next[id] = decision;
      else delete next[id];
      return next;
    });

  const approved = Object.values(decisions).filter((value) => value === "approved").length;
  const rejected = Object.values(decisions).filter((value) => value === "rejected").length;

  return (
    <DashboardPage tint="nutrient">
      <PageHeader icon={Cpu} eyebrow="AI Insights" title="Predictive analytics and farmer review" detail="Each recommendation waits for your approval before anything runs" />

      <section aria-label="Review summary">
        <SectionHeader icon={Sparkles} title="Review Queue" detail="Recommendations reviewed this session" />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Awaiting review" value={aiInsights.length - approved - rejected} icon={Sparkles} tone="warn" />
          <StatTile label="Approved" value={approved} icon={Check} />
          <StatTile label="Rejected" value={rejected} icon={X} tone="muted" />
        </div>
      </section>

      <section aria-label="Recommendations">
        <SectionHeader icon={ShieldAlert} title="Recommendations" detail="Predictions and suggested actions for the farm and shed" />
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {aiInsights.map((item) => {
            const decision = decisions[item.id];
            return (
              <Widget key={item.id} title={titleCase(item.title)} icon={insightIcons[item.title] ?? Cpu} action={<Pill tone="warn">{item.badge}</Pill>}>
                <p className="text-sm font-medium leading-6 text-[var(--d-text)]">{item.summary}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--d-soft)]">{item.detail}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {decision ? (
                    <>
                      <Pill tone={decision === "approved" ? "accent" : "muted"}>{decision === "approved" ? "Approved" : "Rejected"}</Pill>
                      <button type="button" onClick={() => decide(item.id, null)} className={buttonSecondary}>
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Undo
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => decide(item.id, "approved")} className={buttonPrimary}>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                      </button>
                      <button type="button" onClick={() => decide(item.id, "rejected")} className={buttonSecondary}>
                        <X className="h-3.5 w-3.5" aria-hidden="true" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </Widget>
            );
          })}
        </div>
      </section>
    </DashboardPage>
  );
}
