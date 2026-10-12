import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reportCards = [
  ["Farm Environment", "Summary of moisture, weather and soil conditions"],
  ["Shed Environment", "Temperature, RH, CO2 and NH3 metrics"],
  ["Irrigation", "Delivery schedule and water use"],
  ["Fertigation", "EC, dosing and product recipe status"],
  ["Silkworm", "In-star condition and risk indexes"],
  ["Alerts", "Open and resolved event history"],
  ["AI Recommendations", "Review and approval activity for decision support"],
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Reports</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Operational and AI reporting</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportCards.map(([title, text]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-600">{text}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm">View</Button>
                <Button variant="secondary" size="sm">Export</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
