"use client";

import Link from "next/link";
import { useWeightEntries } from "@/lib/storage";
import { buildWeeks, todayISO } from "@/lib/weeks";
import { ChangeText, GradeBadge, Loading, formatDate } from "./format";
import { TargetsGrid } from "./TargetsGrid";

export function WeeklyView({ userId }: { userId: string }) {
  const { entries, loadError } = useWeightEntries(userId);
  if (!entries) return <Loading error={loadError} />;

  const weeks = buildWeeks(entries, todayISO()).reverse();

  return (
    <>
      <h1>Weekly report</h1>
      <p className="muted">
        Weeks are 7-day blocks counted from your first logged day. When a week ends, targets are
        recalculated from its average weight and graded on how much the average dropped versus the week before.
      </p>

      {weeks.length === 0 ? (
        <p>
          Nothing to report yet. <Link href={`/${userId}/weight`}>Log your weight</Link> to get started.
        </p>
      ) : (
        weeks.map((w) => (
          <section key={w.index} className="panel week">
            <div className="row">
              <div>
                <h2>Week {w.index + 1}{!w.complete && <span className="muted"> · in progress</span>}</h2>
                <div className="muted">
                  {formatDate(w.start)} – {formatDate(w.end)} · {w.entryCount} of 7 days logged
                </div>
              </div>
              <div>
                <div className="label">Average</div>
                {w.average === null ? <span className="muted">No entries</span> : `${w.average.toFixed(2)} kg`}
              </div>
              <div>
                <div className="label">Change vs previous week</div>
                <ChangeText change={w.change} />
              </div>
              <div>
                <div className="label">Grade</div>
                <GradeBadge grade={w.grade} />
              </div>
            </div>
            {w.targets && (
              <>
                <div className="label targets-label">Targets for the next week (from {w.average!.toFixed(2)} kg)</div>
                <TargetsGrid targets={w.targets} />
              </>
            )}
          </section>
        ))
      )}

      <h2>Grading</h2>
      <table>
        <tbody>
          <tr><td><GradeBadge grade="A" /></td><td>Average dropped 0.5 – 1.0 kg</td></tr>
          <tr><td><GradeBadge grade="B" /></td><td>Dropped 0.25 – 0.5 kg, or more than 1.0 kg (too fast)</td></tr>
          <tr><td><GradeBadge grade="C" /></td><td>Dropped less than 0.25 kg, or no change</td></tr>
          <tr><td><GradeBadge grade="D" /></td><td>Average increased</td></tr>
        </tbody>
      </table>
    </>
  );
}
