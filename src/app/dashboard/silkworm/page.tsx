import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { silkwormBatch } from "@/data/mock";

export default function SilkwormPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Silkworm Monitor</div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Batch condition and risk overview</h1>
        </div>
        <Badge className="border-amber-200 bg-amber-50 text-amber-700">DEMO AI INSIGHT</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Current Instar</div><div className="mt-3 text-2xl font-semibold">{silkwormBatch.instar}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Overall Condition</div><div className="mt-3 text-2xl font-semibold">{silkwormBatch.condition}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Risk Zone</div><div className="mt-3 text-2xl font-semibold">{silkwormBatch.riskZone} / 100</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Stress Risk</div><div className="mt-3 text-2xl font-semibold">{silkwormBatch.stressRisk}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>AI insight summary</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-slate-700">
            Overall condition: Good. Risk Zone Score: 18 / 100. Stress Risk: Moderate. Reasons: RH increasing, NH3 increasing, ventilation insufficient.
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ["Temperature", `${silkwormBatch.temperature}°C`],
          ["Humidity", `${silkwormBatch.humidity}%`],
          ["NH3", `${silkwormBatch.nh3} ppm`],
          ["CO2", `${silkwormBatch.co2} ppm`],
          ["Ventilation", silkwormBatch.ventilation],
          ["Feeding", silkwormBatch.feeding],
          ["Bed Condition", silkwormBatch.bedCondition],
          ["Cleaning", silkwormBatch.cleaning],
          ["Mortality", silkwormBatch.mortality],
          ["Mulberry Quality", silkwormBatch.mulberryQuality],
        ].map(([label, value]) => (
          <Card key={label}><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div><div className="mt-3 text-xl font-semibold text-slate-900">{value}</div></CardContent></Card>
        ))}
      </div>
    </div>
  );
}
