import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlatformPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-emerald-700">Platform</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Integrated monitoring across farm, shed and decision layers.</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Farm", "Soil moisture, rain, water use and field health."],
          ["Mulberry", "Growth monitoring and agronomic health by variety."],
          ["Shed", "Climate, RH, NH3, CO2 and rearing environment."],
          ["Automation", "Pump, fan, heater, valve and ventilation orchestration."],
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

      <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Paari Seritech Architecture</div>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Sensors → Edge → Cloud → AI → Automation</h2>
          </div>
          <Link href="/dashboard">
            <Button>
              Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
