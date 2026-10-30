"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Bell, BellOff, Bot, Check, CheckCheck, ChevronRight, CircleAlert, Clock, Flag, Info, Layers, Lightbulb, MapPin, OctagonAlert, RotateCcw, ShieldCheck, WifiOff, Workflow, X } from "lucide-react";

import { type Icon } from "@/components/dashboard/dashboard-widgets";
import { type Notification, setNotificationState, useNotifications } from "@/components/dashboard/notifications";
import { DashboardPage, PageHeader, type Tone, activeHighlight, buttonGradient, toneColor, toneSoft } from "@/components/dashboard/page-kit";

// Rank 1 is the most urgent; alerts are listed by rank, then newest first.
const severity: Record<string, { tone: Tone; icon: Icon; rank: number }> = {
  Critical: { tone: "danger", icon: OctagonAlert, rank: 1 },
  "Sensor Failure": { tone: "danger", icon: WifiOff, rank: 1 },
  Warning: { tone: "warn", icon: AlertTriangle, rank: 2 },
  Automation: { tone: "accent", icon: Workflow, rank: 3 },
  "AI Recommendation": { tone: "accent", icon: Bot, rank: 3 },
  Information: { tone: "info", icon: Info, rank: 4 },
};
const fallback = { tone: "muted" as Tone, icon: Info, rank: 4 };
const priorities: { rank: number; label: string; tone: Tone }[] = [
  { rank: 1, label: "Urgent", tone: "danger" },
  { rank: 2, label: "High", tone: "warn" },
  { rank: 3, label: "Review", tone: "accent" },
  { rank: 4, label: "Info", tone: "info" },
];
const rankOf = (alert: Notification) => (severity[alert.severity] ?? fallback).rank;

type Filter = "open" | "read" | "ignored" | "all";

const pillButton = "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--d-accent)]";
const ghostButton = `${pillButton} text-[var(--d-soft)] hover:bg-[var(--d-chip-hover)] hover:text-[var(--d-text)]`;

export default function AlertsPage() {
  const { items } = useNotifications();
  const [filter, setFilter] = useState<Filter>("open");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const byState: Record<Filter, Notification[]> = {
    open: items.filter((alert) => alert.state === "new"),
    read: items.filter((alert) => alert.state === "read"),
    ignored: items.filter((alert) => alert.state === "ignored"),
    all: items,
  };
  const open = byState.open;
  const urgent = open.filter((alert) => rankOf(alert) === 1).length;
  const sensorsOffline = items.filter((alert) => alert.severity === "Sensor Failure" && alert.state !== "ignored").length;

  // Items arrive newest first, so a stable sort keeps newest first within each priority.
  const groups = priorities
    .map((priority) => ({ ...priority, alerts: byState[filter].filter((alert) => rankOf(alert) === priority.rank) }))
    .filter((group) => group.alerts.length > 0);

  const views: { id: Filter; label: string; count: number; detail: string; icon: Icon }[] = [
    { id: "open", label: "Open", count: open.length, detail: "Waiting for you to act", icon: Bell },
    { id: "read", label: "Read", count: byState.read.length, detail: "Handled and marked read", icon: Check },
    { id: "ignored", label: "Ignored", count: byState.ignored.length, detail: "No action was needed", icon: BellOff },
    { id: "all", label: "All", count: items.length, detail: "Every alert received", icon: Layers },
  ];

  return (
    <DashboardPage tint="alert">
      <PageHeader icon={Bell} eyebrow="Alert Center" title="Monitoring and alert response" detail="Mark alerts read once handled, or ignore ones that need no action" />

      <section aria-label="Alert summary" className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="dash-card rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--d-muted)]">Open alerts</div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-5xl font-semibold tabular-nums tracking-tight text-[var(--d-text)]">{open.length}</span>
                <span className="text-sm text-[var(--d-soft)]">
                  {open.length === 0 ? "All clear" : urgent ? `${urgent} need${urgent === 1 ? "s" : ""} attention now` : "Nothing urgent"}
                </span>
              </div>
            </div>
            {open.length > 0 && (
              <button type="button" onClick={() => open.forEach((alert) => setNotificationState(alert.id, "read"))} className={`${buttonGradient} px-4 py-2 text-sm`}>
                <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" /> Mark all read
              </button>
            )}
          </div>

          <div className="mt-5 flex h-2 gap-1 overflow-hidden rounded-full bg-[var(--d-chip)]" role="img" aria-label="Open alerts by priority">
            {priorities.map((priority) => {
              const count = open.filter((alert) => rankOf(alert) === priority.rank).length;
              return count ? <span key={priority.rank} className="h-full rounded-full" style={{ flexGrow: count, backgroundColor: toneColor[priority.tone] }} /> : null;
            })}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[var(--d-soft)]">
            {priorities.map((priority) => (
              <li key={priority.rank} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: toneColor[priority.tone] }} aria-hidden="true" />
                {priority.label}
                <span className="font-semibold tabular-nums text-[var(--d-text)]">{open.filter((alert) => rankOf(alert) === priority.rank).length}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="dash-card grid grid-cols-3 divide-x divide-[var(--d-line)] rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] py-5">
          <MiniStat label="Read" value={byState.read.length} icon={Check} tone="accent" />
          <MiniStat label="Ignored" value={byState.ignored.length} icon={BellOff} tone="muted" />
          <MiniStat label="Sensors offline" value={sensorsOffline} icon={WifiOff} tone={sensorsOffline ? "danger" : "muted"} />
        </div>
      </section>

      <section aria-label="Alerts">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-[var(--d-text)]">Alerts</h2>
          <p className="text-xs text-[var(--d-muted)]">Most urgent first, then newest</p>
        </div>
        <div role="tablist" aria-label="Alert filter" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {views.map((view) => {
            const active = filter === view.id;
            return (
              <button
                key={view.id}
                type="button"
                role="tab"
                id={`alerts-tab-${view.id}`}
                aria-selected={active}
                aria-controls={`alerts-view-${view.id}`}
                onClick={() => setFilter(view.id)}
                className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--d-accent)] ${
                  active ? activeHighlight : "border-[var(--d-card-border)] bg-[var(--d-card)] hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${active ? "bg-white/20" : "bg-[var(--d-accent-soft)] text-[var(--d-accent)]"}`}>
                  <view.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 pr-6">
                  <span className={`block text-base font-bold ${active ? "" : "text-[var(--d-text)]"}`}>
                    {view.label} <span className={`tabular-nums ${active ? "text-white/80" : "text-[var(--d-muted)]"}`}>{view.count}</span>
                  </span>
                  <span className={`mt-0.5 block truncate text-xs ${active ? "text-white/80" : "text-[var(--d-muted)]"}`}>{view.detail}</span>
                </span>
                {active && (
                  <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0f5c2e]">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`alerts-view-${filter}`} aria-labelledby={`alerts-tab-${filter}`} className="space-y-6">
          {groups.length === 0 && (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--d-card-border)] px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--d-accent-soft)]">
                <ShieldCheck className="h-6 w-6 text-[var(--d-accent)]" aria-hidden="true" />
              </span>
              <div className="mt-3 text-sm font-semibold text-[var(--d-text)]">{filter === "open" ? "All clear" : "Nothing here"}</div>
              <p className="mt-1 text-xs text-[var(--d-muted)]">{filter === "open" ? "Every alert has been handled." : "No alerts match this filter."}</p>
            </div>
          )}

          {groups.map((group) => (
            <div key={group.rank}>
              <div className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: toneColor[group.tone] }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: toneColor[group.tone] }} aria-hidden="true" />
                {group.label}
                <span className="text-[var(--d-muted)]">{group.alerts.length}</span>
                <span className="h-px flex-1 bg-[var(--d-line)]" aria-hidden="true" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {group.alerts.map((alert) => (
                  <AlertTile key={alert.id} alert={alert} onOpen={() => setSelectedId(alert.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <AlertDetails alert={items.find((alert) => alert.id === selectedId) ?? null} onClose={() => setSelectedId(null)} />
    </DashboardPage>
  );
}

function MiniStat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: Icon; tone: Tone }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-2 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: toneSoft[tone] }}>
        <Icon className="h-4 w-4" style={{ color: toneColor[tone] }} aria-hidden="true" />
      </span>
      <span className="text-2xl font-semibold tabular-nums text-[var(--d-text)]">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--d-muted)]">{label}</span>
    </div>
  );
}

const stateLabel = (alert: Notification) => (alert.state === "new" ? alert.status : alert.state === "read" ? "Read" : "Ignored");

// Compact block: severity, heading and where/when. Clicking it opens the full details.
function AlertTile({ alert, onOpen }: { alert: Notification; onOpen: () => void }) {
  const { tone: severityTone, icon: SeverityIcon } = severity[alert.severity] ?? fallback;
  const handled = alert.state !== "new";
  // Handled alerts drop their colour so open ones stand out.
  const tone = handled ? "muted" : severityTone;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={`dash-card group flex h-full flex-col rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--d-accent)] ${
        handled ? "opacity-70 hover:opacity-100" : "hover:-translate-y-0.5 hover:shadow-lg"
      }`}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: toneSoft[tone] }}>
          <SeverityIcon className="h-5 w-5" style={{ color: toneColor[tone] }} aria-hidden="true" />
          {!handled && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--d-card)]" style={{ backgroundColor: toneColor[severityTone] }}>
              <span className="sr-only">Unread</span>
            </span>
          )}
        </span>
        <ChevronRight className="h-4 w-4 text-[var(--d-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>

      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: toneColor[tone] }}>
        {alert.severity}
      </div>
      <h3 className="mt-0.5 text-base font-semibold leading-snug text-[var(--d-text)]">{alert.parameter}</h3>
      <p className="mt-0.5 line-clamp-1 text-sm text-[var(--d-soft)]">{alert.value}</p>

      <div className="mt-auto flex w-full flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-[var(--d-muted)]">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {alert.timestamp}
        </span>
        <span className="inline-flex min-w-0 items-center gap-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> <span className="truncate">{alert.location}</span>
        </span>
      </div>
    </button>
  );
}

function DetailRow({ icon: Icon, label, children }: { icon: Icon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="inline-flex items-center gap-2 text-[var(--d-muted)]">
        <Icon className="h-4 w-4" aria-hidden="true" /> {label}
      </dt>
      <dd className="text-right font-medium text-[var(--d-text)]">{children}</dd>
    </div>
  );
}

// Full details of one alert, with its actions. Rendered inside the dashboard so it keeps the theme colours.
function AlertDetails({ alert, onClose }: { alert: Notification | null; onClose: () => void }) {
  return (
    <Dialog.Root open={alert !== null} onOpenChange={(open) => !open && onClose()}>
      {alert && <AlertDetailsBody alert={alert} onClose={onClose} />}
    </Dialog.Root>
  );
}

function AlertDetailsBody({ alert, onClose }: { alert: Notification; onClose: () => void }) {
  const { tone, icon: SeverityIcon, rank } = severity[alert.severity] ?? fallback;
  const priority = priorities.find((item) => item.rank === rank) ?? priorities[3];
  const act = (state: Notification["state"]) => {
    setNotificationState(alert.id, state);
    onClose();
  };

  return (
    <>
      <Dialog.Overlay className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-[2px]" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[66] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--d-line)] bg-[var(--d-popup)] text-[var(--d-text)] shadow-2xl">
        <div className="flex items-start gap-4 p-5" style={{ background: `linear-gradient(180deg, ${toneSoft[tone]}, transparent)` }}>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: toneSoft[tone] }}>
            <SeverityIcon className="h-6 w-6" style={{ color: toneColor[tone] }} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: toneColor[tone] }}>
              {alert.severity}
            </div>
            <Dialog.Title className="mt-0.5 text-lg font-semibold leading-snug">{alert.parameter}</Dialog.Title>
            <Dialog.Description className="mt-0.5 text-sm font-medium" style={{ color: toneColor[tone] }}>
              {alert.value}
            </Dialog.Description>
          </div>
          <Dialog.Close aria-label="Close" className="-mr-1 -mt-1 rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
            <X className="h-4 w-4" aria-hidden="true" />
          </Dialog.Close>
        </div>

        <div className="space-y-4 px-5 pb-5">
          <div className="rounded-xl bg-[var(--d-chip)] p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--d-muted)]">
              <Lightbulb className="h-4 w-4" aria-hidden="true" /> Recommended action
            </div>
            <p className="mt-1.5 text-sm leading-6 text-[var(--d-text)]">{alert.recommendedAction}</p>
          </div>

          <dl className="divide-y divide-[var(--d-line)] text-sm">
            <DetailRow icon={Flag} label="Priority">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: toneColor[priority.tone] }} aria-hidden="true" />
                {priority.label}
              </span>
            </DetailRow>
            <DetailRow icon={Clock} label="Time">{alert.timestamp}</DetailRow>
            <DetailRow icon={MapPin} label="Location">{alert.location}</DetailRow>
            <DetailRow icon={CircleAlert} label="Status">{stateLabel(alert)}</DetailRow>
          </dl>

          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--d-line)] pt-4">
            {alert.state === "new" && (
              <button type="button" onClick={() => act("ignored")} className={`${ghostButton} bg-[var(--d-chip)] px-4 py-2 text-sm`}>
                <BellOff className="h-4 w-4" aria-hidden="true" /> Ignore
              </button>
            )}
            {alert.state !== "new" && (
              <button type="button" onClick={() => act("new")} className={`${ghostButton} bg-[var(--d-chip)] px-4 py-2 text-sm`}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Mark unread
              </button>
            )}
            {alert.state !== "read" && (
              <button type="button" onClick={() => act("read")} className={`${buttonGradient} px-4 py-2 text-sm`}>
                <Check className="h-4 w-4" aria-hidden="true" /> Mark read
              </button>
            )}
          </div>
        </div>
      </Dialog.Content>
    </>
  );
}
