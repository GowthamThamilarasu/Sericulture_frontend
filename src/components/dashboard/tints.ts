import { Activity, AlertTriangle, Beaker, Bell, CloudDrizzle, CloudRain, CloudSun, Droplets, Fan, Faucet, FlaskConical, Heater, Lightbulb, Shovel, ShieldAlert, Snowflake, Sun, Thermometer, Waves, WifiOff, Wind, Zap } from "lucide-react";

import type { Icon } from "@/components/dashboard/dashboard-widgets";
import { Co2Icon, HumidityIcon, LightSensorIcon, Nh3Icon, SoilEcIcon, SoilMoistureIcon, SoilPhIcon, SoilTemperatureIcon, TemperatureIcon, WaterLevelIcon } from "@/components/dashboard/sensor-icons";

// Section colours for dashboard boxes. Each tint is a .tint-<name> class in globals.css that recolours the card
// (--d-card, --d-card-border) and its icons and normal values (--d-tint, --d-tint-soft). Currently switched off: every box is green.
export type Tint = "water" | "heat" | "soil" | "nutrient" | "air" | "light" | "alert";

const groups: [Tint, Icon[]][] = [
  ["water", [WaterLevelIcon, SoilMoistureIcon, HumidityIcon, Waves, Droplets, Faucet, CloudDrizzle, CloudRain]],
  ["heat", [TemperatureIcon, SoilTemperatureIcon, Heater, Thermometer, Snowflake]],
  ["soil", [SoilEcIcon, SoilPhIcon, Shovel]],
  ["nutrient", [FlaskConical, Beaker, Activity, Zap]],
  ["air", [Co2Icon, Nh3Icon, Fan, Wind]],
  ["light", [LightSensorIcon, Lightbulb, CloudSun, Sun]],
  ["alert", [AlertTriangle, Bell, WifiOff, ShieldAlert]],
];

const byIcon = new Map<Icon, Tint>(groups.flatMap(([tint, icons]) => icons.map((icon) => [icon, tint] as [Icon, Tint])));

export function tintFor(icon?: Icon): Tint | undefined {
  return icon ? byIcon.get(icon) : undefined;
}

// Class for a box. The dashboard now uses one uniform green for every box, so no tint class is applied;
// set this back to `tint === null ? "" : \`tint-${tint ?? tintFor(icon) ?? ""}\`` to bring the section colours back.
export function tintClass(icon?: Icon, tint?: Tint | null) {
  void icon;
  void tint;
  return "";
}
