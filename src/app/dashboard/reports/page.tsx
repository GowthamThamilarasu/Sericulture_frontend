"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Archive, Bell, Bug, Cpu, Download, Egg, Eye, FileJson, FileSpreadsheet, FileText, FileType, FlaskConical, Layers, Leaf, Printer, Upload, Warehouse, Waves, X, Zap } from "lucide-react";

import { useAutomationModels, modelFields } from "@/components/dashboard/automation-models";
import { formatDate, useBatches } from "@/components/dashboard/batch-store";
import { climateEquipment, useClimate } from "@/components/dashboard/climate-control";
import { type Icon } from "@/components/dashboard/dashboard-widgets";
import { useNutrientTanks } from "@/components/dashboard/fertigation-tanks";
import { useIrrigationPlan } from "@/components/dashboard/irrigation-planner";
import { SectionHeader } from "@/components/dashboard/monitor-widgets";
import { useMulberry } from "@/components/dashboard/mulberry-store";
import { useNotifications } from "@/components/dashboard/notifications";
import { DashboardPage, PageHeader, buttonPrimary, buttonSecondary } from "@/components/dashboard/page-kit";
import { medicationsFor, useSilkwormHealth } from "@/components/dashboard/silkworm-health";
import { useWaterSources } from "@/components/dashboard/water-sources";
import { aiInsights, farmValves, fertigationReadings, fertigationSessions, irrigationSessions, sensorReadings } from "@/data/mock";
import { type Report, download, fileSlug, printReport, toCsv, toDocx, toJson, toXlsx } from "@/lib/export";

// Every setting and record the dashboard keeps in this browser; the backup saves and restores them all.
const backupKeys = [
  "paari-settings-v1",
  "silkworm-batches",
  "silkworm-health",
  "mulberry-field",
  "irrigation-plan",
  "irrigation-water-sources",
  "fertigation-tanks",
  "fertigation-setpoints",
  "automation-models",
  "climate-control",
  "controller-modes",
  "farm-users",
  "service-center",
  "ai-insight-decisions",
  "dashboard-notifications",
  "dashboard-theme",
];

const readAiDecisions = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem("ai-insight-decisions") ?? "{}");
  } catch {
    return {};
  }
};

type ReportCard = { id: string; title: string; text: string; icon: Icon; build: () => Report };

function ReportPreview({ report, onClose }: { report: Report; onClose: () => void }) {
  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-[var(--d-line)] bg-[var(--d-popup)] text-[var(--d-text)] shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--d-line)] p-5">
          <div>
            <Dialog.Title className="text-lg font-semibold">{report.title}</Dialog.Title>
            <Dialog.Description className="mt-0.5 text-xs text-[var(--d-muted)]">{report.subtitle}</Dialog.Description>
          </div>
          <div className="flex items-center gap-2">
            <ExportButtons build={() => report} label={report.title} compact />
            <Dialog.Close aria-label="Close" className="rounded-lg p-2 text-[var(--d-muted)] hover:bg-[var(--d-chip)] hover:text-[var(--d-text)]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
        </div>
        <div className="min-h-0 space-y-6 overflow-y-auto p-5">
          {report.tables.map((table) => (
            <section key={table.heading}>
              <h3 className="text-sm font-semibold text-[var(--d-accent)]">{table.heading}</h3>
              {table.note && <p className="text-xs text-[var(--d-muted)]">{table.note}</p>}
              {table.rows.length === 0 ? (
                <p className="mt-2 text-xs text-[var(--d-muted)]">No records.</p>
              ) : (
                <div className="mt-2 overflow-x-auto rounded-xl border border-[var(--d-card-border)]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--d-accent-soft)]">
                      <tr>
                        {table.columns.map((column) => (
                          <th key={column} scope="col" className="whitespace-nowrap px-3 py-2 font-semibold text-[var(--d-text)]">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, index) => (
                        <tr key={index} className="border-t border-[var(--d-line)]">
                          {table.columns.map((column, cell) => (
                            <td key={column} className="whitespace-nowrap px-3 py-1.5 text-[var(--d-soft)]">
                              {row[cell] ?? ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// The report is built when a button is pressed, so it always has the latest data.
function ExportButtons({ build, label, compact }: { build: () => Report; label: string; compact?: boolean }) {
  const formats = [
    { label: "PDF", icon: Printer, run: () => printReport(build()) || window.alert("Allow pop-ups for this site to save the PDF.") },
    { label: "Word", icon: FileType, run: () => download(toDocx(build()), `${fileSlug(label)}.docx`) },
    { label: "Excel", icon: FileSpreadsheet, run: () => download(toXlsx(build()), `${fileSlug(label)}.xlsx`) },
    { label: "CSV", icon: FileText, run: () => download(toCsv(build()), `${fileSlug(label)}.csv`) },
  ];
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Export ${label}`}>
      {formats.map((format) => (
        <button key={format.label} type="button" onClick={format.run} className={compact ? "inline-flex items-center gap-1 rounded-lg bg-[var(--d-chip)] px-2.5 py-1.5 text-xs font-semibold text-[var(--d-text)] hover:accent-fill" : buttonSecondary} title={`Download as ${format.label}`}>
          <format.icon className="h-3.5 w-3.5" aria-hidden="true" /> {format.label}
        </button>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const { batches, active } = useBatches();
  const { blocks, activities } = useMulberry();
  const { schedules, volumes } = useIrrigationPlan();
  const { sources, records } = useWaterSources();
  const { tanks } = useNutrientTanks();
  const { health } = useSilkwormHealth();
  const { items } = useNotifications();
  const { models, active: activeModels } = useAutomationModels();
  const climate = useClimate();
  const [preview, setPreview] = useState<Report | null>(null);
  const [message, setMessage] = useState("");
  const importInput = useRef<HTMLInputElement>(null);
  const blockName = (id: string) => (id === "all" ? "All blocks" : (blocks.find((block) => block.id === id)?.name ?? "Removed block"));
  const valveName = (id: string) => farmValves.find((valve) => valve.id === id)?.name ?? id;

  const reports: ReportCard[] = [
    {
      id: "yield",
      title: "Cocoon Yield",
      text: "Every batch with breed, dates, layings, cocoon yield, grade and mortality",
      icon: Egg,
      build: () => {
        const harvested = batches.filter((batch) => batch.cocoonKg !== null);
        const total = harvested.reduce((sum, batch) => sum + (batch.cocoonKg ?? 0), 0);
        return {
          title: "Cocoon Yield Report",
          subtitle: `${batches.length} batches · ${harvested.length} with yield recorded · ${total.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg in total`,
          tables: [
            {
              heading: "Batches",
              note: "Yield per 100 DFLs is cocoon weight divided by layings brushed × 100.",
              columns: ["Batch", "Breed", "Breed type", "Farm", "Shed", "Brushed", "Harvested", "DFLs", "Cocoon (kg)", "kg / 100 DFLs", "Grade", "Mortality (%)", "Status"],
              rows: batches.map((batch) => [
                batch.id,
                batch.breed,
                batch.breedType,
                batch.farm,
                batch.shed,
                formatDate(batch.brushedOn),
                batch.harvestedOn ? formatDate(batch.harvestedOn) : "",
                batch.layings,
                batch.cocoonKg,
                batch.cocoonKg === null ? null : Math.round((batch.cocoonKg / batch.layings) * 1000) / 10,
                batch.grade ?? "",
                batch.mortality,
                batch.status,
              ]),
            },
            {
              heading: "By breed",
              columns: ["Breed", "Batches harvested", "Total cocoon (kg)", "Average kg / 100 DFLs"],
              rows: [...new Set(harvested.map((batch) => batch.breed))].map((breed) => {
                const list = harvested.filter((batch) => batch.breed === breed);
                const kg = list.reduce((sum, batch) => sum + (batch.cocoonKg ?? 0), 0);
                const per100 = list.reduce((sum, batch) => sum + ((batch.cocoonKg ?? 0) / batch.layings) * 100, 0) / list.length;
                return [breed, list.length, Math.round(kg * 10) / 10, Math.round(per100 * 10) / 10];
              }),
            },
          ],
        };
      },
    },
    {
      id: "silkworm",
      title: "Silkworm & Medication",
      text: "Active batch medications, preset doses and photo health checks",
      icon: Bug,
      build: () => ({
        title: "Silkworm & Medication Report",
        subtitle: `Batch ${active.id} · ${active.breed} · ${active.shed}`,
        tables: [
          { heading: "Medications", columns: ["Date", "Product", "Purpose", "Dose", "Instar", "Status", "Source", "Notes"], rows: medicationsFor(active, health).map((item) => [formatDate(item.date), item.product, item.purpose, item.dose, item.instar ?? "", item.status, item.presetId ? "Preset" : "Manual", item.notes ?? ""]) },
          { heading: "Photo health checks", columns: ["Date", "Finding", "Severity", "Notes"], rows: health.checks.filter((check) => check.batchId === active.id).map((check) => [formatDate(check.date), check.likely, check.severity, check.notes ?? ""]) },
        ],
      }),
    },
    {
      id: "mulberry",
      title: "Mulberry Field",
      text: "Blocks, varieties, irrigation type and every field record",
      icon: Leaf,
      build: () => ({
        title: "Mulberry Field Report",
        subtitle: `${blocks.length} blocks · ${blocks.reduce((sum, block) => sum + block.area, 0)} acres`,
        tables: [
          { heading: "Blocks", columns: ["Block", "Variety", "Area (acres)", "Irrigation", "Planting", "Planted", "Manure every (days)"], rows: blocks.map((block) => [block.name, block.variety, block.area, block.irrigation, block.plantingSystem, formatDate(block.plantedOn), block.manuringEveryDays]) },
          {
            heading: "Field records",
            columns: ["Date", "Block", "Activity", "Title", "Status", "Product", "Dose", "Wait (days)", "Defect", "Severity", "Affected (%)", "Notes"],
            rows: activities.map((item) => [formatDate(item.date), blockName(item.blockId), item.type, item.title, item.status, item.product ?? "", item.dose ?? "", item.waitDays, item.defect ?? "", item.severity ?? "", item.affected, item.aiFinding ?? item.notes ?? ""]),
          },
        ],
      }),
    },
    {
      id: "irrigation",
      title: "Irrigation & Water",
      text: "Schedules, volume limits, water sources and their records",
      icon: Waves,
      build: () => ({
        title: "Irrigation & Water Report",
        subtitle: `${schedules.length} schedules · ${sources.length} water sources · daily budget ${volumes.dailyBudget} L`,
        tables: [
          { heading: "Schedules", columns: ["Valve", "Start", "Days", "Stops after", "Amount", "Enabled"], rows: schedules.map((item) => [valveName(item.valveId), item.start, item.days.join(" "), item.limit === "volume" ? "Volume" : "Duration", item.limit === "volume" ? `${item.volume} L` : `${item.duration} min`, item.enabled ? "Yes" : "No"]) },
          { heading: "Recent irrigation runs", columns: ["Start", "Duration", "Water used (L)", "Status"], rows: irrigationSessions.map((item) => [item.start, item.duration, item.waterUsed, item.status]) },
          { heading: "Water sources", columns: ["Name", "Type", "Main supply", "In use", "Depth (ft)", "Water level (ft)", "Yield (L/h)", "Storage (L)", "Pump (HP)", "Availability", "Quality"], rows: sources.map((item) => [item.name, item.type, item.primary ? "Yes" : "", item.active ? "Yes" : "No", item.depthFt, item.waterLevelFt, item.yieldLph, item.storageL, item.pumpHp, item.availability ?? "", item.quality]) },
          { heading: "Water source records", columns: ["Date", "Source", "Record", "Value", "Notes"], rows: records.map((item) => [formatDate(item.date), sources.find((source) => source.id === item.sourceId)?.name ?? "", item.kind, item.value ?? "", item.notes ?? ""]) },
        ],
      }),
    },
    {
      id: "fertigation",
      title: "Fertigation",
      text: "Tank stock, nutrient readings and approved recipes",
      icon: FlaskConical,
      build: () => ({
        title: "Fertigation Report",
        subtitle: `${tanks.reduce((sum, tank) => sum + tank.levelL, 0).toLocaleString()} L in stock across ${tanks.length} tanks`,
        tables: [
          { heading: "Nutrient tanks", columns: ["Tank", "Product", "Level (L)", "Capacity (L)", "Level (%)", "Daily use (L)", "Days left", "Last filled"], rows: tanks.map((tank) => [tank.label, tank.product, tank.levelL, tank.capacityL, Math.round((tank.levelL / tank.capacityL) * 100), tank.dailyUseL, tank.dailyUseL ? Math.floor(tank.levelL / tank.dailyUseL) : "", tank.lastFilled ? formatDate(tank.lastFilled) : ""]) },
          { heading: "Nutrient readings", columns: ["Reading", "Value", "Unit", "Target low", "Target high"], rows: fertigationReadings.map((item) => [item.name, item.value, item.unit, item.min, item.max]) },
          { heading: "Recipes", columns: ["Recipe", "Target EC (mS/cm)", "Dose (mL)", "Status"], rows: fertigationSessions.map((item) => [item.recipe, item.ecTarget, item.dose, item.status]) },
        ],
      }),
    },
    {
      id: "environment",
      title: "Farm & Shed Environment",
      text: "Latest sensor readings and climate equipment state",
      icon: Warehouse,
      build: () => ({
        title: "Farm & Shed Environment Report",
        subtitle: `Climate control: ${climate.mode === "auto" ? "Automatic" : climate.mode === "semi" ? "Semi-automatic" : "Manual"}`,
        tables: [
          { heading: "Sensor readings", columns: ["Sensor", "Value", "Unit", "Location", "Status", "Updated"], rows: sensorReadings.map((item) => [item.name, item.value, item.unit, item.location, item.status, item.timestamp]) },
          { heading: "Climate equipment", columns: ["Device", "Group", "State", "Reason (automatic)"], rows: climateEquipment.map((item) => [item.name, item.group, climate.isOn(item.name) ? "On" : "Off", climate.mode === "auto" ? climate.plan[item.name]?.reason : ""]) },
        ],
      }),
    },
    {
      id: "automation",
      title: "Automation Models",
      text: "Saved automation models and which one is active in each area",
      icon: Zap,
      build: () => ({
        title: "Automation Models Report",
        subtitle: `${models.length} saved models`,
        tables: (["irrigation", "fertigation", "shed"] as const).map((area) => ({
          heading: `${area[0].toUpperCase()}${area.slice(1)} models`,
          columns: ["Model", "Active", ...modelFields[area].map((field) => (field.type === "number" && field.unit ? `${field.label} (${field.unit})` : field.label))],
          rows: models.filter((model) => model.area === area).map((model) => [model.name, activeModels[area] === model.id ? "Yes" : "", ...modelFields[area].map((field) => (field.type === "toggle" ? (model.values[field.key] ? "Yes" : "No") : (model.values[field.key] as string | number)))]),
        })),
      }),
    },
    {
      id: "alerts",
      title: "Alerts",
      text: "Open, read and ignored alerts with their recommended actions",
      icon: Bell,
      build: () => ({
        title: "Alerts Report",
        subtitle: `${items.filter((item) => item.state === "new").length} open of ${items.length}`,
        tables: [{ heading: "Alerts", columns: ["Time", "Severity", "Alert", "Value", "Location", "State", "Recommended action"], rows: items.map((item) => [item.timestamp, item.severity, item.parameter, item.value, item.location, item.state === "new" ? "Open" : item.state === "read" ? "Read" : "Ignored", item.recommendedAction]) }],
      }),
    },
    {
      id: "ai",
      title: "AI Recommendations",
      text: "Recommendations and your approve / reject decisions",
      icon: Cpu,
      build: () => {
        const decisions = readAiDecisions();
        return {
          title: "AI Recommendations Report",
          subtitle: `${Object.keys(decisions).length} of ${aiInsights.length} reviewed`,
          tables: [{ heading: "Recommendations", columns: ["Area", "Summary", "Detail", "Decision"], rows: aiInsights.map((item) => [item.title, item.summary, item.detail, decisions[item.id] === "approved" ? "Approved" : decisions[item.id] === "rejected" ? "Rejected" : "Awaiting review"]) }],
        };
      },
    },
  ];

  const everything = (): Report => {
    const built = reports.map((card) => card.build());
    return { title: "Complete Farm Report", subtitle: `All ${built.length} reports in one file`, tables: built.flatMap((report) => report.tables.map((table) => ({ ...table, heading: `${report.title.replace(" Report", "")} · ${table.heading}` }))) };
  };

  const backup = () => {
    const data: Record<string, unknown> = {};
    for (const key of backupKeys) {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) data[key] = JSON.parse(raw);
      } catch {
        // Skip unreadable entries.
      }
    }
    download(toJson({ app: "Paari Seritech", exportedAt: new Date().toISOString(), settings: data }), `paari-seritech-settings-${new Date().toISOString().slice(0, 10)}.json`);
    setMessage(`Backup saved with ${Object.keys(data).length} groups of settings.`);
  };

  const restore = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const settings = parsed?.settings;
      if (!settings || typeof settings !== "object") throw new Error("Not a Paari Seritech backup file.");
      const keys = Object.keys(settings).filter((key) => backupKeys.includes(key));
      if (!keys.length) throw new Error("The file has no settings to restore.");
      if (!window.confirm(`Restore ${keys.length} groups of settings from this backup? Current settings in this browser will be replaced.`)) return;
      keys.forEach((key) => localStorage.setItem(key, JSON.stringify(settings[key])));
      window.location.reload();
    } catch (problem) {
      setMessage(problem instanceof Error ? problem.message : "That file could not be read.");
    }
  };

  return (
    <DashboardPage tint="slate">
      <PageHeader icon={FileText} eyebrow="Reports" title="Operational and AI reporting" detail="View any report, or export it as PDF, Word, Excel or CSV" />

      <section aria-label="Export everything" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f5c2e] via-[#11692f] to-[#082f17] p-6 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-[#6fe07f]/25 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <Layers className="h-5 w-5" aria-hidden="true" /> Complete farm report
            </div>
            <p className="mt-1 text-sm text-white/75">Every report below in one file: yield, silkworm, mulberry, irrigation, fertigation, environment, automation, alerts and AI.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setPreview(everything())} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#0f5c2e] hover:bg-white/90">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" /> View
              </button>
              {[
                { label: "PDF", icon: Printer, run: () => printReport(everything()) || window.alert("Allow pop-ups for this site to save the PDF.") },
                { label: "Word", icon: FileType, run: () => download(toDocx(everything()), `${fileSlug("complete farm report")}.docx`) },
                { label: "Excel", icon: FileSpreadsheet, run: () => download(toXlsx(everything()), `${fileSlug("complete farm report")}.xlsx`) },
              ].map((format) => (
                <button key={format.label} type="button" onClick={format.run} className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold ring-1 ring-white/20 hover:bg-white/25">
                  <format.icon className="h-3.5 w-3.5" aria-hidden="true" /> {format.label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <div className="flex items-center gap-2 text-base font-bold">
              <Archive className="h-5 w-5" aria-hidden="true" /> Settings backup
            </div>
            <p className="mt-1 text-sm text-white/75">All settings and records (farm, batches, schedules, models, tanks, devices, users) in one file. Restore it on another browser or after clearing data.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={backup} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#0f5c2e] hover:bg-white/90">
                <FileJson className="h-3.5 w-3.5" aria-hidden="true" /> Export settings
              </button>
              <button type="button" onClick={() => importInput.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold ring-1 ring-white/20 hover:bg-white/25">
                <Upload className="h-3.5 w-3.5" aria-hidden="true" /> Restore from file
              </button>
              <input ref={importInput} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(event) => restore(event.target.files?.[0])} />
            </div>
            {message && (
              <p className="mt-2 text-xs font-semibold text-[#c8f5cf]" role="status">
                {message}
              </p>
            )}
          </div>
        </div>
      </section>

      <section aria-label="Reports">
        <SectionHeader icon={FileText} title="Reports" detail="View a report, or download it as PDF, Word, Excel or CSV" />
        <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((card) => (
            <article key={card.id} className="dash-card flex flex-col rounded-2xl border border-[var(--d-card-border)] bg-[var(--d-card)] p-5 transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6fe07f] to-[#00a218] text-white">
                  <card.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[var(--d-text)]">{card.title}</h3>
                  <p className="mt-0.5 text-xs leading-5 text-[var(--d-muted)]">{card.text}</p>
                </div>
              </div>
              <div className="mt-auto pt-4">
                <button type="button" onClick={() => setPreview(card.build())} className={`${buttonPrimary} mb-2 w-full justify-center`}>
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" /> View report
                </button>
                <ExportButtons build={card.build} label={card.title} />
              </div>
            </article>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--d-muted)]">
          <Download className="h-3.5 w-3.5" aria-hidden="true" /> PDF opens the print window: choose <strong>Save as PDF</strong>. Word and Excel files open in Microsoft Office, Google Docs/Sheets and LibreOffice.
        </p>
      </section>

      {preview && <ReportPreview report={preview} onClose={() => setPreview(null)} />}
    </DashboardPage>
  );
}
