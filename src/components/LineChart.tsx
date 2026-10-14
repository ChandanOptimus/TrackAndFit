"use client";

import { useState } from "react";
import { dateDomain, dateTicks, fractionOf, nearestIndex, niceTicks, paddedDomain, type Point } from "@/lib/chart";
import { useElementWidth } from "@/lib/use-width";

export interface ChartSeries {
  id: string;
  label: string;
  color: string; // any CSS colour, including var(--x)
  points: Point[]; // sorted by date
  dots?: boolean;
  width?: number; // line width in px
  opacity?: number;
  scrub?: boolean; // the series that the hover / touch readout follows
}

/** A shaded horizontal strip, used to show the Low / Standard / High ranges. */
export interface Band {
  from: number;
  to: number;
  color: string;
}

const M = { left: 40, right: 14, top: 10, bottom: 24 };

const shortDate = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

/**
 * A dependency-free SVG line chart. It is drawn at the width of its container so text stays readable,
 * and reports the point under a finger or mouse through `onScrub`.
 */
export function LineChart({
  series,
  bands = [],
  decimals = 1,
  minPad,
  height = 220,
  ariaLabel,
  onScrub,
}: {
  series: ChartSeries[];
  bands?: Band[];
  decimals?: number;
  minPad: number;
  height?: number;
  ariaLabel: string;
  onScrub?: (point: Point | null) => void;
}) {
  const [ref, measured] = useElementWidth();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const all = series.flatMap((s) => s.points);
  const width = measured || 320;
  const plotW = Math.max(10, width - M.left - M.right);
  const plotH = height - M.top - M.bottom;

  const primary = series.find((s) => s.scrub) ?? series[0];

  let body: React.ReactNode = null;
  if (all.length > 0 && primary) {
    const [d0, d1] = dateDomain(all.map((p) => p.date));
    const [v0, v1] = paddedDomain(
      all.map((p) => p.value),
      minPad,
    );
    const x = (date: string) => M.left + fractionOf(date, d0, d1) * plotW;
    const y = (v: number) => M.top + (1 - (v - v0) / (v1 - v0)) * plotH;
    const yTicks = niceTicks(v0, v1, 4);
    const xTicks = dateTicks(d0, d1, width < 420 ? 3 : 5);
    const active = activeIndex !== null ? (primary.points[activeIndex] ?? null) : null;

    const move = (e: React.PointerEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left - M.left) / plotW));
      const i = nearestIndex(primary.points, fraction, d0, d1);
      setActiveIndex(i);
      onScrub?.(primary.points[i]);
    };
    const clear = () => {
      setActiveIndex(null);
      onScrub?.(null);
    };

    body = (
      <svg
        className="chart-svg"
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        onPointerDown={move}
        onPointerMove={move}
        onPointerLeave={clear}
        onPointerCancel={clear}
      >
        {bands.map((b, i) => {
          if (b.to <= v0 || b.from >= v1) return null;
          const top = y(Math.min(b.to, v1));
          const bottom = y(Math.max(b.from, v0));
          return <rect key={i} x={M.left} y={top} width={plotW} height={bottom - top} style={{ fill: b.color }} fillOpacity={0.14} />;
        })}

        {yTicks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={M.left + plotW} y1={y(t)} y2={y(t)} className="chart-grid" />
            <text x={M.left - 6} y={y(t) + 4} textAnchor="end" className="chart-label">
              {Number.isInteger(t) ? t : t.toFixed(decimals)}
            </text>
          </g>
        ))}

        {xTicks.map((d, i) => (
          <text
            key={d}
            x={x(d)}
            y={height - 6}
            textAnchor={xTicks.length > 1 && i === 0 ? "start" : xTicks.length > 1 && i === xTicks.length - 1 ? "end" : "middle"}
            className="chart-label"
          >
            {shortDate(d)}
          </text>
        ))}

        {series.map((s) => {
          if (s.points.length === 0) return null;
          const path = s.points.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
          const showDots = s.dots && s.points.length <= 60;
          return (
            <g key={s.id} opacity={s.opacity ?? 1}>
              {s.points.length > 1 && (
                <path d={path} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={s.width ?? 2.5} style={{ stroke: s.color }} />
              )}
              {(showDots || s.points.length === 1) &&
                s.points.map((p) => <circle key={p.date} cx={x(p.date)} cy={y(p.value)} r={s.points.length === 1 ? 5 : 3} style={{ fill: s.color }} />)}
            </g>
          );
        })}

        {active && (
          <g pointerEvents="none">
            <line x1={x(active.date)} x2={x(active.date)} y1={M.top} y2={M.top + plotH} className="chart-cursor" />
            <circle cx={x(active.date)} cy={y(active.value)} r={6} className="chart-active" style={{ stroke: primary.color }} />
          </g>
        )}
      </svg>
    );
  }

  return (
    <div ref={ref} className="chart-box">
      {body}
    </div>
  );
}
