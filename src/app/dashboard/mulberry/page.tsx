import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mulberryPlots } from "@/data/mock";

export default function MulberryPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Mulberry</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Variety performance and growth condition</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {mulberryPlots.map((plot) => (
          <Card key={plot.id}>
            <CardHeader>
              <CardTitle>{plot.variety}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                ["Growth Stage", plot.growthStage],
                ["Leaf Size", plot.leafSize],
                ["Leaf Colour", plot.leafColour],
                ["Leaf Density", plot.leafDensity],
                ["Visible Damage", plot.visibleDamage],
                ["Growth Variation", plot.growthVariation],
                ["Soil Condition", plot.soilCondition],
                ["Irrigation", plot.irrigation],
                ["Fertilization", plot.fertilization],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">{label}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
