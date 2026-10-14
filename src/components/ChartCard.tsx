"use client";

import { useState } from "react";
import type { Point } from "@/lib/chart";
import type { Level } from "@/lib/health";
import { LevelPill, formatDate } from "./format";
import { LineChart, type Band, type ChartSeries } from "./LineChart";

export interface LegendItem {
  label: string;
  detail?: string;
  color: string;
}

/**
 * A titled chart. The header shows the latest value, or the value under your finger or mouse while you
 * scrub across the chart, and how much it has changed since the start of the chosen period.
 */
export function ChartCard({
  title,
  unit,
  decimals,
  minPad,
  series,
  bands,
  legend,
  levelOf,
  periodLabel,
  empty,
  ariaLabel,
}: {
  title: string;
  unit: string;
  decimals: number;
  minPad: number;
  series: ChartSeries[];
  bands?: Band[];
  legend?: LegendItem[];
  levelOf?: (value: number) => Level;
  periodLabel: string;
  empty: React.ReactNode;
  ariaLabel: string;
}) {
  const [scrub, setScrub] = useState<Point | null>(null);

  const primary = series.find((s) => s.scrub) ?? series[0];
  const points = primary?.points ?? [];
  const latest = points[points.length - 1];
  const shown = scrub ?? latest;
  const delta = points.length > 1 ? points[points.length - 1].value - points[0].value : null;
  const deltaRounded = delta === null ? null : Math.round(delta * 10 ** decimals) / 10 ** decimals;

  return (
    <section className="panel chart-card">
      <div className="chart-head">
        <div>
          <div className="label">{title}</div>
          {shown ? (
            <div className="chart-value">
              {shown.value.toFixed(decimals)} <small>{unit}</small>{" "}
              {levelOf && <LevelPill level={levelOf(Math.round(shown.value * 10) / 10)} />}
            </div>
          ) : (
            <div className="chart-value muted">–</div>
          )}
          <div className="muted small">
            {shown ? (scrub ? formatDate(shown.date) : `Latest · ${formatDate(shown.date)}`) : "No data"}
          </div>
        </div>
        {deltaRounded !== null && (
          <div className="chart-delta">
            <span className={deltaRounded < 0 ? "down" : deltaRounded > 0 ? "up" : ""}>
              {deltaRounded > 0 ? "+" : ""}
              {deltaRounded.toFixed(decimals)} {unit}
            </span>
            <div className="muted small">over {periodLabel}</div>
          </div>
        )}
      </div>

      {points.length === 0 ? (
        <p className="muted chart-empty">{empty}</p>
      ) : (
        <>
          <LineChart series={series} bands={bands} decimals={decimals} minPad={minPad} ariaLabel={ariaLabel} onScrub={setScrub} />
          {legend && legend.length > 0 && (
            <ul className="chart-legend">
              {legend.map((l) => (
                <li key={l.label}>
                  <span className="swatch" style={{ background: l.color }} />
                  {l.label}
                  {l.detail && <span className="muted"> {l.detail}</span>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
