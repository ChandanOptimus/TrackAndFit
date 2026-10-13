import type { Grade } from "@/lib/weeks";

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ChangeText({ change }: { change: number | null }) {
  if (change === null) return <span className="muted">—</span>;
  const rounded = Math.round(change * 100) / 100;
  const cls = rounded < 0 ? "down" : rounded > 0 ? "up" : "";
  const sign = rounded > 0 ? "+" : "";
  return <span className={cls}>{sign}{rounded.toFixed(2)} kg</span>;
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
