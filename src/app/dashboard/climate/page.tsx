"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { temperatureHistory } from "@/data/mock";

export default function ClimatePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Climate Control</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Operational climate management</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Temperature</div><div className="mt-3 text-2xl font-semibold">26.4°C</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">RH</div><div className="mt-3 text-2xl font-semibold">73%</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">NH3</div><div className="mt-3 text-2xl font-semibold">4.2 ppm</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">CO2</div><div className="mt-3 text-2xl font-semibold">720 ppm</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Climate trend</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={temperatureHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area dataKey="value" stroke="#10b981" fill="#d1fae5" strokeWidth={2.2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Fan Stage 1", "AUTO"],
          ["Fan Stage 2", "AUTO"],
          ["Circulation Fan", "AUTO"],
          ["Fogger", "MANUAL"],
          ["Humidifier", "AUTO"],
          ["Heater", "OFF"],
          ["Cooling", "OFF"],
          ["Light", "18 Lux"],
        ].map(([label, value]) => (
          <Card key={label}><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div><div className="mt-3 text-xl font-semibold text-slate-900">{value}</div></CardContent></Card>
        ))}
      </div>
    </div>
  );
}
