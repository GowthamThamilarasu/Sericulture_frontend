import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fertigationSessions } from "@/data/mock";

export default function FertigationPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Fertigation</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Nutrient dosing and EC control</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Current EC</div><div className="mt-3 text-2xl font-semibold">0.72</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Target EC</div><div className="mt-3 text-2xl font-semibold">1.05</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Dose Pump</div><div className="mt-3 text-2xl font-semibold">OFF</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Recipe Status</div><div className="mt-3 text-2xl font-semibold">Ready</div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Control devices</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Dose Pump", "Standby"],
              ["Mixing Tank", "Balanced"],
              ["Agitator", "Idle"],
              ["Water Tank", "72%"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-b-0">
                <span className="text-sm text-slate-600">{label}</span>
                <span className="text-sm font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Approved nutrient recipes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {fertigationSessions.map((session) => (
              <div key={session.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{session.recipe}</div>
                <div className="mt-2 flex justify-between text-sm text-slate-600"><span>Target EC</span><span>{session.ecTarget}</span></div>
                <div className="mt-1 flex justify-between text-sm text-slate-600"><span>Dose</span><span>{session.dose} L</span></div>
                <div className="mt-3 text-xs uppercase tracking-[0.15em] text-emerald-700">{session.status}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
