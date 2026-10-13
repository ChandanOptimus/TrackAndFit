import { calculateTargets, type Targets } from "./formulas";

export type Grade = "A" | "B" | "C" | "D";
export type Entries = Record<string, number>; // "YYYY-MM-DD" -> kg

export interface WeekSummary {
  index: number; // 0-based; displayed as Week index + 1
  start: string;
  end: string;
  entryCount: number;
  average: number | null;
  change: number | null; // average minus previous week's average (negative = lost weight)
  grade: Grade | null; // only for completed weeks that have a previous week to compare with
  complete: boolean;
  targets: Targets | null; // recalculated from the week's average, completed weeks only
}

const DAY_MS = 86_400_000;

function toMs(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  return fromMs(toMs(date) + days * DAY_MS);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((toMs(b) - toMs(a)) / DAY_MS);
}

/** Today's date in the user's local timezone as YYYY-MM-DD. */
export function todayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Grading is based on how much the weekly average dropped versus the week before.
 * Tweak the bands here.
 *   A: lost 0.5 - 1.0 kg   (ideal pace)
 *   B: lost 0.25 - 0.5 kg, or more than 1.0 kg (too fast)
 *   C: lost 0 - 0.25 kg    (barely moving)
 *   D: gained weight
 */
export function gradeForChange(change: number): Grade {
  const loss = Math.round(-change * 100) / 100;
  if (loss < 0) return "D";
  if (loss < 0.25) return "C";
  if (loss < 0.5) return "B";
  if (loss <= 1) return "A";
  return "B";
}

/** Weeks are consecutive 7-day blocks counted from the user's first logged day. */
export function buildWeeks(entries: Entries, today: string): WeekSummary[] {
  const dates = Object.keys(entries).sort();
  if (dates.length === 0) return [];

  const first = dates[0];
  const last = dates[dates.length - 1] > today ? dates[dates.length - 1] : today;
  const weekCount = Math.floor(daysBetween(first, last) / 7) + 1;

  const weeks: WeekSummary[] = [];
  for (let i = 0; i < weekCount; i++) {
    const start = addDays(first, i * 7);
    const end = addDays(start, 6);
    const weights = dates.filter((d) => d >= start && d <= end).map((d) => entries[d]);
    const average = weights.length
      ? weights.reduce((sum, w) => sum + w, 0) / weights.length
      : null;
    const complete = today > end;

    const prevAverage = i > 0 ? weeks[i - 1].average : null;
    const change = average !== null && prevAverage !== null ? average - prevAverage : null;

    weeks.push({
      index: i,
      start,
      end,
      entryCount: weights.length,
      average,
      change,
      grade: complete && change !== null ? gradeForChange(change) : null,
      complete,
      targets: complete && average !== null ? calculateTargets(average) : null,
    });
  }
  return weeks;
}
