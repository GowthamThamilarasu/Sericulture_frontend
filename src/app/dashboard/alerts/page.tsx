import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { alertItems } from "@/data/mock";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Alert Center</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Monitoring and alert response</h1>
      </div>

      <div className="grid gap-4">
        {alertItems.map((alert) => (
          <Card key={alert.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{alert.parameter}</CardTitle>
                <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-red-700">{alert.severity}</span>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div><div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Value</div><div className="mt-1 text-sm font-semibold text-slate-900">{alert.value}</div></div>
              <div><div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Timestamp</div><div className="mt-1 text-sm font-semibold text-slate-900">{alert.timestamp}</div></div>
              <div><div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Location</div><div className="mt-1 text-sm font-semibold text-slate-900">{alert.location}</div></div>
              <div><div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Recommended Action</div><div className="mt-1 text-sm text-slate-700">{alert.recommendedAction}</div></div>
              <div><div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Status</div><div className="mt-1 text-sm font-semibold text-slate-900">{alert.status}</div></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
