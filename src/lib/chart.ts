import { addDays, daysBetween } from "./weeks";

export interface Point {
  date: string; // YYYY-MM-DD
  value: number;
}

export type Range = "4w" | "3m" | "all";

export const RANGES: { id: Range; label: string }[] = [
  { id: "4w", label: "4 weeks" },
  { id: "3m", label: "3 months" },
  { id: "all", label: "All" },
];

/** First day to show for a range, or null for everything. */
export function rangeStart(range: Range, today: string): string | null {
  if (range === "4w") return addDays(today, -28);
  if (range === "3m") return addDays(today, -91);
  return null;
}

export function inRange(points: Point[], from: string | null): Point[] {
  return from === null ? points : points.filter((p) => p.date >= from);
}

/** Round, evenly spaced axis values (1, 2 or 5 times a power of ten) covering [min, max]. */
export function niceTicks(min: number, max: number, target = 4): number[] {
  if (!(max > min)) max = min + 1;
  const rawStep = (max - min) / target;
  const pow = 10 ** Math.floor(Math.log10(rawStep));
  const fraction = rawStep / pow;
  const step = (fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10) * pow;
  const ticks: number[] = [];
  for (let n = Math.ceil(min / step); n * step <= max + step * 1e-9; n++) {
    ticks.push(Number((n * step).toPrecision(12)));
  }
  return ticks;
}

/** The value range to draw: the data plus a little breathing room, never flatter than `minPad` each side. */
export function paddedDomain(values: number[], minPad: number): [number, number] {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = Math.max((hi - lo) * 0.2, minPad);
  return [lo - pad, hi + pad];
}

/** The date range to draw. A single day is widened so the point sits in the middle. */
export function dateDomain(dates: string[]): [string, string] {
  const sorted = [...dates].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (first === last) return [addDays(first, -3), addDays(last, 3)];
  return [first, last];
}

/** `count` dates evenly spread across the domain, for the x axis labels. */
export function dateTicks(start: string, end: string, count = 4): string[] {
  const span = daysBetween(start, end);
  if (span <= 0) return [start];
  const n = Math.min(count, span + 1);
  return Array.from({ length: n }, (_, i) => addDays(start, Math.round((span * i) / Math.max(1, n - 1))));
}

/** Where a date falls along the x axis, 0 at the start of the domain and 1 at the end. */
export function fractionOf(date: string, start: string, end: string): number {
  const span = daysBetween(start, end);
  return span <= 0 ? 0.5 : daysBetween(start, date) / span;
}

/** Index of the point closest to a position along the axis (0..1). Points must be sorted by date. */
export function nearestIndex(points: Point[], fraction: number, start: string, end: string): number {
  let best = 0;
  let bestDistance = Infinity;
  points.forEach((p, i) => {
    const d = Math.abs(fractionOf(p.date, start, end) - fraction);
    if (d < bestDistance) {
      best = i;
      bestDistance = d;
    }
  });
  return best;
}
