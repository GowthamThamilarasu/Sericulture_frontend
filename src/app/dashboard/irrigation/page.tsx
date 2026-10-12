"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { irrigationHistory, irrigationSessions } from "@/data/mock";

export default function IrrigationPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Irrigation</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Water delivery and schedule control</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Current Soil Moisture</div><div className="mt-3 text-2xl font-semibold">31%</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Target Moisture</div><div className="mt-3 text-2xl font-semibold">35%</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Pump Status</div><div className="mt-3 text-2xl font-semibold">OFF</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Valve Status</div><div className="mt-3 text-2xl font-semibold">CLOSED</div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <CardHeader><CardTitle>Irrigation History</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={irrigationHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area dataKey="value" stroke="#0ea5e9" fill="#e0f2fe" strokeWidth={2.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Session Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Flow", "4.1 L/min"],
              ["Water Used", "420 L"],
              ["Last Irrigation", "08:15"],
              ["Next Recommended", "Today 17:45"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-b-0">
                <span className="text-sm text-slate-600">{label}</span>
                <span className="text-sm font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent irrigation sessions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {irrigationSessions.map((session) => (
              <div key={session.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{session.start}</div>
                <div className="mt-4 text-xl font-semibold text-slate-900">{session.duration}</div>
                <div className="mt-2 text-sm text-slate-600">{session.waterUsed} L</div>
                <div className="mt-3 text-xs uppercase tracking-[0.15em] text-emerald-700">{session.status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
