"use client";

import { AlertTriangle, Bell, BellOff, Bot, Check, CircleAlert, Clock, Info, MapPin, RotateCcw, WifiOff } from "lucide-react";

import { type Icon } from "@/components/dashboard/dashboard-widgets";
import { SectionHeader } from "@/components/dashboard/monitor-widgets";
import { setNotificationState, useNotifications } from "@/components/dashboard/notifications";
import { DashboardPage, PageHeader, Pill, StatTile, type Tone, buttonPrimary, buttonSecondary, toneColor } from "@/components/dashboard/page-kit";

const severity: Record<string, { tone: Tone; icon: Icon }> = {
  Warning: { tone: "warn", icon: AlertTriangle },
  "Sensor Failure": { tone: "danger", icon: WifiOff },
  Information: { tone: "info", icon: Info },
  "AI Recommendation": { tone: "accent", icon: Bot },
};

export default function AlertsPage() {
  const { items } = useNotifications();
  const open = items.filter((alert) => alert.state === "new").length;

  return (
    <DashboardPage tint="alert">
      <PageHeader icon={Bell} eyebrow="Alert Center" title="Monitoring and alert response" detail="Mark alerts read once handled, or ignore ones that need no action" />

      <section aria-label="Alert summary">
        <SectionHeader icon={CircleAlert} title="Summary" detail="Alerts from the farm and shed sensors" />
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatTile label="Open" value={open} icon={Bell} tone={open ? "warn" : "accent"} />
          <StatTile label="Read" value={items.filter((alert) => alert.state === "read").length} icon={Check} />
          <StatTile label="Ignored" value={items.filter((alert) => alert.state === "ignored").length} icon={BellOff} tone="muted" />
          <StatTile label="Sensor Failures" value={items.filter((alert) => alert.severity === "Sensor Failure").length} icon={WifiOff} tone="danger" />
        </div>
      </section>

      <section aria-label="Alerts">
        <SectionHeader icon={AlertTriangle} title="Alerts" detail="Newest first" />
        <div className="space-y-3">
          {items.map((alert) => {
            const { tone, icon: SeverityIcon } = severity[alert.severity] ?? { tone: "muted" as Tone, icon: Info };
            return (
              <article
                key={alert.id}
                className={`rounded-lg dash-card border border-[var(--d-card-border)] bg-[var(--d-card)] p-4 ${alert.state === "new" ? "" : "opacity-60"}`}
                style={{ borderLeft: `4px solid ${toneColor[tone]}` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <SeverityIcon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: toneColor[tone] }} aria-hidden="true" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-[var(--d-text)]">
                          {alert.parameter}: {alert.value}
                        </h2>
                        <Pill tone={tone}>{alert.severity}</Pill>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--d-muted)]">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {alert.timestamp}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {alert.location}
                        </span>
                        <span>{alert.state === "new" ? alert.status : alert.state === "read" ? "Read" : "Ignored"}</span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--d-soft)]">{alert.recommendedAction}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {alert.state !== "read" && (
                      <button type="button" onClick={() => setNotificationState(alert.id, "read")} className={buttonPrimary}>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" /> Read
                      </button>
                    )}
                    {alert.state === "new" && (
                      <button type="button" onClick={() => setNotificationState(alert.id, "ignored")} className={buttonSecondary}>
                        <BellOff className="h-3.5 w-3.5" aria-hidden="true" /> Ignore
                      </button>
                    )}
                    {alert.state !== "new" && (
                      <button type="button" onClick={() => setNotificationState(alert.id, "new")} className={buttonSecondary}>
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Mark unread
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </DashboardPage>
  );
}
