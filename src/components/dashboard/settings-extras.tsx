"use client";

import { useState, useSyncExternalStore } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { BadgeCheck, CalendarClock, Check, Download, Minus, Pencil, Phone, Plus, Send, ShoppingBag, UserPlus, Wifi, Wrench, X } from "lucide-react";

import { formatDate, useToday } from "@/components/dashboard/batch-store";
import { type FarmUser, type FeatureId, type Role, currentUserId, dashboardFeatures, roles, useFarmUsers } from "@/components/dashboard/farm-users";
import { buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";
import { sellerCatalog } from "@/data/mock";
import { contactPhone, contactPhoneHref, whatsappLink } from "@/lib/contact";

const field = "w-full rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] px-3 py-2 text-sm font-semibold text-[var(--d-text)] outline-none focus:border-[var(--d-accent)]";
const label = "mb-1.5 block text-xs font-semibold text-[var(--d-soft)]";
const card = "dash-card rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-5 sm:p-6";

function PanelHeading({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-[var(--d-text)]">{title}</h2>
        <p className="mt-0.5 text-sm text-[var(--d-muted)]">{detail}</p>
      </div>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------- Service center

type Notice = { id: string; kind: "Update" | "Device issue" | "Calibration" | "Plan" | "Visit"; title: string; detail: string; date: string; action?: string; done?: boolean };
type ServiceRequest = { id: string; ticket: string; device: string; issue: string; description: string; preferred: string; phone: string; status: "Requested" | "Scheduled" | "Resolved"; raised: string };

type ServiceState = { notices: Notice[]; requests: ServiceRequest[] };
const defaultService: ServiceState = {
  notices: [
    { id: "n1", kind: "Device issue", title: "Plot 1 soil probe is offline", detail: "No data for 6 hours. Check its battery or ask for a technician.", date: "2026-10-17", action: "Request service" },
    { id: "n2", kind: "Update", title: "Firmware 2.5.0 for the shed controller", detail: "Faster fan response and a fix for the humidifier delay.", date: "2026-10-15", action: "Install update" },
    { id: "n3", kind: "Calibration", title: "Gas monitor calibration due", detail: "NH₃ / CO₂ sensors should be calibrated every 6 months.", date: "2026-10-25", action: "Schedule" },
    { id: "n4", kind: "Visit", title: "Technician visit booked", detail: "Routine check of pump controller and gateway.", date: "2026-10-21" },
    { id: "n5", kind: "Plan", title: "Annual maintenance plan renews", detail: "Covers 2 visits, free calibration and priority support.", date: "2026-11-30", action: "Renew plan" },
  ],
  requests: [{ id: "r1", ticket: "SR-1041", device: "Exhaust fan relay", issue: "Not working", description: "Relay clicks but the fan does not start.", preferred: "2026-10-09", phone: "+91 98400 11223", status: "Resolved", raised: "2026-10-07" }],
};

const serviceKey = "service-center";
const serviceListeners = new Set<() => void>();
let serviceState: ServiceState | null = null;
const readService = (): ServiceState => {
  if (serviceState) return serviceState;
  serviceState = defaultService;
  try {
    const saved = JSON.parse(localStorage.getItem(serviceKey) ?? "null");
    if (saved && Array.isArray(saved.notices)) serviceState = { notices: saved.notices, requests: Array.isArray(saved.requests) ? saved.requests : [] };
  } catch {
    // Storage blocked: keep the demo notices.
  }
  return serviceState;
};
const writeService = (next: ServiceState) => {
  serviceState = next;
  try {
    localStorage.setItem(serviceKey, JSON.stringify(next));
  } catch {
    // Storage blocked: holds until reload.
  }
  serviceListeners.forEach((listener) => listener());
};
const subscribeService = (listener: () => void) => {
  serviceListeners.add(listener);
  return () => serviceListeners.delete(listener);
};

const noticeIcon = { Update: Download, "Device issue": Wifi, Calibration: Wrench, Plan: BadgeCheck, Visit: CalendarClock };
const issueTypes = ["Not working", "Wrong readings", "Connectivity", "New installation", "Relocation", "Other"];

export function ServiceCenter({ devices }: { devices: string[] }) {
  const service = useSyncExternalStore(subscribeService, readService, () => defaultService);
  const today = useToday();
  const [requesting, setRequesting] = useState<string | null>(null);
  const [device, setDevice] = useState(devices[0] ?? "");
  const [issue, setIssue] = useState(issueTypes[0]);
  const [description, setDescription] = useState("");
  const [preferred, setPreferred] = useState(today);
  const [phone, setPhone] = useState("");
  const open = service.notices.filter((notice) => !notice.done);

  const markDone = (id: string) => writeService({ ...service, notices: service.notices.map((notice) => (notice.id === id ? { ...notice, done: true } : notice)) });

  return (
    <div className="space-y-6">
      <section className={card}>
        <PanelHeading title="Service notifications" detail={`${open.length} need attention · updates, calibration, plan renewal and visits`} />
        <div className="space-y-2.5">
          {service.notices.map((notice) => {
            const NoticeIcon = noticeIcon[notice.kind];
            return (
              <div key={notice.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3.5 ${notice.done ? "border-[var(--d-line)] opacity-60" : notice.kind === "Device issue" ? "border-[var(--d-warn)] bg-[var(--d-warn-soft)]" : "border-[var(--d-card-border)] bg-[var(--d-inset)]"}`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notice.kind === "Device issue" ? "bg-[var(--d-warn)] text-white" : "bg-[var(--d-accent-soft)] text-[var(--d-accent)]"}`}>
                  <NoticeIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--d-text)]">{notice.title}</span>
                    <span className="rounded-full bg-[var(--d-chip)] px-2 py-0.5 text-[10px] font-semibold text-[var(--d-muted)]">{notice.kind}</span>
                  </div>
                  <div className="text-xs text-[var(--d-muted)]">
                    {notice.detail} · {formatDate(notice.date)}
                  </div>
                </div>
                {notice.done ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--d-accent)]">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" /> Done
                  </span>
                ) : notice.action === "Request service" ? (
                  <button type="button" onClick={() => setRequesting(notice.id)} className={buttonPrimary}>
                    <Wrench className="h-3.5 w-3.5" aria-hidden="true" /> Request service
                  </button>
                ) : notice.action ? (
                  <button type="button" onClick={() => markDone(notice.id)} className={buttonPrimary}>
                    {notice.action}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className={card}>
        <PanelHeading
          title="Service requests"
          detail="Raise a ticket for a device problem or a new installation"
          action={
            <button type="button" onClick={() => setRequesting("new")} className={buttonPrimary}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> New request
            </button>
          }
        />
        {service.requests.length === 0 ? (
          <p className="text-sm text-[var(--d-muted)]">No requests yet.</p>
        ) : (
          <div className="divide-y divide-[var(--d-line)]">
            {service.requests.map((request) => (
              <div key={request.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="rounded-lg bg-[var(--d-chip)] px-2 py-1 font-mono text-xs font-semibold text-[var(--d-text)]">{request.ticket}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--d-text)]">
                    {request.device} · {request.issue}
                  </div>
                  <div className="truncate text-xs text-[var(--d-muted)]">
                    {request.description || "No description"} · raised {formatDate(request.raised)} · visit {formatDate(request.preferred)}
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${request.status === "Resolved" ? "bg-[var(--d-accent-soft)] text-[var(--d-accent)]" : "bg-[var(--d-warn-soft)] text-[var(--d-warn)]"}`}>{request.status}</span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 flex items-center gap-1.5 text-xs text-[var(--d-muted)]">
          <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Urgent? Call the service desk:{" "}
          <a href={contactPhoneHref} className="font-semibold text-[var(--d-accent)] hover:underline">
            {contactPhone}
          </a>
        </p>
      </section>

      {requesting && (
        <Dialog.Root open onOpenChange={(value) => !value && setRequesting(null)}>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const ticket = `SR-${1041 + service.requests.length + 1}`;
                writeService({
                  notices: requesting === "new" ? service.notices : service.notices.map((notice) => (notice.id === requesting ? { ...notice, done: true } : notice)),
                  requests: [{ id: `r-${Date.now()}`, ticket, device, issue, description: description.trim(), preferred, phone: phone.trim(), status: "Requested", raised: today }, ...service.requests],
                });
                setDescription("");
                setRequesting(null);
              }}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <Dialog.Title className="text-lg font-semibold">Request service</Dialog.Title>
                  <Dialog.Description className="mt-0.5 text-xs text-[var(--d-muted)]">The service team confirms the visit by phone.</Dialog.Description>
                </div>
                <Dialog.Close aria-label="Close" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className={label}>Device</span>
                  <select value={device} onChange={(event) => setDevice(event.target.value)} className={field}>
                    {[...devices, "Other / new device"].map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={label}>Problem</span>
                  <select value={issue} onChange={(event) => setIssue(event.target.value)} className={field}>
                    {issueTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={label}>Preferred visit date</span>
                  <input type="date" min={today} value={preferred} onChange={(event) => setPreferred(event.target.value)} className={field} />
                </label>
                <label className="block">
                  <span className={label}>Contact phone</span>
                  <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91" className={field} />
                </label>
              </div>
              <label className="mt-3 block">
                <span className={label}>What is happening?</span>
                <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. Shows 0% moisture since yesterday evening" className={`${field} resize-y font-normal`} />
              </label>
              <div className="mt-5 flex justify-end gap-2">
                <Dialog.Close className={buttonSecondary}>Cancel</Dialog.Close>
                <button type="submit" className={buttonPrimary}>
                  <Send className="h-3.5 w-3.5" aria-hidden="true" /> Send request
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Device store

export function DeviceStore() {
  const [group, setGroup] = useState<"All" | "Shed" | "Field">("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const items = sellerCatalog.filter((item) => group === "All" || item.group === group);
  const chosen = Object.entries(cart).filter(([, quantity]) => quantity > 0);
  const setQuantity = (name: string, quantity: number) => setCart((current) => ({ ...current, [name]: Math.max(0, quantity) }));
  const message = `Hello Paari Seritech, I would like a quote for:\n${chosen.map(([name, quantity]) => `• ${name} × ${quantity}`).join("\n")}`;

  return (
    <div className="space-y-6">
      <section className={card}>
        <PanelHeading
          title="Available devices"
          detail="Sensors and controllers from Paari Seritech that work with this dashboard"
          action={
            <div role="tablist" aria-label="Device group" className="inline-flex rounded-lg bg-[var(--d-chip)] p-1">
              {(["All", "Shed", "Field"] as const).map((value) => (
                <button key={value} type="button" role="tab" aria-selected={group === value} onClick={() => setGroup(value)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${group === value ? "accent-fill" : "text-[var(--d-muted)] hover:text-[var(--d-text)]"}`}>
                  {value}
                </button>
              ))}
            </div>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const quantity = cart[item.name] ?? 0;
            return (
              <article key={item.name} className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-inset)] transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-md">
                <div className="relative aspect-[4/3] overflow-hidden bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer */}
                  <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full bg-[var(--d-accent-deep)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">{item.group}</span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-bold text-[var(--d-text)]">{item.name}</h3>
                  <p className="mt-1 flex-1 text-xs leading-5 text-[var(--d-muted)]">{item.summary}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--d-soft)]">{item.price}</span>
                    {quantity === 0 ? (
                      <button type="button" onClick={() => setQuantity(item.name, 1)} className={buttonPrimary}>
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add to enquiry
                      </button>
                    ) : (
                      <div className="inline-flex items-center rounded-lg border border-[var(--d-card-border)] bg-[var(--d-popup)]">
                        <button type="button" onClick={() => setQuantity(item.name, quantity - 1)} aria-label={`One less ${item.name}`} className="p-2 text-[var(--d-muted)] hover:text-[var(--d-text)]">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold tabular-nums">{quantity}</span>
                        <button type="button" onClick={() => setQuantity(item.name, quantity + 1)} aria-label={`One more ${item.name}`} className="p-2 text-[var(--d-muted)] hover:text-[var(--d-text)]">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={`${card} sticky bottom-4`}>
        <div className="flex flex-wrap items-center gap-3">
          <ShoppingBag className="h-5 w-5 text-[var(--d-accent)]" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-[var(--d-text)]">{chosen.length ? `${chosen.reduce((sum, [, quantity]) => sum + quantity, 0)} devices in your enquiry` : "Your enquiry is empty"}</div>
            <div className="truncate text-xs text-[var(--d-muted)]">{chosen.length ? chosen.map(([name, quantity]) => `${name} × ${quantity}`).join(", ") : "Add devices above to ask for a quote."}</div>
          </div>
          <a
            href={chosen.length ? whatsappLink(message) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!chosen.length}
            className={`${buttonPrimary} ${chosen.length ? "" : "pointer-events-none opacity-50"}`}
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" /> Send enquiry on WhatsApp
          </a>
          <a href={contactPhoneHref} className={buttonSecondary}>
            <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Call sales
          </a>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- Team users (current farm)

export function UserDialog({ user, defaults, allowed, adminMode, onClose }: { user: FarmUser | null; defaults: Partial<FarmUser>; allowed: readonly FeatureId[]; adminMode?: boolean; onClose: () => void }) {
  const { save } = useFarmUsers();
  const today = useToday();
  const [draft, setDraft] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    role: user?.role ?? ((defaults.role ?? "Worker") as Role),
    features: user?.features ?? defaults.features ?? [...allowed],
  });
  const set = (next: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...next }));
  const error = !draft.name.trim() ? "Enter a name." : !/^[+\d][\d\s-]{7,}$/.test(draft.phone.trim()) ? "Enter a valid phone number." : "";
  const toggle = (id: FeatureId) => set({ features: draft.features.includes(id) ? draft.features.filter((item) => item !== id) : [...draft.features, id] });

  return (
    <Dialog.Root open onOpenChange={(value) => !value && onClose()}>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (error) return;
            save({
              id: user?.id ?? `u-${Date.now()}`,
              farm: user?.farm ?? defaults.farm ?? "",
              location: user?.location ?? defaults.location ?? "",
              package: user?.package ?? defaults.package ?? "Basic",
              status: user?.status ?? "Invited",
              joined: user?.joined ?? today,
              lastActive: user?.lastActive ?? "Not signed in yet",
              name: draft.name.trim(),
              phone: draft.phone.trim(),
              email: draft.email.trim() || undefined,
              role: draft.role,
              features: draft.features,
            });
            onClose();
          }}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-lg font-semibold">{user ? `Edit ${user.name}` : "Invite a team member"}</Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-[var(--d-muted)]">{user ? "Change their role and what they can open." : "They get an SMS with a link to sign in."}</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={label}>Name</span>
              <input value={draft.name} onChange={(event) => set({ name: event.target.value })} className={field} autoFocus />
            </label>
            <label className="block">
              <span className={label}>Phone</span>
              <input type="tel" value={draft.phone} onChange={(event) => set({ phone: event.target.value })} placeholder="+91 98400 00000" className={field} />
            </label>
            <label className="block">
              <span className={label}>Email (optional)</span>
              <input type="email" value={draft.email} onChange={(event) => set({ email: event.target.value })} className={field} />
            </label>
            <label className="block">
              <span className={label}>Role</span>
              <select value={draft.role} onChange={(event) => set({ role: event.target.value as Role })} disabled={user?.id === currentUserId && !adminMode} className={field}>
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4">
            <div className={label}>Can open</div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {dashboardFeatures
                .filter((feature) => allowed.includes(feature.id))
                .map((feature) => {
                  const core = "core" in feature;
                  const on = core || draft.features.includes(feature.id);
                  return (
                    <label key={feature.id} className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-semibold ${on ? "border-[var(--d-card-border)] bg-[var(--d-accent-soft)] text-[var(--d-text)]" : "border-[var(--d-line)] text-[var(--d-muted)]"} ${core ? "opacity-70" : "cursor-pointer"}`}>
                      <input type="checkbox" checked={on} disabled={core} onChange={() => toggle(feature.id)} className="accent-[var(--d-accent)]" />
                      {feature.label}
                    </label>
                  );
                })}
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--d-muted)]">Overview, Alerts and Settings are always available.</p>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[var(--d-danger-text)]">{error}</span>
            <div className="flex gap-2">
              <Dialog.Close className={buttonSecondary}>Cancel</Dialog.Close>
              <button type="submit" disabled={!!error} className={buttonPrimary}>
                {user ? "Save" : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" aria-hidden="true" /> Send invite
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function TeamUsers() {
  const { users, current, save, remove } = useFarmUsers();
  const [editing, setEditing] = useState<{ user: FarmUser | null } | null>(null);
  const team = users.filter((user) => user.farm === current.farm);

  return (
    <section className={card}>
      <PanelHeading
        title="Users"
        detail={`${team.length} people on ${current.farm} · ${current.package} package`}
        action={
          <button type="button" onClick={() => setEditing({ user: null })} className={buttonPrimary}>
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" /> Invite user
          </button>
        }
      />
      <div className="divide-y divide-[var(--d-line)]">
        {team.map((user) => (
          <div key={user.id} className="flex flex-wrap items-center gap-3 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full accent-fill text-sm font-bold text-white">{initials(user.name)}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[var(--d-text)]">{user.name}</span>
                {user.id === currentUserId && <span className="rounded-full bg-[var(--d-chip)] px-2 py-0.5 text-[10px] font-semibold text-[var(--d-muted)]">You</span>}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${user.status === "Active" ? "bg-[var(--d-accent-soft)] text-[var(--d-accent)]" : user.status === "Invited" ? "bg-[var(--d-warn-soft)] text-[var(--d-warn)]" : "bg-[var(--d-danger-soft)] text-[var(--d-danger-text)]"}`}>{user.status}</span>
              </div>
              <div className="truncate text-xs text-[var(--d-muted)]">
                {user.role} · {user.phone} · can open {user.features.length} sections · {user.lastActive}
              </div>
            </div>
            <button type="button" onClick={() => setEditing({ user })} className={buttonSecondary}>
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
            </button>
            {user.id !== currentUserId && (
              <>
                <button type="button" onClick={() => save({ ...user, status: user.status === "Suspended" ? "Active" : "Suspended" })} className={buttonSecondary}>
                  {user.status === "Suspended" ? "Restore" : "Suspend"}
                </button>
                <button
                  type="button"
                  onClick={() => window.confirm(`Remove ${user.name} from ${user.farm}?`) && remove(user.id)}
                  aria-label={`Remove ${user.name}`}
                  className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-danger-soft)] hover:text-[var(--d-danger-text)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      {editing && (
        <UserDialog
          user={editing.user}
          defaults={{ farm: current.farm, location: current.location, package: current.package, role: "Worker", features: current.features.filter((id) => id !== "settings") }}
          allowed={current.features}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}
