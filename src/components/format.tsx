import { LEVEL_LABEL, type Level } from "@/lib/health";
import type { Grade } from "@/lib/weeks";

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Weekly change in kg. Pass `base` (the earlier average) to also show it as a percentage. */
export function ChangeText({ change, base }: { change: number | null; base?: number | null }) {
  if (change === null) return <span className="muted">—</span>;
  const rounded = Math.round(change * 100) / 100;
  const cls = rounded < 0 ? "down" : rounded > 0 ? "up" : "";
  const sign = rounded > 0 ? "+" : "";
  const percent = base ? Math.round((change / base) * 1000) / 10 : null;
  return (
    <span className={cls}>
      {sign}{rounded.toFixed(2)} kg
      {percent !== null && <span className="muted small"> ({percent > 0 ? "+" : ""}{percent.toFixed(1)}%)</span>}
    </span>
  );
}

export function GradeBadge({ grade }: { grade: Grade | null }) {
  if (!grade) return <span className="muted">—</span>;
  return <span className={`grade grade-${grade}`}>{grade}</span>;
}

export function Loading({ error }: { error: boolean }) {
  return error ? (
    <p className="error" role="alert">
      Couldn&apos;t load your data. Check your connection and refresh the page.
    </p>
  ) : (
    <p className="muted">Loading…</p>
  );
}

/** "13 Oct 26": short enough for a phone-width table. */
export function formatDateShort(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
}

export function LevelPill({ level }: { level: Level }) {
  return <span className={`pill pill-${level}`}>{LEVEL_LABEL[level]}</span>;
}
