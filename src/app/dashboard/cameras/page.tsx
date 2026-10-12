import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cameraAnalyses } from "@/data/mock";

export default function CamerasPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Cameras / Computer Vision</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">AI Computer Vision • Future Module</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {cameraAnalyses.map((camera) => (
          <Card key={camera.id}>
            <CardHeader>
              <CardTitle>{camera.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                {camera.status}
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {camera.metrics.map((metric) => (
                  <li key={metric} className="flex gap-2"><span className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500" /> {metric}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
