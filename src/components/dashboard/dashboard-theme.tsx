"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";
import { Check, Moon, Palette, RotateCcw, Sun } from "lucide-react";

export type DashboardTheme = "light" | "dark";

// Colors for SVG and chart props, which can't read the CSS tokens in globals.css (.dash-theme).
export const dashboardPalette = {
  dark: {
    accent: "#3fbf5f",
    warn: "#f5b942",
    danger: "#ef5a5a",
    info: "#7fb4ff",
    muted: "#9aa09c",
    track: "#555856",
    grid: "#343735",
    tick: "#c5cbc7",
    secondLine: "#f1f3f2",
    tooltipBg: "#1a1c1b",
    tooltipBorder: "#3a3d3b",
    text: "#ffffff",
  },
  light: {
    accent: "#00a218",
    warn: "#b45309",
    danger: "#dc2626",
    info: "#2563eb",
    muted: "#686d6a",
    track: "#cfd4d0",
    grid: "#e5e5e6",
    tick: "#363a38",
    secondLine: "#101211",
    tooltipBg: "#ffffff",
    tooltipBorder: "#e5e5e6",
    text: "#101211",
  },
};

export type DashboardPalette = (typeof dashboardPalette)[DashboardTheme];

// The choice is saved per browser; with no saved choice the system setting decides.
const storageKey = "dashboard-theme";
const lightQuery = "(prefers-color-scheme: light)";
const listeners = new Set<() => void>();
let memoryTheme: DashboardTheme | null = null;

function savedTheme(): DashboardTheme | null {
  try {
    const value = localStorage.getItem(storageKey);
    return value === "light" || value === "dark" ? value : memoryTheme;
  } catch {
    return memoryTheme;
  }
}

function getSnapshot(): DashboardTheme {
  return savedTheme() ?? (window.matchMedia(lightQuery).matches ? "light" : "dark");
}

function getServerSnapshot(): DashboardTheme {
  return "dark";
}

function subscribe(listener: () => void) {
  const media = window.matchMedia(lightQuery);
  listeners.add(listener);
  media.addEventListener("change", listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", listener);
    window.removeEventListener("storage", listener);
  };
}

function setTheme(theme: DashboardTheme) {
  memoryTheme = theme;
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Storage blocked (private window): the in-memory choice still applies for this visit.
  }
  listeners.forEach((listener) => listener());
}

// ---- Accent colour: green by default, or any colour from the picker. Saved per browser. ----

const accentKey = "dashboard-accent";
const accentListeners = new Set<() => void>();
let memoryAccent: string | null = null;

function savedAccent(): string | null {
  try {
    const value = localStorage.getItem(accentKey);
    return value && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : memoryAccent;
  } catch {
    return memoryAccent;
  }
}

function subscribeAccent(listener: () => void) {
  accentListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    accentListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** `null` goes back to the built-in green. */
export function setAccent(hex: string | null) {
  memoryAccent = hex;
  try {
    if (hex) localStorage.setItem(accentKey, hex);
    else localStorage.removeItem(accentKey);
  } catch {
    // Storage blocked: the choice still applies for this visit.
  }
  accentListeners.forEach((listener) => listener());
}

export function useAccent() {
  return useSyncExternalStore(subscribeAccent, savedAccent, () => null);
}

function hexToHsl(hex: string) {
  const [r, g, b] = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number) {
  const sat = Math.max(0, Math.min(100, s)) / 100;
  const light = Math.max(0, Math.min(100, l)) / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const channel = (n: number) => Math.round(255 * (light - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return `#${[0, 8, 4].map((n) => channel(n).toString(16).padStart(2, "0")).join("")}`;
}

/** The theme tokens for a picked colour: same lightness steps as the built-in green, in the picked hue and saturation. */
export function accentTokens(hex: string, theme: DashboardTheme) {
  const { h, s } = hexToHsl(hex);
  const sat = (max: number) => Math.min(s, max);
  const strong = hslToHex(h, sat(100), Math.min(38, Math.max(30, hexToHsl(hex).l)));
  const shared = {
    "--d-accent-strong": strong,
    "--d-accent-deep": hslToHex(h, sat(72), 21),
    "--d-accent-bright": hslToHex(h, sat(64), 66),
    "--d-side-top": hslToHex(h, sat(28), 10),
    "--d-side-bottom": hslToHex(h, sat(16), 5),
  };
  if (theme === "dark") {
    const accent = hslToHex(h, sat(55), 52);
    return {
      ...shared,
      "--d-accent": accent,
      "--d-accent-soft": `color-mix(in srgb, ${accent} 22%, transparent)`,
      "--d-card": hslToHex(h, sat(26), 16),
      "--d-card-border": `color-mix(in srgb, ${accent} 38%, transparent)`,
      "--d-inset": hslToHex(h, sat(24), 21),
      "--d-page-tint": hslToHex(h, sat(21), 7.5),
      "--d-banner-tint": hslToHex(h, sat(25), 13.5),
    };
  }
  return {
    ...shared,
    "--d-accent": strong,
    "--d-accent-soft": hslToHex(h, sat(42), 83),
    "--d-card": hslToHex(h, sat(38), 90),
    "--d-card-border": hslToHex(h, sat(36), 75),
    "--d-chip-hover": hslToHex(h, sat(45), 90),
    "--d-banner": hslToHex(h, sat(55), 95),
    "--d-page-tint": hslToHex(h, sat(45), 96.5),
    "--d-banner-tint": hslToHex(h, sat(38), 88),
  };
}

const ThemeContext = createContext<{ theme: DashboardTheme; palette: DashboardPalette }>({ theme: "dark", palette: dashboardPalette.dark });

export function useDashboardTheme() {
  return useContext(ThemeContext);
}

export function DashboardThemeRoot({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const accent = useAccent();
  const tokens = accent ? accentTokens(accent, theme) : null;
  const palette = tokens ? { ...dashboardPalette[theme], accent: tokens["--d-accent"] } : dashboardPalette[theme];

  return (
    <ThemeContext.Provider value={{ theme, palette }}>
      <div data-theme={theme} className={`dash-theme min-h-screen ${theme === "dark" ? "dash-dark" : ""}`} style={(tokens ?? undefined) as React.CSSProperties | undefined}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// Quick picks; the colour well below them takes any colour.
export const accentPresets = [
  { name: "Green", hex: null },
  { name: "Teal", hex: "#0d9488" },
  { name: "Ocean", hex: "#0369a1" },
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Violet", hex: "#7c3aed" },
  { name: "Rose", hex: "#e11d48" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Gold", hex: "#ca8a04" },
  { name: "Slate", hex: "#475569" },
] as const;

const presetSwatch = (hex: string | null) => hex ?? "#00a218";

/** Header button: opens a small panel with colour swatches and a colour picker for the dashboard accent. */
export function AccentPicker() {
  const accent = useAccent();
  const [open, setOpen] = useState(false);
  const current = accent ?? "#00a218";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Theme colour"
        aria-expanded={open}
        title="Theme colour"
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--d-chip)] text-[var(--d-text)] hover:bg-[var(--d-chip-hover)]"
      >
        <Palette className="h-4 w-4" aria-hidden="true" />
        <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--d-panel)]" style={{ backgroundColor: current }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="dialog" aria-label="Theme colour" className="absolute right-0 top-12 z-50 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-[var(--d-line)] bg-[var(--d-popup)] p-4 text-[var(--d-text)] shadow-2xl">
            <div className="text-sm font-semibold">Theme colour</div>
            <div className="mt-0.5 text-[11px] text-[var(--d-muted)]">Recolours buttons, highlights, cards and the menu.</div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {accentPresets.map((preset) => {
                const selected = (preset.hex ?? null) === accent;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setAccent(preset.hex)}
                    aria-label={preset.name}
                    aria-pressed={selected}
                    title={preset.name}
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110 ${selected ? "ring-2 ring-[var(--d-text)] ring-offset-2 ring-offset-[var(--d-popup)]" : ""}`}
                    style={{ backgroundColor: presetSwatch(preset.hex) }}
                  >
                    {selected && <Check className="h-4 w-4 text-white" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            <label className="mt-4 flex items-center gap-3 rounded-xl bg-[var(--d-chip)] p-2.5">
              <input type="color" value={current} onChange={(event) => setAccent(event.target.value.toLowerCase())} className="h-9 w-12 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0" aria-label="Pick any colour" />
              <span className="min-w-0">
                <span className="block text-xs font-semibold">Custom colour</span>
                <span className="block font-mono text-[11px] uppercase text-[var(--d-muted)]">{current}</span>
              </span>
            </label>
            {accent && (
              <button type="button" onClick={() => setAccent(null)} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--d-chip)] px-3 py-2 text-xs font-semibold hover:bg-[var(--d-chip-hover)]">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Back to green
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function ThemeToggle() {
  const { theme } = useDashboardTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--d-chip)] text-[var(--d-text)] hover:bg-[var(--d-chip-hover)]"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
