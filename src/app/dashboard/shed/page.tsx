"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { instarStages, temperatureHistory } from "@/data/mock";

const shedMetrics = [
  { label: "Temperature", value: "26.4°C" },
  { label: "Relative Humidity", value: "73%" },
  { label: "NH3", value: "4.2 ppm" },
  { label: "CO2", value: "720 ppm" },
  { label: "Light", value: "18 Lux" },
  { label: "Pressure", value: "101.4 kPa" },
  { label: "Ventilation", value: "Moderate" },
];

export default function ShedMonitorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Shed Monitor</div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Environmental condition and instar status</h1>
        </div>
        <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">CURRENT INSTAR: IV</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {shedMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{metric.label}</div>
              <div className="mt-3 text-2xl font-semibold text-slate-900">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Climate Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={temperatureHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area dataKey="value" stroke="#8b5cf6" fill="#ede9fe" strokeWidth={2.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environmental Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {instarStages.map((stage) => (
              <div key={stage.stage} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-sm font-semibold text-slate-900">{stage.stage}</div>
                <div className="mt-2 flex justify-between text-sm text-slate-600"><span>Temperature</span><span>{stage.temperature}</span></div>
                <div className="mt-1 flex justify-between text-sm text-slate-600"><span>RH</span><span>{stage.humidity}</span></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
