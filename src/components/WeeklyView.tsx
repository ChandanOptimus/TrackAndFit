"use client";

import Link from "next/link";
import { average, bmiLevel, bmiOf, bodyFatLevel, valuesBetween } from "@/lib/health";
import { computePlan, planFor } from "@/lib/plan";
import { useHeight } from "@/lib/profile-store";
import { useWeightEntries } from "@/lib/storage";
import { buildWeeks, todayISO } from "@/lib/weeks";
import { ChangeText, GradeBadge, LevelPill, Loading, formatDate } from "./format";
import { TargetsGrid } from "./TargetsGrid";

export function WeeklyView({ userId }: { userId: string }) {
  const { entries, bodyFat, loadError } = useWeightEntries(userId);
  const { heightCm, loaded: heightLoaded } = useHeight(userId);
  if (!entries || !heightLoaded) return <Loading error={loadError} />;

  // A finished week's targets use its average weight, plus the body fat and BMI at the end of that week.
  const weeks = buildWeeks(entries, todayISO(), (avg, wk) =>
    computePlan(userId, avg, { heightCm, bodyFat, asOf: wk.end }).targets,
  ).reverse();
  const limits = planFor(userId).bodyFatLimits;
  const refWeight = weeks.find((w) => w.average !== null)?.average ?? null;
  const approxKg = (fromPct: number, toPct: number) =>
    refWeight
      ? ` (about ${((refWeight * fromPct) / 100).toFixed(1)} to ${((refWeight * toPct) / 100).toFixed(1)} kg at ${refWeight.toFixed(0)} kg)`
      : "";

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
        weeks.map((w) => {
          const avgBmi = w.average !== null && heightCm ? bmiOf(w.average, heightCm) : null;
          const avgFat = average(valuesBetween(bodyFat, w.start, w.end));
          const avgFatRounded = avgFat === null ? null : Math.round(avgFat * 10) / 10;
          return (
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
              {avgBmi !== null && (
                <div>
                  <div className="label">Avg BMI</div>
                  <span className="stat-inline">{avgBmi.toFixed(1)}</span> <LevelPill level={bmiLevel(avgBmi)} />
                </div>
              )}
              {avgFatRounded !== null && (
                <div>
                  <div className="label">Avg body fat</div>
                  <span className="stat-inline">{avgFatRounded.toFixed(1)}%</span> <LevelPill level={bodyFatLevel(avgFatRounded, limits)} />
                </div>
              )}
              <div>
                <div className="label">Change vs previous week</div>
                <ChangeText change={w.change} base={w.change !== null && w.average !== null ? w.average - w.change : null} />
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
          );
        })
      )}

      <h2>Grading</h2>
      <table>
        <tbody>
          <tr><td><GradeBadge grade="A" /></td><td>Average dropped 0.5 – 1.0% of body weight{approxKg(0.5, 1)}</td></tr>
          <tr><td><GradeBadge grade="B" /></td><td>Dropped 0.25 – 0.5%, or more than 1.0% (too fast)</td></tr>
          <tr><td><GradeBadge grade="C" /></td><td>Dropped less than 0.25%, or no change</td></tr>
          <tr><td><GradeBadge grade="D" /></td><td>Average increased</td></tr>
        </tbody>
      </table>
    </>
  );
}
