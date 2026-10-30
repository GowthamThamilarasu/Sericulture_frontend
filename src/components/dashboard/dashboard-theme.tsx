"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

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

const ThemeContext = createContext<{ theme: DashboardTheme; palette: DashboardPalette }>({ theme: "dark", palette: dashboardPalette.dark });

export function useDashboardTheme() {
  return useContext(ThemeContext);
}

export function DashboardThemeRoot({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <ThemeContext.Provider value={{ theme, palette: dashboardPalette[theme] }}>
      <div data-theme={theme} className={`dash-theme min-h-screen ${theme === "dark" ? "dash-dark" : ""}`}>
        {children}
      </div>
    </ThemeContext.Provider>
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
