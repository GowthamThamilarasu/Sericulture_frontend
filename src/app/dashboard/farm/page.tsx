"use client";

import { Activity, CloudRain, CloudSun, Droplets, FlaskConical, Gauge, Power, Sprout, Thermometer, ThermometerSun, Waves, Zap } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ecHistory, soilMoistureHistory, temperatureHistory, waterLevelHistory } from "@/data/mock";

const gradientCard =
  "rounded-lg bg-[#232524] text-white";

const metrics = [
  { label: "Soil Moisture", value: "31%", icon: Droplets },
  { label: "Soil Temperature", value: "27.2°C", icon: Thermometer },
  { label: "Soil EC", value: "0.82 mS/cm", icon: Zap },
  { label: "Soil pH", value: "6.7", icon: FlaskConical },
  { label: "Water Level", value: "72%", icon: Waves },
  { label: "Water Temperature", value: "26.1°C", icon: ThermometerSun },
  { label: "Water EC", value: "0.65 mS/cm", icon: Activity },
  { label: "Rain", value: "No", icon: CloudRain },
  { label: "Weather", value: "Mild", icon: CloudSun },
  { label: "Flow Meter", value: "4.1 L/min", icon: Gauge },
  { label: "Irrigation", value: "OFF", icon: Power },
];

const charts = [
  { id: "farmMoisture", title: "Soil Moisture History", data: soilMoistureHistory, color: "#3fbf5f", icon: Droplets },
  { id: "farmTemperature", title: "Temperature History", data: temperatureHistory, color: "#f5b942", icon: Thermometer },
  { id: "farmEc", title: "EC History", data: ecHistory, color: "#b094ff", icon: Zap },
  { id: "farmWaterLevel", title: "Water Level History", data: waterLevelHistory, color: "#5abef0", icon: Waves },
];

export default function FarmMonitorPage() {
  return (
    <div className="space-y-6">
      <div className={`${gradientCard} flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6`}>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#3fbf5f]/15 text-[#3fbf5f]">
            <Sprout className="h-7 w-7" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Farm Monitor</div>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Field condition overview</h1>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-[#f5b942]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f5b942]">
          Demo Data
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className={`${gradientCard} flex items-center gap-4 p-4`}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#3fbf5f]/15 text-[#3fbf5f]">
              <metric.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">{metric.label}</div>
              <div className="mt-1 text-2xl font-bold text-[#3fbf5f]">{metric.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {charts.map((chart) => (
          <div key={chart.id} className={`${gradientCard} p-3 sm:p-4`}>
            <div className="flex items-center gap-3 px-2 pb-3 pt-1">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3fbf5f]/15 text-[#3fbf5f]">
                <chart.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">{chart.title}</h3>
            </div>
            <div className="h-64 rounded-md bg-[#1a1c1b] p-3 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart.data}>
                  <defs>
                    <linearGradient id={chart.id} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor={chart.color} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={chart.color} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#343735" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area dataKey="value" stroke={chart.color} fill={`url(#${chart.id})`} strokeWidth={2.4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
