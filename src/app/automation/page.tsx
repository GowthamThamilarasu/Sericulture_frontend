import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AutomationPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <div className="text-xs uppercase tracking-[0.2em] text-emerald-700">Automation</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Safe, review-based automation for field and shed operations.</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[
          ["Irrigation", "Soil moisture triggers pump and solenoid control with approval gates."],
          ["Fertigation", "EC-based dosing, mixing and drip delivery at controlled thresholds."],
          ["Shed Climate", "Fan, humidifier, heater and cooling logic based on environmental conditions."],
          ["Ventilation", "NH3 and CO2 response automation to keep the rearing environment safe."],
        ].map(([title, text]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-600">{text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
