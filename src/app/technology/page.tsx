import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TechnologyPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <div className="text-xs uppercase tracking-[0.2em] text-indigo-700">Technology</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">A digital control layer for intelligent sericulture operations.</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          ["Edge / Controller", "Local device logic for sensor acquisition, threshold checks and control sequencing."],
          ["Cloud Database", "Central context for farm and shed data, historical trends and device state."],
          ["AI / ML Engine", "Risk analytics, prediction, environmental reasoning and recommendation generation."],
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
