import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { aiInsights } from "@/data/mock";

export default function AIInsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">AI Insights</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Predictive analytics and farmer review</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {aiInsights.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{item.title}</CardTitle>
                <span className="text-[10px] uppercase tracking-[0.15em] text-indigo-700">{item.badge}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-700">{item.summary}</div>
              <div className="text-sm text-slate-600">{item.detail}</div>
              <div className="flex gap-2">
                <Button>Approve</Button>
                <Button variant="outline">Reject</Button>
                <Button variant="secondary">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
