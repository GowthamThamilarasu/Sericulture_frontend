"use client";

import { useSyncExternalStore } from "react";

// Customers and farm team members, their package and which dashboard features they can use.
// Shared by Settings → Users and the Admin tab; the signed-in demo user's features decide the sidebar.

export const dashboardFeatures = [
  { id: "overview", label: "Overview", href: "/dashboard", core: true },
  { id: "farm", label: "Farm Monitor", href: "/dashboard/farm" },
  { id: "shed", label: "Shed Monitor", href: "/dashboard/shed" },
  { id: "silkworm", label: "Silkworm", href: "/dashboard/silkworm" },
  { id: "mulberry", label: "Mulberry", href: "/dashboard/mulberry" },
  { id: "irrigation", label: "Irrigation", href: "/dashboard/irrigation" },
  { id: "fertigation", label: "Fertigation", href: "/dashboard/fertigation" },
  { id: "climate", label: "Climate Control", href: "/dashboard/climate" },
  { id: "automation", label: "Automation", href: "/dashboard/automation" },
  { id: "ai", label: "AI Insights", href: "/dashboard/ai" },
  { id: "alerts", label: "Alerts", href: "/dashboard/alerts", core: true },
  { id: "cameras", label: "Cameras", href: "/dashboard/cameras" },
  { id: "reports", label: "Reports", href: "/dashboard/reports" },
  { id: "knowledge", label: "Knowledge", href: "/dashboard/knowledge" },
  { id: "settings", label: "Settings", href: "/dashboard/settings", core: true },
] as const;
export type FeatureId = (typeof dashboardFeatures)[number]["id"];

export const packages = [
  { id: "Basic", price: "₹ 1,499 / month", detail: "Monitoring for one shed or field", features: ["overview", "farm", "shed", "irrigation", "alerts", "knowledge", "settings"] },
  { id: "Standard", price: "₹ 2,999 / month", detail: "Full farm and rearing management", features: ["overview", "farm", "shed", "silkworm", "mulberry", "irrigation", "fertigation", "climate", "alerts", "reports", "knowledge", "settings"] },
  { id: "Pro", price: "₹ 4,999 / month", detail: "Everything, with automation, AI and cameras", features: dashboardFeatures.map((feature) => feature.id) },
] as const satisfies readonly { id: string; price: string; detail: string; features: readonly FeatureId[] }[];
export type PackageId = (typeof packages)[number]["id"] | "Custom";

export const roles = ["Owner", "Manager", "Supervisor", "Worker", "Viewer"] as const;
export type Role = (typeof roles)[number];

export interface FarmUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  farm: string;
  location: string;
  role: Role;
  package: PackageId;
  features: FeatureId[];
  status: "Active" | "Invited" | "Suspended";
  joined: string; // "YYYY-MM-DD"
  lastActive: string;
}

const featuresOf = (id: Exclude<PackageId, "Custom">) => [...(packages.find((item) => item.id === id)?.features ?? [])] as FeatureId[];
export const packageFeatures = featuresOf;

const defaultUsers: FarmUser[] = [
  { id: "u1", name: "Farm Manager", phone: "+91 98400 11223", email: "manager@kallakurichi.farm", farm: "Kallakurichi Mulberry Center", location: "Kallakurichi, TN", role: "Owner", package: "Pro", features: featuresOf("Pro"), status: "Active", joined: "2025-11-02", lastActive: "Now" },
  { id: "u2", name: "Selvi R.", phone: "+91 94430 55120", farm: "Kallakurichi Mulberry Center", location: "Kallakurichi, TN", role: "Supervisor", package: "Pro", features: featuresOf("Pro"), status: "Active", joined: "2026-01-14", lastActive: "2 h ago" },
  { id: "u3", name: "Murugan K.", phone: "+91 90031 77810", farm: "Kallakurichi Mulberry Center", location: "Kallakurichi, TN", role: "Worker", package: "Pro", features: ["overview", "shed", "silkworm", "alerts", "knowledge"], status: "Active", joined: "2026-03-09", lastActive: "Yesterday" },
  { id: "u4", name: "Anitha S.", phone: "+91 98945 22013", email: "anitha@hosursilk.in", farm: "Hosur Sericulture Unit", location: "Hosur, TN", role: "Owner", package: "Standard", features: featuresOf("Standard"), status: "Active", joined: "2026-02-20", lastActive: "35 min ago" },
  { id: "u5", name: "Rajesh P.", phone: "+91 97877 40551", farm: "Dharmapuri Silk Farm", location: "Dharmapuri, TN", role: "Owner", package: "Basic", features: featuresOf("Basic"), status: "Active", joined: "2026-06-03", lastActive: "3 days ago" },
  { id: "u6", name: "Kavitha M.", phone: "+91 95000 81234", farm: "Krishnagiri Cocoon Growers", location: "Krishnagiri, TN", role: "Owner", package: "Standard", features: featuresOf("Standard"), status: "Invited", joined: "2026-10-12", lastActive: "Not signed in yet" },
];

// The demo signs in as this user; Admin is available to them as the installer's account.
export const currentUserId = "u1";

const storageKey = "farm-users";
const listeners = new Set<() => void>();
let state: FarmUser[] | null = null;

function read(): FarmUser[] {
  if (state) return state;
  state = defaultUsers;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (Array.isArray(saved) && saved.length) state = saved;
  } catch {
    // Storage blocked or unreadable: keep the demo users.
  }
  return state;
}

function write(next: FarmUser[]) {
  state = next;
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // Storage blocked: the change still applies until the page reloads.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useFarmUsers() {
  const users = useSyncExternalStore(subscribe, read, () => defaultUsers);
  const current = users.find((user) => user.id === currentUserId) ?? users[0];
  return {
    users,
    current,
    save: (user: FarmUser) => {
      const list = read();
      write(list.some((item) => item.id === user.id) ? list.map((item) => (item.id === user.id ? user : item)) : [...list, user]);
    },
    remove: (id: string) => write(read().filter((item) => item.id !== id && id !== currentUserId)),
  };
}

/** Core pages stay available to everyone so nobody is locked out of alerts or settings. */
export const canUse = (user: FarmUser | undefined, featureId: string) => !user || dashboardFeatures.find((feature) => feature.id === featureId && "core" in feature) !== undefined || user.features.includes(featureId as FeatureId);

/** Devices installed for a user, made up from their package for the demo; the Admin remote view inspects these. */
export function userDevices(user: FarmUser) {
  const templates = [
    { name: "Shed Controller", kind: "Controller", firmware: "2.4.1" },
    { name: "Environmental Sensor", kind: "Climate sensor", firmware: "1.9.0" },
    { name: "Gas Monitor (NH₃ / CO₂)", kind: "Gas sensor", firmware: "1.6.2" },
    { name: "Soil Moisture Probe", kind: "Soil sensor", firmware: "1.3.4" },
    { name: "Pump Controller", kind: "Controller", firmware: "2.1.0" },
    { name: "Flow & Pressure Sensor", kind: "Irrigation sensor", firmware: "1.2.7" },
    { name: "Fertigation Dose Pump", kind: "Controller", firmware: "1.8.3" },
    { name: "Tank Level Sensor", kind: "Level sensor", firmware: "1.1.9" },
    { name: "LoRa Gateway", kind: "Gateway", firmware: "3.0.2" },
    { name: "Shed Camera", kind: "Camera", firmware: "4.2.0" },
  ];
  const count = user.package === "Basic" ? 5 : user.package === "Standard" ? 8 : 10;
  const seed = [...user.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return templates.slice(0, count).map((device, index) => {
    // About 1 in 20 devices offline and 1 in 10 with a warning.
    const roll = (seed * 7 + index * 13) % 20;
    const status: "Online" | "Warning" | "Offline" = user.status === "Invited" ? "Offline" : roll === 0 ? "Offline" : roll <= 2 ? "Warning" : "Online";
    return {
      id: `${user.id}-dev-${index}`,
      ...device,
      serial: `PST-${device.kind.slice(0, 2).toUpperCase()}-${String(1000 + ((seed * 31 + index * 97) % 9000))}`,
      status,
      signal: status === "Offline" ? 0 : 45 + ((seed + index * 17) % 50),
      battery: device.kind.includes("sensor") || device.kind.includes("Level") ? 20 + ((seed * 3 + index * 23) % 80) : null,
      lastSeen: status === "Offline" ? `${1 + ((seed + index) % 9)} h ago` : `${1 + ((seed + index) % 50)} s ago`,
      issue: status === "Offline" ? "No heartbeat from the device" : status === "Warning" ? (index % 2 ? "Weak signal: packets dropping" : "Sensor reading drifting: calibration due") : null,
    };
  });
}
