"use client";

import { useEffect, useState } from "react";
import { Activity, Gauge, IndianRupee, PlugZap } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useDashboardTheme } from "@/components/dashboard/dashboard-theme";
import { InfoRow, Pill, type Tone, toneColor } from "@/components/dashboard/page-kit";
import { phaseReadings, powerHistory, pumpProtection } from "@/data/mock";
import type { PhaseReading } from "@/types";

// 415 V line / 240 V phase supply; the pump panel accepts ±10 % before its voltage relay trips.
const nominal = 240;
const voltageLow = nominal * 0.9;
const voltageHigh = nominal * 1.1;
const ratedCurrent = 7.5; // motor full-load amps per phase
const imbalanceLimit = 2; // % deviation from the average phase voltage

// Conventional phase marker colours; each phase is always labelled, so colour is never the only cue.
const phaseColor: Record<PhaseReading["phase"], string> = { R: "#e5484d", Y: "#d4a300", B: "#3b82f6" };

// Demo feed: voltages and currents wander a little every two seconds.
function nextReadings(current: PhaseReading[]): PhaseReading[] {
  return current.map((reading, index) => {
    const base = phaseReadings[index];
    const voltage = Math.min(base.voltage + 4, Math.max(base.voltage - 4, reading.voltage + (Math.random() - 0.5) * 1.6));
    const current_ = Math.min(base.current + 0.4, Math.max(base.current - 0.4, reading.current + (Math.random() - 0.5) * 0.2));
    return { ...reading, voltage, current: current_ };
  });
}

// Line-to-line voltage between two phases 120° apart.
const lineVoltage = (a: number, b: number) => Math.sqrt(a * a + b * b + a * b);

export function usePowerFeed() {
  const [readings, setReadings] = useState(phaseReadings);
  const [frequency, setFrequency] = useState(50.02);
  const [tariff, setTariff] = useState(6.5); // ₹ per kWh
  useEffect(() => {
    const timer = window.setInterval(() => {
      setReadings(nextReadings);
      setFrequency((value) => Math.min(50.3, Math.max(49.7, value + (Math.random() - 0.5) * 0.06)));
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  const average = readings.reduce((sum, reading) => sum + reading.voltage, 0) / readings.length;
  const imbalance = (Math.max(...readings.map((reading) => Math.abs(reading.voltage - average))) / average) * 100;
  const kw = readings.reduce((sum, reading) => sum + (reading.voltage * reading.current * reading.powerFactor) / 1000, 0);
  const powerFactor = readings.reduce((sum, reading) => sum + reading.powerFactor, 0) / readings.length;
  const outOfRange = readings.filter((reading) => reading.voltage < voltageLow || reading.voltage > voltageHigh);
  return { readings, frequency, imbalance, kw, powerFactor, outOfRange, tariff, setTariff };
}

export type Feed = ReturnType<typeof usePowerFeed>;

// Overall supply state, shown on the Pump & Power block header.
export function supplyStatus({ imbalance, outOfRange }: Feed): { tone: Tone; label: string } {
  return outOfRange.length ? { tone: "danger", label: "Voltage out of range" } : imbalance > imbalanceLimit ? { tone: "warn", label: `Imbalance ${imbalance.toFixed(1)}%` } : { tone: "accent", label: "Supply balanced" };
}

export function SupplyPanel({ feed }: { feed: Feed }) {
  const { readings, frequency, imbalance, powerFactor } = feed;
  const pairs: [PhaseReading, PhaseReading][] = [
    [readings[0], readings[1]],
    [readings[1], readings[2]],
    [readings[2], readings[0]],
  ];

  return (
    <div>
      <div className="grid grid-cols-3 gap-3" aria-live="off">
        {readings.map((reading) => {
          const bad = reading.voltage < voltageLow || reading.voltage > voltageHigh;
          return (
            <div key={reading.phase} className="rounded-md bg-[var(--d-inset)] p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: phaseColor[reading.phase] }} aria-hidden="true" />
                {reading.phase} phase
              </div>
              <div className="mt-1 text-2xl font-bold tabular-nums" style={{ color: bad ? toneColor.danger : "var(--d-text)" }}>
                {reading.voltage.toFixed(1)}
                <span className="ml-1 text-xs font-medium text-[var(--d-muted)]">V</span>
              </div>
              <div className="text-xs tabular-nums text-[var(--d-soft)]">
                {reading.current.toFixed(1)} A · PF {reading.powerFactor.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        {pairs.map(([a, b]) => (
          <div key={a.phase + b.phase} className="rounded-md bg-[var(--d-chip)] px-2 py-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">
              {a.phase}–{b.phase}
            </div>
            <div className="text-sm font-semibold tabular-nums text-[var(--d-text)]">{lineVoltage(a.voltage, b.voltage).toFixed(0)} V</div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <InfoRow label="Frequency" value={`${frequency.toFixed(2)} Hz`} icon={Activity} />
        <InfoRow label="Voltage imbalance" value={`${imbalance.toFixed(1)} %`} icon={Gauge} tone={imbalance > imbalanceLimit ? "warn" : undefined} />
        <InfoRow label="Average power factor" value={powerFactor.toFixed(2)} icon={PlugZap} />
        <InfoRow label="Safe voltage band" value={`${voltageLow.toFixed(0)}–${voltageHigh.toFixed(0)} V`} />
      </div>
    </div>
  );
}

export function EnergyPanel({ feed }: { feed: Feed }) {
  const { palette } = useDashboardTheme();
  const { tariff, setTariff } = feed;
  const today = powerHistory.reduce((sum, point) => sum + point.value, 0);
  const month = 312.4 + today;

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Live load", value: feed.kw.toFixed(2), unit: "kW" },
          { label: "Today", value: today.toFixed(1), unit: "kWh" },
          { label: "This month", value: month.toFixed(0), unit: "kWh" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-md bg-[var(--d-inset)] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">{stat.label}</div>
            <div className="mt-1 text-xl font-bold tabular-nums text-[var(--d-text)]">
              {stat.value}
              <span className="ml-1 text-xs font-medium text-[var(--d-muted)]">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs font-semibold text-[var(--d-soft)]">Energy per hour today (kWh)</div>
      <div className="mt-1 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={powerHistory} margin={{ top: 8, right: 4, bottom: 0, left: -16 }} barCategoryGap={2}>
            <CartesianGrid stroke={palette.grid} vertical={false} />
            <XAxis dataKey="time" tickLine={false} axisLine={false} interval={2} tick={{ fill: palette.tick, fontSize: 10 }} />
            <YAxis tickLine={false} axisLine={false} width={40} tick={{ fill: palette.tick, fontSize: 10 }} />
            <Tooltip
              cursor={{ fill: palette.grid, opacity: 0.5 }}
              formatter={(value) => [`${Number(value).toFixed(1)} kWh`, "Energy"]}
              contentStyle={{ backgroundColor: palette.tooltipBg, border: `1px solid ${palette.tooltipBorder}`, borderRadius: 8, color: palette.text }}
              labelStyle={{ color: palette.muted }}
            />
            <Bar dataKey="value" fill={palette.warn} radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-b border-[var(--d-line)] py-2">
        <label htmlFor="power-tariff" className="flex items-center gap-2 text-sm text-[var(--d-soft)]">
          <IndianRupee className="h-4 w-4 text-[var(--d-muted)]" aria-hidden="true" /> Tariff
        </label>
        <div className="flex items-center rounded-md border border-[var(--d-line)] bg-[var(--d-popup)]">
          <input
            id="power-tariff"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={tariff}
            onChange={(event) => setTariff(Math.max(0, Number(event.target.value) || 0))}
            className="w-16 bg-transparent px-2 py-1.5 text-right text-sm font-semibold text-[var(--d-text)] outline-none"
          />
          <span className="pr-2 text-xs text-[var(--d-muted)]">₹/kWh</span>
        </div>
      </div>
      <InfoRow label="Estimated cost today" value={`₹${(today * tariff).toFixed(0)}`} />
      <InfoRow label="Estimated cost this month" value={`₹${(month * tariff).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
    </div>
  );
}

export function ProtectionPanel({ feed }: { feed: Feed }) {
  const load = feed.readings.reduce((sum, reading) => sum + reading.current, 0) / feed.readings.length;
  const overload = feed.readings.some((reading) => reading.current > ratedCurrent);
  const checks: { label: string; ok: boolean; okText: string; badText: string }[] = [
    { label: "Phase failure", ok: feed.readings.every((reading) => reading.voltage > 150), okText: "All phases present", badText: "Phase missing" },
    { label: "Voltage relay", ok: feed.outOfRange.length === 0, okText: "Within band", badText: "Tripped" },
    { label: "Phase imbalance", ok: feed.imbalance <= imbalanceLimit, okText: "Normal", badText: "High" },
    { label: "Overload relay", ok: !overload, okText: "Normal", badText: "Tripped" },
    { label: "Dry-run protection", ok: true, okText: "Armed", badText: "Tank empty" },
  ];

  return (
    <div>
      <div className="rounded-md bg-[var(--d-inset)] p-3">
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--d-muted)]">Motor load</div>
          <div className="text-xs text-[var(--d-muted)]">rated {ratedCurrent} A</div>
        </div>
        <div className="mt-1 text-xl font-bold tabular-nums text-[var(--d-text)]">
          {load.toFixed(1)}
          <span className="ml-1 text-xs font-medium text-[var(--d-muted)]">A · {Math.round((load / ratedCurrent) * 100)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--d-track)]" role="meter" aria-label="Motor load" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((load / ratedCurrent) * 100)}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (load / ratedCurrent) * 100)}%`, backgroundColor: overload ? "var(--d-danger)" : "var(--d-tint, var(--d-accent))" }} />
        </div>
      </div>

      <div className="mt-3">
        {checks.map((check) => (
          <InfoRow key={check.label} label={check.label} value={<Pill tone={check.ok ? "accent" : "danger"}>{check.ok ? check.okText : check.badText}</Pill>} />
        ))}
        <InfoRow label="Run hours today" value={`${pumpProtection.runHoursToday} h`} />
        <InfoRow label="Total run hours" value={`${pumpProtection.runHoursTotal.toLocaleString()} h`} />
        <InfoRow label="Starts today" value={pumpProtection.starts} />
        <InfoRow label="Last trip" value={pumpProtection.lastTrip} />
      </div>
    </div>
  );
}

