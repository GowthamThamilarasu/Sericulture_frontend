import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AIPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <div className="text-xs uppercase tracking-[0.2em] text-violet-700">AI</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Decision support for risk, water and climate management.</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[
          ["Irrigation Prediction", "AI predicts soil and water conditions ahead of critical thresholds."],
          ["Water Requirement", "Forecasts irrigation demand and expected future consumption."],
          ["Fertigation Recommendation", "Reviews EC targets and agronomist-approved dosing needs."],
          ["Mulberry Health Analysis", "Assesses leaf colour, density, damage and growth variation."],
          ["Silkworm Risk Zone", "Tracks stress exposure and environmental risk factors."],
          ["AI Computer Vision", "Future module for crop, cocoon and larval image analysis."],
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
