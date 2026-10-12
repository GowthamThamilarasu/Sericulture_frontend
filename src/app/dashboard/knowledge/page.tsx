import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { instarStages, knowledgeSections } from "@/data/mock";

export default function KnowledgePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Knowledge Center</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Instar and varietal reference library</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Instar Management</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {instarStages.map((stage) => (
              <div key={stage.stage} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-sm font-semibold text-slate-900">{stage.stage}</div>
                <div className="mt-2 flex justify-between text-sm text-slate-600"><span>Temp</span><span>{stage.temperature}</span></div>
                <div className="mt-1 flex justify-between text-sm text-slate-600"><span>RH</span><span>{stage.humidity}</span></div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Environmental Parameters</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Temperature, relative humidity, CO2, NH3, light, ventilation and water levels are managed according to documented operating ranges for different instars.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Mulberry Varieties</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {knowledgeSections.mulberry.map((variety) => (
                <span key={variety} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">{variety}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Silkworm Varieties</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {knowledgeSections.silkworm.map((type) => (
                  <span key={type} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">{type}</span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {knowledgeSections.tamilNadu.map((type) => (
                  <span key={type} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">{type}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
