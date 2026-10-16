"use client";

import { Bell, Bug, Cpu, Download, Eye, FileText, FlaskConical, Sprout, Warehouse, Waves } from "lucide-react";

import { type Icon, Widget } from "@/components/dashboard/dashboard-widgets";
import { SectionHeader } from "@/components/dashboard/monitor-widgets";
import { DashboardPage, PageHeader, buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";

const reportCards: { title: string; text: string; icon: Icon }[] = [
  { title: "Farm Environment", text: "Summary of moisture, weather and soil conditions", icon: Sprout },
  { title: "Shed Environment", text: "Temperature, RH, CO₂ and NH₃ metrics", icon: Warehouse },
  { title: "Irrigation", text: "Delivery schedule and water use", icon: Waves },
  { title: "Fertigation", text: "EC, dosing and product recipe status", icon: FlaskConical },
  { title: "Silkworm", text: "Instar condition and risk indexes", icon: Bug },
  { title: "Alerts", text: "Open and resolved event history", icon: Bell },
  { title: "AI Recommendations", text: "Review and approval activity for decision support", icon: Cpu },
];

export default function ReportsPage() {
  return (
    <DashboardPage tint="slate">
      <PageHeader icon={FileText} eyebrow="Reports" title="Operational and AI reporting" detail="Summaries of farm, shed and AI activity" />

      <section aria-label="Reports">
        <SectionHeader icon={FileText} title="Available Reports" detail="Open a report to view it, or export it to share" />
        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reportCards.map((report) => (
            <Widget key={report.title} title={report.title} icon={report.icon}>
              <p className="text-sm leading-6 text-[var(--d-soft)]">{report.text}</p>
              <div className="mt-4 flex gap-2">
                <button type="button" className={buttonPrimary}>
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" /> View
                </button>
                <button type="button" className={buttonSecondary}>
                  <Download className="h-3.5 w-3.5" aria-hidden="true" /> Export
                </button>
              </div>
            </Widget>
          ))}
        </div>
      </section>
    </DashboardPage>
  );
}
