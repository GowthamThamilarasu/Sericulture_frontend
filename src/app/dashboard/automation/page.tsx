import { ModeSelector } from "@/components/dashboard/controller-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const controlCards: Array<[string, string[]]> = [
  ["IRRIGATION", ["Water Pump", "Solenoid Valve", "Drip Irrigation"]],
  ["FERTIGATION", ["Dose Pump", "Mixing Tank", "Agitator", "Tank Filling Valve"]],
  ["SHED", ["Exhaust Fans", "Circulation Fans", "Foggers", "Humidifier", "Heater", "Cooling", "Motorized Ventilation", "Lights", "Curtains", "Louvers"]],
];

export default function AutomationCenterPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Automation Center</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Review and approve automation actions</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {controlCards.map(([group, items]) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle>{group}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-900">{item}</div>
                    <ModeSelector name={item} />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs uppercase tracking-[0.15em] text-slate-500">
                    <span>Last Action</span>
                    <span className="text-slate-900">2h ago</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
