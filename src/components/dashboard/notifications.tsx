"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Bell, Check, EyeOff, Info, OctagonAlert, Siren, Sparkles, TriangleAlert, Volume2, VolumeX, X } from "lucide-react";

import { alertItems } from "@/data/mock";
import { activeHighlight, buttonGradient } from "@/components/dashboard/page-kit";
import type { AlertItem } from "@/types";

export type NotificationState = "new" | "read" | "ignored";
export type Notification = AlertItem & { state: NotificationState };

// Severities that open the red alarm window with the siren; everything else pops up as a small window.
const dangerSeverities = new Set<AlertItem["severity"]>(["Critical", "Warning", "Sensor Failure"]);
export const isDanger = (item: AlertItem) => dangerSeverities.has(item.severity);

const severityIcon: Record<string, typeof Info> = {
  Critical: OctagonAlert,
  Warning: TriangleAlert,
  "Sensor Failure": OctagonAlert,
  "AI Recommendation": Sparkles,
};

const severityColor: Record<string, string> = {
  Critical: "var(--d-danger)",
  Warning: "var(--d-danger)",
  "Sensor Failure": "var(--d-danger)",
  Information: "var(--d-info)",
  "AI Recommendation": "var(--d-accent)",
  Automation: "var(--d-accent)",
};

/* ---------- Store: one list shared by the bell, the popups and the alert center ---------- */

type Store = { items: Notification[]; hidden: string[]; started: boolean };

// Read/ignored choices are saved per browser so handled alerts don't pop up again after a reload.
const storageKey = "dashboard-notifications";
const listeners = new Set<() => void>();
const serverStore: Store = { items: alertItems.map((item) => ({ ...item, state: "new" })), hidden: [], started: false };
let store: Store | null = null;
// Saved read/ignored choices, kept for pushed notifications too (they come back after a reload).
let saved: Record<string, NotificationState> = {};

function loadStore(): Store {
  if (store) return store;
  try {
    saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
  } catch {
    // Storage blocked: start with everything unread.
  }
  store = { ...serverStore, items: serverStore.items.map((item) => ({ ...item, state: saved[item.id] ?? "new" })) };
  return store;
}

function update(next: Store) {
  store = next;
  saved = { ...saved, ...Object.fromEntries(next.items.filter((item) => item.state !== "new").map((item) => [item.id, item.state])) };
  try {
    localStorage.setItem(storageKey, JSON.stringify(saved));
  } catch {
    // Storage blocked: changes hold until the page reloads.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useNotifications() {
  return useSyncExternalStore(subscribe, loadStore, () => serverStore);
}

export function setNotificationState(id: string, state: NotificationState) {
  const current = loadStore();
  update({ ...current, items: current.items.map((item) => (item.id === id ? { ...item, state } : item)) });
}

// Popups tuck themselves into the bell after this long; they stay unread there.
const popupMs = 5000;

// Closing a popup with × (or letting it time out) only hides it; the notification stays unread in the bell.
function hidePopup(...ids: string[]) {
  const current = loadStore();
  update({ ...current, hidden: [...current.hidden, ...ids] });
}

function startPopups() {
  const current = loadStore();
  if (!current.started) update({ ...current, started: true });
}

/**
 * Adds notifications raised elsewhere in the dashboard (e.g. medication reminders). Each id is added once;
 * a notification already read or ignored stays that way after a reload.
 */
export function pushNotifications(items: AlertItem[]) {
  const current = loadStore();
  const fresh = items.filter((item) => !current.items.some((existing) => existing.id === item.id));
  if (!fresh.length) return;
  update({ ...current, items: [...fresh.map((item) => ({ ...item, state: saved[item.id] ?? "new" })), ...current.items] });
}

export function sendTestWarning() {
  const current = loadStore();
  const now = new Date();
  const item: Notification = {
    id: `test-${now.getTime()}`,
    severity: "Warning",
    parameter: "Test alarm",
    value: "Demo warning",
    timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    location: "Shed A1",
    recommendedAction: "This is a test of the warning popup and alarm sound.",
    status: "Open",
    state: "new",
  };
  update({ ...current, started: true, items: [item, ...current.items] });
}

/* ---------- Alarm sound: a two-tone siren made with Web Audio, so no sound file is needed ---------- */

let audio: AudioContext | null = null;

function audioContext() {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;
  audio ??= new AudioContext();
  return audio;
}

function playAlarm() {
  const ctx = audioContext();
  if (!ctx) return;
  // Browsers keep audio suspended until the first click or key press; the next repeat plays once unlocked.
  if (ctx.state !== "running") {
    void ctx.resume();
    return;
  }
  const start = ctx.currentTime;
  for (let beep = 0; beep < 6; beep++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const at = start + beep * 0.22;
    osc.type = "square";
    osc.frequency.setValueAtTime(beep % 2 ? 700 : 980, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.09, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + 0.21);
  }
}

/* ---------- Header bell with the notification list ---------- */

function ActionButtons({ id, compact }: { id: string; compact?: boolean }) {
  const size = compact ? "h-8 px-2.5 text-xs" : "h-10 px-4 text-sm";
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setNotificationState(id, "read")}
        className={`${buttonGradient} ${size}`}
      >
        <Check className="h-3.5 w-3.5" aria-hidden="true" /> Read
      </button>
      <button
        type="button"
        onClick={() => setNotificationState(id, "ignored")}
        className={`inline-flex items-center gap-1.5 rounded-xl bg-[var(--d-chip)] font-medium text-[var(--d-text)] hover:bg-[var(--d-chip-hover)] ${size}`}
      >
        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> Ignore
      </button>
    </div>
  );
}

export function NotificationBell() {
  const { items } = useNotifications();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const visible = items.filter((item) => (showAll ? item.state !== "ignored" : item.state === "new"));
  const unread = items.filter((item) => item.state === "new").length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--d-chip)] text-[var(--d-text)] hover:bg-[var(--d-chip-hover)]"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--d-danger)] px-1 text-[10px] font-bold text-white">{unread}</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--d-line)] bg-[var(--d-popup)] text-[var(--d-text)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--d-line)] px-4 py-3">
              <div className="text-sm font-semibold">Notifications</div>
              <div role="group" aria-label="Show" className="flex gap-0.5 rounded-full bg-[var(--d-chip)] p-0.5 text-xs font-semibold">
                {[
                  { all: false, label: `Unread ${unread}` },
                  { all: true, label: "All" },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    aria-pressed={showAll === option.all}
                    onClick={() => setShowAll(option.all)}
                    className={`rounded-full px-3 py-1 transition-colors ${
                      showAll === option.all ? activeHighlight : "text-[var(--d-muted)] hover:text-[var(--d-text)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-h-[60vh] divide-y divide-[var(--d-line)] overflow-y-auto">
              {visible.length === 0 && <div className="px-4 py-8 text-center text-sm text-[var(--d-muted)]">{showAll ? "Nothing here" : "You're all caught up"}</div>}
              {visible.map((item) => {
                const Icon = severityIcon[item.severity] ?? Info;
                return (
                  <div key={item.id} className={`px-4 py-3 ${item.state === "read" ? "opacity-60" : ""}`}>
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: severityColor[item.severity] ?? "var(--d-muted)" }} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-semibold">
                            {item.parameter}: {item.value}
                          </div>
                          <div className="shrink-0 text-[10px] text-[var(--d-muted)]">{item.timestamp}</div>
                        </div>
                        <div className="mt-0.5 text-xs text-[var(--d-soft)]">{item.recommendedAction}</div>
                        <div className="mt-2">
                          {item.state === "new" ? <ActionButtons id={item.id} compact /> : <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">Read</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-[var(--d-line)] px-4 py-3 text-xs">
              <Link href="/dashboard/alerts" onClick={() => setOpen(false)} className="font-semibold text-[var(--d-accent)] hover:underline">
                Open alert center
              </Link>
              <button type="button" onClick={sendTestWarning} className="inline-flex items-center gap-1.5 font-medium text-[var(--d-danger)] hover:underline">
                <Siren className="h-3.5 w-3.5" aria-hidden="true" /> Send test warning
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Popups over the page ---------- */

export function NotificationPopups() {
  const { items, hidden, started } = useNotifications();
  const [mutedId, setMutedId] = useState<string | null>(null);

  const pending = started ? items.filter((item) => item.state === "new" && !hidden.includes(item.id)) : [];
  const danger = pending.find(isDanger) ?? null;
  const toasts = pending.filter((item) => !isDanger(item)).slice(0, 3);
  const dangerId = danger?.id ?? null;
  const muted = dangerId !== null && mutedId === dangerId;

  // New alerts pop up shortly after the dashboard opens, once per visit.
  useEffect(() => {
    const timer = window.setTimeout(startPopups, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  // Unlock audio on the first interaction so the siren can play.
  useEffect(() => {
    const unlock = () => void audioContext()?.resume();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // The siren repeats until the warning is read, ignored or silenced.
  useEffect(() => {
    if (!dangerId || muted) return;
    playAlarm();
    const timer = window.setInterval(playAlarm, 2500);
    return () => window.clearInterval(timer);
  }, [dangerId, muted]);

  // Every popup waiting when the timer starts, shown or queued, tucks into the bell together; the warning window too,
  // which stops the siren. Later arrivals get their own timer. Timers survive re-renders and are cleared on unmount.
  const scheduled = useRef(new Map<string, number>());
  const pendingIds = pending.map((item) => item.id).join(",");
  useEffect(() => {
    const fresh = pendingIds.split(",").filter((id) => id && !scheduled.current.has(id));
    if (!fresh.length) return;
    const timer = window.setTimeout(() => hidePopup(...fresh), popupMs);
    fresh.forEach((id) => scheduled.current.set(id, timer));
  }, [pendingIds]);
  useEffect(() => {
    const timers = scheduled.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const DangerIcon = danger ? (severityIcon[danger.severity] ?? TriangleAlert) : TriangleAlert;

  return (
    <>
      <div className="pointer-events-none fixed right-4 top-20 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite">
        {toasts.map((item) => (
          <Toast key={item.id} item={item} />
        ))}
      </div>

      <Dialog.Root open={danger !== null}>
        {danger && (
          <>
            <Dialog.Overlay className="fixed inset-0 z-[70] bg-red-950/50 backdrop-blur-[2px] motion-safe:animate-[alarm-flash_1.2s_ease-in-out_infinite]" />
            <Dialog.Content
              role="alertdialog"
              onEscapeKeyDown={(event) => event.preventDefault()}
              onInteractOutside={(event) => event.preventDefault()}
              className="fixed left-1/2 top-1/2 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border-2 border-red-600 bg-[var(--d-popup)] text-[var(--d-text)] shadow-[0_0_60px_rgba(220,38,38,0.55)]"
            >
              <div className="flex items-center gap-3 bg-red-600 px-5 py-4 text-white">
                <DangerIcon className="h-7 w-7 shrink-0 motion-safe:animate-pulse" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <Dialog.Title className="text-base font-bold uppercase tracking-[0.12em]">{danger.severity}</Dialog.Title>
                  <div className="text-xs text-red-100">
                    {danger.location} · {danger.timestamp}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMutedId(muted ? null : danger.id)}
                  aria-label={muted ? "Turn alarm sound on" : "Silence alarm"}
                  title={muted ? "Turn alarm sound on" : "Silence alarm"}
                  className="rounded-lg bg-white/15 p-2 hover:bg-white/25"
                >
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
              </div>
              <div className="p-5">
                <div className="text-xl font-bold text-[var(--d-danger)]">
                  {danger.parameter}: {danger.value}
                </div>
                <Dialog.Description className="mt-2 text-sm leading-6 text-[var(--d-soft)]">{danger.recommendedAction}</Dialog.Description>
                {pending.filter(isDanger).length > 1 && <div className="mt-3 text-xs text-[var(--d-muted)]">{pending.filter(isDanger).length - 1} more warning(s) waiting</div>}
                <div className="mt-5">
                  <ActionButtons id={danger.id} />
                </div>
              </div>
              <Countdown key={danger.id} color="rgb(220 38 38)" />
            </Dialog.Content>
          </>
        )}
      </Dialog.Root>
    </>
  );
}

function Countdown({ color }: { color: string }) {
  return (
    <div className="h-1 bg-[var(--d-chip)]" aria-hidden="true">
      <div className="popup-countdown h-full" style={{ backgroundColor: color, "--popup-ms": `${popupMs}ms` } as React.CSSProperties} />
    </div>
  );
}

function Toast({ item }: { item: Notification }) {
  const Icon = severityIcon[item.severity] ?? Info;
  const color = severityColor[item.severity] ?? "var(--d-info)";

  return (
    <div
      role="status"
      className="toast-enter pointer-events-auto overflow-hidden rounded-xl border border-[var(--d-line)] bg-[var(--d-popup)] text-[var(--d-text)] shadow-2xl"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color }}>
            {item.severity} · {item.location}
          </div>
          <div className="mt-1 text-sm font-semibold">
            {item.parameter}: {item.value}
          </div>
          <div className="mt-1 text-xs leading-5 text-[var(--d-soft)]">{item.recommendedAction}</div>
          <div className="mt-3">
            <ActionButtons id={item.id} compact />
          </div>
        </div>
        <button type="button" onClick={() => hidePopup(item.id)} aria-label="Close popup" className="rounded-md p-1 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <Countdown color={color} />
    </div>
  );
}
