import { Activity, AlertTriangle, Beaker, Bell, CloudDrizzle, CloudRain, CloudSun, Droplets, Fan, Faucet, FlaskConical, Heater, Lightbulb, Shovel, ShieldAlert, Snowflake, Sun, Thermometer, Waves, WifiOff, Wind, Zap } from "lucide-react";

import type { Icon } from "@/components/dashboard/dashboard-widgets";
import { Co2Icon, HumidityIcon, LightSensorIcon, Nh3Icon, SoilEcIcon, SoilMoistureIcon, SoilPhIcon, SoilTemperatureIcon, TemperatureIcon, WaterLevelIcon } from "@/components/dashboard/sensor-icons";

// Section colours for dashboard boxes. Each tint is a .tint-<name> class in globals.css that recolours the card
// (--d-card, --d-card-border) and its icons and normal values (--d-tint, --d-tint-soft). Untinted boxes stay green.
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

// Class for a box: an explicit tint wins, null turns tinting off, otherwise the icon decides.
export function tintClass(icon?: Icon, tint?: Tint | null) {
  const value = tint === null ? undefined : (tint ?? tintFor(icon));
  return value ? `tint-${value}` : "";
}
