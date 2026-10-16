"use client";

import { Bug, Camera, CircleDot, Egg, Leaf, ScanEye } from "lucide-react";

import { type Icon, Widget } from "@/components/dashboard/dashboard-widgets";
import { SectionHeader } from "@/components/dashboard/monitor-widgets";
import { DashboardPage, PageHeader, Pill } from "@/components/dashboard/page-kit";
import { cameraAnalyses } from "@/data/mock";

const cameraIcons: Record<string, Icon> = { Silkworm: Bug, Mulberry: Leaf, Cocoon: Egg };

export default function CamerasPage() {
  return (
    <DashboardPage tint="slate">
      <PageHeader icon={Camera} eyebrow="Cameras / Computer Vision" title="AI computer vision" detail="Camera analysis for silkworms, mulberry and cocoons" badge="Future Module" />

      <section aria-label="Camera modules">
        <SectionHeader icon={ScanEye} title="Vision Modules" detail="What each camera will measure once installed" />
        <div className="grid items-start gap-4 lg:grid-cols-3">
          {cameraAnalyses.map((camera) => {
            const CameraIcon = cameraIcons[camera.name] ?? Camera;
            return (
              <Widget key={camera.id} title={camera.name} icon={CameraIcon} action={<Pill tone="info">{camera.status}</Pill>}>
                <div className="mb-4 flex h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[var(--d-line)] bg-[var(--d-inset)] text-[var(--d-muted)]">
                  <Camera className="h-8 w-8" aria-hidden="true" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">No feed connected</span>
                </div>
                <ul className="space-y-2">
                  {camera.metrics.map((metric) => (
                    <li key={metric} className="flex items-center gap-2 text-sm text-[var(--d-soft)]">
                      <CircleDot className="h-3.5 w-3.5 shrink-0 text-[var(--d-accent)]" aria-hidden="true" /> {metric}
                    </li>
                  ))}
                </ul>
              </Widget>
            );
          })}
        </div>
      </section>
    </DashboardPage>
  );
}
