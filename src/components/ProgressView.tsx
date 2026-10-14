"use client";

import Link from "next/link";
import { useState } from "react";
import { RANGES, inRange, rangeStart, type Point, type Range } from "@/lib/chart";
import { BMI_LIMITS, bmiLevel, bmiOf, bodyFatLevel, type Level, type Limits } from "@/lib/health";
import { planFor } from "@/lib/plan";
import { useHeight } from "@/lib/profile-store";
import { useWeightEntries } from "@/lib/storage";
import { addDays, buildWeeks, todayISO } from "@/lib/weeks";
import { ChartCard, type LegendItem } from "./ChartCard";
import { Loading } from "./format";
import type { Band } from "./LineChart";

const LEVEL_COLOR: Record<Level, string> = {
  low: "#3b82f6",
  standard: "#10b981",
  high: "#f59e0b",
  toohigh: "#ef4444",
};

function bandsFor(l: Limits): Band[] {
  return [
    { from: -Infinity, to: l.low, color: LEVEL_COLOR.low },
    { from: l.low, to: l.standard, color: LEVEL_COLOR.standard },
    { from: l.standard, to: l.high, color: LEVEL_COLOR.high },
    { from: l.high, to: Infinity, color: LEVEL_COLOR.toohigh },
  ];
}

function legendFor(l: Limits): LegendItem[] {
  return [
    { label: "Low", detail: `under ${l.low}`, color: LEVEL_COLOR.low },
    { label: "Standard", detail: `${l.low}–${l.standard}`, color: LEVEL_COLOR.standard },
    { label: "High", detail: `${l.standard}–${l.high}`, color: LEVEL_COLOR.high },
    { label: "Too high", detail: `${l.high}+`, color: LEVEL_COLOR.toohigh },
  ];
}

const PERIOD_LABEL: Record<Range, string> = { "4w": "4 weeks", "3m": "3 months", all: "all time" };

export function ProgressView({ userId }: { userId: string }) {
  const { entries, bodyFat, loadError } = useWeightEntries(userId);
  const { heightCm, loaded: heightLoaded } = useHeight(userId);
  const [range, setRange] = useState<Range>("3m");

  if (!entries || !heightLoaded) return <Loading error={loadError} />;

  const today = todayISO();
  const from = rangeStart(range, today);
  const sorted = (map: Record<string, number>): Point[] =>
    Object.keys(map)
      .sort()
      .map((date) => ({ date, value: map[date] }));

  const weight = inRange(sorted(entries), from);
  const bmi: Point[] = heightCm ? weight.map((p) => ({ date: p.date, value: bmiOf(p.value, heightCm) })) : [];
  const fat = inRange(sorted(bodyFat), from);

  // The weekly average of each 7-day block (the same blocks the Weekly report uses), plotted mid-week.
  // The current week is still in progress, so its point is held at today instead of landing in the future.
  const weekly = inRange(
    buildWeeks(entries, today)
      .filter((w) => w.average !== null)
      .map((w) => {
        const mid = addDays(w.start, 3);
        return { date: mid > today ? today : mid, value: Math.round((w.average as number) * 100) / 100 };
      }),
    from,
  );

  const fatLimits = planFor(userId).bodyFatLimits;
  const period = PERIOD_LABEL[range];
  const none = `No entries in the last ${period}.`;

  return (
    <>
      <div className="row between">
        <h1>Progress</h1>
        <div className="range-tabs" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button key={r.id} type="button" className={r.id === range ? "active" : undefined} aria-pressed={r.id === range} onClick={() => setRange(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <p className="muted small">Touch or hover over a chart to see the value for a day.</p>

      <ChartCard
        title="Weight"
        unit="kg"
        decimals={1}
        minPad={0.5}
        periodLabel={period}
        ariaLabel="Line chart of your weight over time"
        empty={entries && Object.keys(entries).length ? none : <>No weight yet. <Link href={`/${userId}/weight`}>Log your weight</Link> to start the chart.</>}
        series={[
          { id: "daily", label: "Daily", color: "var(--user)", points: weight, dots: true, width: 1.75, opacity: 0.6, scrub: true },
          ...(weekly.length > 1 ? [{ id: "weekly", label: "Weekly average", color: "var(--user)", points: weekly, width: 3.5 }] : []),
        ]}
        legend={[
          { label: "Daily", color: "color-mix(in srgb, var(--user) 60%, transparent)" },
          ...(weekly.length > 1 ? [{ label: "Weekly average", color: "var(--user)" }] : []),
        ]}
      />

      <ChartCard
        title="BMI"
        unit=""
        decimals={1}
        minPad={0.5}
        periodLabel={period}
        ariaLabel="Line chart of your BMI over time"
        levelOf={bmiLevel}
        bands={bandsFor(BMI_LIMITS)}
        legend={legendFor(BMI_LIMITS)}
        empty={
          heightCm ? none : (
            <>
              BMI needs your height. <Link href={`/${userId}/weight`}>Add it on the Log weight page.</Link>
            </>
          )
        }
        series={[{ id: "bmi", label: "BMI", color: "var(--c-carbs)", points: bmi, dots: true, scrub: true }]}
      />

      <ChartCard
        title="Body fat"
        unit="%"
        decimals={1}
        minPad={1}
        periodLabel={period}
        ariaLabel="Line chart of your body fat percentage over time"
        levelOf={(v) => bodyFatLevel(v, fatLimits)}
        bands={bandsFor(fatLimits)}
        legend={legendFor(fatLimits)}
        empty={
          Object.keys(bodyFat).length ? none : (
            <>
              No body fat entries yet. Add one in the <Link href={`/${userId}/weight`}>Body fat box</Link> when you log your weight.
            </>
          )
        }
        series={[{ id: "fat", label: "Body fat", color: "var(--c-calories)", points: fat, dots: true, scrub: true }]}
      />
      <p className="muted small">BMI uses your current height for every day shown.</p>
    </>
  );
}
