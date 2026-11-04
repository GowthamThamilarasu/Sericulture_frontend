"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Activity, BatteryMedium, Check, Cpu, ExternalLink, Eye, Package, Power, RefreshCw, Search, ShieldCheck, Signal, Stethoscope, UserPlus, Users, Wifi, WifiOff, X, AlertTriangle } from "lucide-react";

import { useToday } from "@/components/dashboard/batch-store";
import { type FarmUser, type FeatureId, type PackageId, currentUserId, dashboardFeatures, packageFeatures, packages, roles, useFarmUsers, userDevices } from "@/components/dashboard/farm-users";
import { SectionHeader } from "@/components/dashboard/monitor-widgets";
import { DashboardPage, PageHeader, StatTile, buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";
import { initials } from "@/components/dashboard/settings-extras";

const field = "w-full rounded-lg border border-[var(--d-line)] bg-[var(--d-popup)] px-3 py-2 text-sm font-semibold text-[var(--d-text)] outline-none focus:border-[var(--d-accent)]";
const label = "mb-1.5 block text-xs font-semibold text-[var(--d-soft)]";

// Package the selected features match, or Custom.
const packageFor = (features: FeatureId[]): PackageId => {
  const sorted = [...features].sort().join();
  return packages.find((item) => [...item.features].sort().join() === sorted)?.id ?? "Custom";
};

// ---- Create / edit a customer, with package and feature access ----

function AccessDialog({ user, onClose }: { user: FarmUser | null; onClose: () => void }) {
  const { save } = useFarmUsers();
  const today = useToday();
  const [draft, setDraft] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    farm: user?.farm ?? "",
    location: user?.location ?? "",
    role: user?.role ?? ("Owner" as FarmUser["role"]),
    features: user?.features ?? packageFeatures("Standard"),
  });
  const set = (next: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...next }));
  const pkg = packageFor(draft.features);
  const toggle = (id: FeatureId) => set({ features: draft.features.includes(id) ? draft.features.filter((item) => item !== id) : [...draft.features, id] });
  const error = !draft.name.trim() ? "Enter the customer's name." : !/^[+\d][\d\s-]{7,}$/.test(draft.phone.trim()) ? "Enter a valid phone number." : !draft.farm.trim() ? "Enter the farm name." : "";

  return (
    <Dialog.Root open onOpenChange={(value) => !value && onClose()}>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-[var(--d-line)] bg-[var(--d-popup)] p-5 text-[var(--d-text)] shadow-2xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (error) return;
            save({
              id: user?.id ?? `u-${Date.now()}`,
              status: user?.status ?? "Invited",
              joined: user?.joined ?? today,
              lastActive: user?.lastActive ?? "Not signed in yet",
              name: draft.name.trim(),
              phone: draft.phone.trim(),
              email: draft.email.trim() || undefined,
              farm: draft.farm.trim(),
              location: draft.location.trim(),
              role: draft.role,
              package: pkg,
              features: draft.features,
            });
            onClose();
          }}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-lg font-semibold">{user ? `${user.name}: access` : "Create user"}</Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-[var(--d-muted)]">Pick a package, then fine-tune the features this user can open.</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: "name" as const, name: "Name", type: "text", placeholder: "" },
              { key: "phone" as const, name: "Phone", type: "tel", placeholder: "+91 98400 00000" },
              { key: "email" as const, name: "Email (optional)", type: "email", placeholder: "" },
              { key: "farm" as const, name: "Farm", type: "text", placeholder: "e.g. Salem Silk Farm" },
              { key: "location" as const, name: "Location", type: "text", placeholder: "Town, district" },
            ].map((item) => (
              <label key={item.key} className="block">
                <span className={label}>{item.name}</span>
                <input type={item.type} value={draft[item.key]} placeholder={item.placeholder} onChange={(event) => set({ [item.key]: event.target.value })} className={field} />
              </label>
            ))}
            <label className="block">
              <span className={label}>Role</span>
              <select value={draft.role} onChange={(event) => set({ role: event.target.value as FarmUser["role"] })} className={field}>
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5">
            <div className={label}>Package</div>
            <div role="radiogroup" aria-label="Package" className="grid gap-2 sm:grid-cols-3">
              {packages.map((item) => {
                const active = pkg === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => set({ features: [...item.features] })}
                    className={`rounded-2xl border p-3 text-left transition-all ${active ? "border-transparent bg-gradient-to-br from-[var(--d-accent-deep)] to-[var(--d-accent-strong)] text-white shadow-md" : "border-[var(--d-card-border)] bg-[var(--d-card)] hover:-translate-y-0.5"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{item.id}</span>
                      {active && <Check className="h-4 w-4" aria-hidden="true" />}
                    </div>
                    <div className={`text-xs font-semibold ${active ? "text-white/85" : "text-[var(--d-accent)]"}`}>{item.price}</div>
                    <div className={`mt-1 text-[11px] leading-4 ${active ? "text-white/70" : "text-[var(--d-muted)]"}`}>{item.detail}</div>
                  </button>
                );
              })}
            </div>
            {pkg === "Custom" && <p className="mt-1.5 text-[11px] font-semibold text-[var(--d-warn)]">Custom selection: features differ from the standard packages.</p>}
          </div>

          <div className="mt-4">
            <div className={label}>Features ({draft.features.length} of {dashboardFeatures.length})</div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {dashboardFeatures.map((feature) => {
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
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--d-line)] pt-4">
            <span className="text-xs font-semibold text-[var(--d-danger-text)]">{error}</span>
            <div className="flex gap-2">
              <Dialog.Close className={buttonSecondary}>Cancel</Dialog.Close>
              <button type="submit" disabled={!!error} className={buttonPrimary}>
                {user ? "Save access" : "Create user"}
              </button>
            </div>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// ---- Remote view: the user's devices with diagnostics, beside a live copy of their dashboard ----

type DeviceState = { status?: "Online" | "Warning" | "Offline" | "Restarting"; log?: string[] };

function RemoteView({ user, onClose }: { user: FarmUser; onClose: () => void }) {
  const devices = userDevices(user);
  const [states, setStates] = useState<Record<string, DeviceState>>({});
  const [selected, setSelected] = useState(devices.find((device) => device.status !== "Online")?.id ?? devices[0]?.id);
  const device = devices.find((item) => item.id === selected);
  const statusOf = (id: string) => states[id]?.status ?? devices.find((item) => item.id === id)?.status ?? "Offline";
  const logLine = (id: string, line: string) => setStates((current) => ({ ...current, [id]: { ...current[id], log: [...(current[id]?.log ?? []), `${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}  ${line}`] } }));

  const ping = (id: string) => {
    const offline = statusOf(id) === "Offline";
    // Demo round-trip time: weaker signal, slower reply.
    const signal = devices.find((item) => item.id === id)?.signal ?? 50;
    logLine(id, offline ? "Ping: no reply (timed out after 5 s)" : `Ping: reply in ${40 + (100 - signal) * 3 + (states[id]?.log?.length ?? 0) % 7} ms`);
  };
  const restart = (id: string) => {
    setStates((current) => ({ ...current, [id]: { ...current[id], status: "Restarting" } }));
    logLine(id, "Restart command sent");
    window.setTimeout(() => {
      setStates((current) => ({ ...current, [id]: { ...current[id], status: "Online" } }));
      logLine(id, "Device back online after restart");
    }, 2500);
  };
  const diagnose = (id: string) => {
    const target = devices.find((item) => item.id === id);
    if (!target) return;
    const status = statusOf(id);
    [
      `Diagnostics started on ${target.serial}`,
      status === "Offline" ? "Network: no heartbeat since " + target.lastSeen : `Network: OK, signal ${target.signal}%`,
      target.battery === null ? "Power: mains supply OK" : `Battery: ${target.battery}%${target.battery < 30 ? " (replace soon)" : ""}`,
      `Firmware: ${target.firmware}${target.firmware.startsWith("1.") ? " (update 2.0 available)" : " (latest)"}`,
      target.issue ? `Finding: ${target.issue}` : "Sensors: readings within expected range",
      "Diagnostics finished",
    ].forEach((line, index) => window.setTimeout(() => logLine(id, line), 300 * (index + 1)));
  };

  const counts = { Online: 0, Warning: 0, Offline: 0 };
  devices.forEach((item) => {
    const status = statusOf(item.id);
    if (status === "Online" || status === "Restarting") counts.Online++;
    else counts[status]++;
  });

  return (
    <Dialog.Root open onOpenChange={(value) => !value && onClose()}>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
      <Dialog.Content className="fixed inset-3 z-[61] flex flex-col overflow-hidden rounded-3xl border border-[var(--d-line)] bg-[var(--d-popup)] text-[var(--d-text)] shadow-2xl sm:inset-6">
        <header className="flex shrink-0 flex-wrap items-center gap-3 bg-gradient-to-r from-[var(--d-accent-deep)] to-[color-mix(in_srgb,var(--d-accent-deep)_80%,var(--d-accent-strong))] px-5 py-4 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-bold ring-1 ring-white/20">{initials(user.name)}</span>
          <div className="min-w-0 flex-1">
            <Dialog.Title className="text-base font-bold">Remote view · {user.name}</Dialog.Title>
            <Dialog.Description className="text-xs text-white/75">
              {user.farm} · {user.location} · {user.package} package · {devices.length} devices
            </Dialog.Description>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--d-accent-bright)]" /> Live session
          </span>
          <a href="/dashboard/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25">
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Open dashboard
          </a>
          <Dialog.Close aria-label="End remote view" className="rounded-lg bg-white/15 p-2 hover:bg-white/25">
            <X className="h-5 w-5" />
          </Dialog.Close>
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[24rem_1fr]">
          <aside className="flex min-h-0 flex-col border-b border-[var(--d-line)] lg:border-b-0 lg:border-r">
            <div className="grid shrink-0 grid-cols-3 gap-2 p-3">
              {(
                [
                  { name: "Online", icon: Wifi, tone: "text-[var(--d-accent)]" },
                  { name: "Warning", icon: AlertTriangle, tone: "text-[var(--d-warn)]" },
                  { name: "Offline", icon: WifiOff, tone: "text-[var(--d-danger-text)]" },
                ] as const
              ).map((item) => (
                <div key={item.name} className="rounded-xl bg-[var(--d-inset)] px-3 py-2">
                  <div className={`flex items-center gap-1 text-[11px] font-semibold ${item.tone}`}>
                    <item.icon className="h-3.5 w-3.5" aria-hidden="true" /> {item.name}
                  </div>
                  <div className="text-lg font-bold tabular-nums">{counts[item.name]}</div>
                </div>
              ))}
            </div>
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-3">
              {devices.map((item) => {
                const status = statusOf(item.id);
                const color = status === "Online" ? "bg-[var(--d-accent)]" : status === "Warning" ? "bg-[var(--d-warn)]" : status === "Restarting" ? "bg-[var(--d-info)] animate-pulse" : "bg-[var(--d-danger)]";
                return (
                  <li key={item.id}>
                    <button type="button" onClick={() => setSelected(item.id)} aria-current={selected === item.id ? "true" : undefined} className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors ${selected === item.id ? "bg-[var(--d-accent-soft)] ring-1 ring-[var(--d-card-border)]" : "hover:bg-[var(--d-chip)]"}`}>
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{item.name}</span>
                        <span className="block truncate text-[11px] text-[var(--d-muted)]">{status === "Restarting" ? "Restarting…" : (item.issue ?? `${item.kind} · seen ${item.lastSeen}`)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto p-4">
            {device && (
              <section aria-label={`${device.name} diagnostics`} className="rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--d-accent-bright)] to-[var(--d-accent-strong)] text-white">
                    <Cpu className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold">{device.name}</h3>
                    <div className="text-xs text-[var(--d-muted)]">
                      {device.kind} · <span className="font-mono">{device.serial}</span> · firmware {device.firmware}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => ping(device.id)} className={buttonSecondary}>
                      <Activity className="h-3.5 w-3.5" aria-hidden="true" /> Ping
                    </button>
                    <button type="button" onClick={() => diagnose(device.id)} className={buttonSecondary}>
                      <Stethoscope className="h-3.5 w-3.5" aria-hidden="true" /> Run diagnostics
                    </button>
                    <button type="button" onClick={() => restart(device.id)} disabled={statusOf(device.id) === "Restarting"} className={buttonPrimary}>
                      <Power className="h-3.5 w-3.5" aria-hidden="true" /> Restart
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { name: "Status", value: statusOf(device.id), icon: Wifi },
                    { name: "Signal", value: statusOf(device.id) === "Offline" ? "–" : `${device.signal}%`, icon: Signal },
                    { name: "Battery", value: device.battery === null ? "Mains" : `${device.battery}%`, icon: BatteryMedium },
                    { name: "Last seen", value: device.lastSeen, icon: RefreshCw },
                  ].map((item) => (
                    <div key={item.name} className="rounded-xl bg-[var(--d-inset)] px-3 py-2">
                      <div className="flex items-center gap-1 text-[11px] text-[var(--d-muted)]">
                        <item.icon className="h-3.5 w-3.5 text-[var(--d-accent)]" aria-hidden="true" /> {item.name}
                      </div>
                      <div className="text-sm font-bold">{item.value}</div>
                    </div>
                  ))}
                </div>
                {device.issue && statusOf(device.id) !== "Online" && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-[var(--d-warn-soft)] px-3 py-2 text-xs font-semibold text-[var(--d-warn)]">
                    <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" /> {device.issue}
                  </div>
                )}
                <pre className="mt-3 max-h-36 overflow-y-auto rounded-xl bg-[#0b100d] p-3 font-mono text-[11px] leading-5 text-[#9be7a8]" aria-live="polite">
                  {(states[device.id]?.log ?? ["Ready. Ping, run diagnostics or restart this device."]).join("\n")}
                </pre>
              </section>
            )}

            <section aria-label="User's dashboard" className="flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--d-card-border)]">
              <div className="flex shrink-0 items-center gap-2 border-b border-[var(--d-line)] bg-[var(--d-inset)] px-3 py-2 text-xs text-[var(--d-muted)]">
                <Eye className="h-3.5 w-3.5 text-[var(--d-accent)]" aria-hidden="true" /> Dashboard preview · demo data in this browser until {user.name}&apos;s farm is connected to the server
              </div>
              <iframe title={`${user.name}'s dashboard`} src="/dashboard/" className="h-full min-h-[26rem] w-full flex-1 bg-white" />
            </section>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// ---- Page ----

export default function AdminPage() {
  const { users, save } = useFarmUsers();
  const [query, setQuery] = useState("");
  const [packageFilter, setPackageFilter] = useState<PackageId | "All">("All");
  const [editing, setEditing] = useState<{ user: FarmUser | null } | null>(null);
  const [remote, setRemote] = useState<FarmUser | null>(null);
  const shown = users.filter((user) => (packageFilter === "All" || user.package === packageFilter) && `${user.name} ${user.farm} ${user.phone} ${user.location}`.toLowerCase().includes(query.trim().toLowerCase()));
  const allDevices = users.flatMap((user) => userDevices(user));
  const problems = allDevices.filter((device) => device.status !== "Online").length;

  return (
    <DashboardPage tint="slate">
      <PageHeader icon={ShieldCheck} eyebrow="Admin" title="Customers, packages and remote support" detail="Choose what each user can open, create accounts, and inspect their devices remotely" badge="Installer access" />

      <section aria-label="Overview">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatTile label="Users" value={users.length} icon={Users} note={`${users.filter((user) => user.status === "Active").length} active · ${users.filter((user) => user.status === "Invited").length} invited`} />
          <StatTile label="Farms" value={new Set(users.map((user) => user.farm)).size} icon={Package} />
          <StatTile label="Devices" value={allDevices.length} icon={Cpu} note={`${allDevices.length - problems} online`} />
          <StatTile label="Need attention" value={problems} icon={AlertTriangle} tone={problems ? "warn" : "accent"} note="Offline or warning devices" />
        </div>
      </section>

      <section aria-label="Packages">
        <SectionHeader icon={Package} title="Packages" detail="What each package includes · a user's features can also be customised" />
        <div className="grid gap-4 md:grid-cols-3">
          {packages.map((item, index) => (
            <article key={item.id} className={`relative overflow-hidden rounded-3xl border p-5 ${index === 2 ? "border-transparent bg-gradient-to-br from-[var(--d-accent-deep)] via-[color-mix(in_srgb,var(--d-accent-deep)_80%,var(--d-accent-strong))] to-[color-mix(in_srgb,var(--d-accent-deep)_65%,black)] text-white" : "dash-card border-[var(--d-card-border)] bg-[var(--d-card)]"}`}>
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-bold">{item.id}</h3>
                <span className={`text-xs font-semibold ${index === 2 ? "text-[#c8f5cf]" : "text-[var(--d-accent)]"}`}>{(() => {
                    const count = users.filter((user) => user.package === item.id).length;
                    return `${count} ${count === 1 ? "user" : "users"}`;
                  })()}</span>
              </div>
              <div className={`text-sm font-semibold ${index === 2 ? "text-white/85" : "text-[var(--d-soft)]"}`}>{item.price}</div>
              <p className={`mt-1 text-xs ${index === 2 ? "text-white/70" : "text-[var(--d-muted)]"}`}>{item.detail}</p>
              <ul className="mt-3 flex flex-wrap gap-1">
                {dashboardFeatures.map((feature) => {
                  const on = (item.features as readonly string[]).includes(feature.id);
                  return (
                    <li key={feature.id} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${on ? (index === 2 ? "bg-white/15 text-white" : "bg-[var(--d-accent-soft)] text-[var(--d-accent)]") : index === 2 ? "text-white/35 line-through" : "text-[var(--d-muted)] line-through opacity-60"}`}>
                      {feature.label}
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Users">
        <SectionHeader icon={Users} title="Users" detail="Edit access, open a remote view to check their devices, or suspend an account" />
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label className="relative min-w-[14rem] flex-1">
            <span className="sr-only">Search users</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--d-muted)]" aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, farm, phone or place" className={`${field} pl-9`} />
          </label>
          <div role="tablist" aria-label="Package filter" className="inline-flex rounded-lg bg-[var(--d-chip)] p-1">
            {(["All", "Basic", "Standard", "Pro", "Custom"] as const).map((value) => (
              <button key={value} type="button" role="tab" aria-selected={packageFilter === value} onClick={() => setPackageFilter(value)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${packageFilter === value ? "accent-fill" : "text-[var(--d-muted)] hover:text-[var(--d-text)]"}`}>
                {value}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setEditing({ user: null })} className={buttonPrimary}>
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" /> Create user
          </button>
        </div>

        <div className="dash-card overflow-x-auto rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)]">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-[var(--d-line)] text-[11px] uppercase tracking-[0.12em] text-[var(--d-muted)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">User</th>
                <th scope="col" className="px-4 py-3 font-semibold">Farm</th>
                <th scope="col" className="px-4 py-3 font-semibold">Package</th>
                <th scope="col" className="px-4 py-3 font-semibold">Devices</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((user) => {
                const devices = userDevices(user);
                const issues = devices.filter((device) => device.status !== "Online").length;
                return (
                  <tr key={user.id} className="border-b border-[var(--d-line)] last:border-b-0 hover:bg-[var(--d-inset)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--d-accent-bright)] to-[var(--d-accent-strong)] text-xs font-bold text-white">{initials(user.name)}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-semibold text-[var(--d-text)]">
                            {user.name}
                            {user.id === currentUserId && <span className="rounded-full bg-[var(--d-chip)] px-1.5 text-[10px] text-[var(--d-muted)]">You</span>}
                          </div>
                          <div className="text-xs text-[var(--d-muted)]">
                            {user.role} · {user.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--d-text)]">{user.farm}</div>
                      <div className="text-xs text-[var(--d-muted)]">{user.location}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.package === "Pro" ? "bg-[var(--d-accent-deep)] text-white" : user.package === "Custom" ? "bg-[var(--d-warn-soft)] text-[var(--d-warn)]" : "bg-[var(--d-accent-soft)] text-[var(--d-accent)]"}`}>{user.package}</span>
                      <div className="mt-1 text-[11px] text-[var(--d-muted)]">{user.features.length} features</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold tabular-nums text-[var(--d-text)]">{devices.length}</div>
                      <div className={`text-[11px] font-semibold ${issues ? "text-[var(--d-warn)]" : "text-[var(--d-accent)]"}`}>{issues ? `${issues} need attention` : "All online"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === "Active" ? "bg-[var(--d-accent-soft)] text-[var(--d-accent)]" : user.status === "Invited" ? "bg-[var(--d-warn-soft)] text-[var(--d-warn)]" : "bg-[var(--d-danger-soft)] text-[var(--d-danger-text)]"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.status === "Active" ? "bg-[var(--d-accent)]" : user.status === "Invited" ? "bg-[var(--d-warn)]" : "bg-[var(--d-danger)]"}`} />
                        {user.status}
                      </span>
                      <div className="mt-1 text-[11px] text-[var(--d-muted)]">{user.lastActive}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => setRemote(user)} className={buttonPrimary}>
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Remote view
                        </button>
                        <button type="button" onClick={() => setEditing({ user })} className={buttonSecondary}>
                          Access
                        </button>
                        {user.id !== currentUserId && (
                          <button type="button" onClick={() => save({ ...user, status: user.status === "Suspended" ? "Active" : "Suspended" })} className={buttonSecondary}>
                            {user.status === "Suspended" ? "Restore" : "Suspend"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--d-muted)]">
                    No users match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-[var(--d-muted)]">Changing your own access (marked “You”) changes which sections appear in your sidebar. Overview, Alerts, Settings and Admin always stay available.</p>
      </section>

      {editing && <AccessDialog user={editing.user} onClose={() => setEditing(null)} />}
      {remote && <RemoteView user={remote} onClose={() => setRemote(null)} />}
    </DashboardPage>
  );
}
