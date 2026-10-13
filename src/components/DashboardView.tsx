"use client";

import Link from "next/link";
import { calculateTargets } from "@/lib/formulas";
import { useFoodLog, useFoods } from "@/lib/food-store";
import { totalsFor } from "@/lib/nutrition";
import { useWeightEntries } from "@/lib/storage";
import { getUser } from "@/lib/users";
import { buildWeeks, todayISO } from "@/lib/weeks";
import { ChangeText, GradeBadge, Loading, formatDate } from "./format";
import { IntakeSummary } from "./IntakeSummary";
import { TargetsGrid } from "./TargetsGrid";

export function DashboardView({ userId }: { userId: string }) {
  const user = getUser(userId);
  const { entries, loadError } = useWeightEntries(userId);
  const today = todayISO();
  const { foods, loadError: foodsError } = useFoods();
  const { entries: foodLog, loadError: foodLogError } = useFoodLog(userId, today);

  if (!entries) return <Loading error={loadError} />;

  const dates = Object.keys(entries).sort();
  const latestDate = dates[dates.length - 1];
  const latestWeight = latestDate ? entries[latestDate] : null;

  const completed = buildWeeks(entries, today).filter((w) => w.complete && w.average !== null);
  const lastWeek = completed[completed.length - 1];

  return (
    <>
      <h1>Hi {user?.name} 👋</h1>

      {latestWeight === null ? (
        <section className="panel">
          <p>No weight logged yet. Add your first entry to see your daily targets.</p>
          <Link className="button" href={`/${userId}/weight`}>
            Log weight
          </Link>
        </section>
      ) : (
        <>
          <section className="hero">
            <div className="label">Current weight</div>
            <p className="big">
              {latestWeight.toFixed(1)} <small>kg</small>
            </p>
            <div className="hero-sub">Logged {formatDate(latestDate)}</div>
          </section>

          <section>
            <h2>Daily targets</h2>
            <p className="muted">Based on your latest weight.</p>
            <TargetsGrid targets={calculateTargets(latestWeight)} />
          </section>

          <section>
            <h2>Today&apos;s progress</h2>
            {foods && foodLog ? (
              <>
                <p className="muted">
                  What you&apos;ve eaten today against your targets.{" "}
                  <Link href={`/${userId}/food`}>{foodLog.length ? "Log more food →" : "Log your food →"}</Link>
                </p>
                <IntakeSummary totals={totalsFor(foodLog, foods)} targets={calculateTargets(latestWeight)} />
              </>
            ) : (
              <Loading error={foodsError || foodLogError} />
            )}
          </section>
        </>
      )}

      {lastWeek && (
        <section>
          <h2>Last completed week</h2>
          <div className="panel row">
            <div>
              <div className="label">Week {lastWeek.index + 1}</div>
              <div className="muted">
                {formatDate(lastWeek.start)} – {formatDate(lastWeek.end)}
              </div>
            </div>
            <div>
              <div className="label">Average</div>
              {lastWeek.average!.toFixed(2)} kg
            </div>
            <div>
              <div className="label">Change</div>
              <ChangeText change={lastWeek.change} />
            </div>
            <div>
              <div className="label">Grade</div>
              <GradeBadge grade={lastWeek.grade} />
            </div>
            <Link href={`/${userId}/weekly`}>Full report →</Link>
          </div>
        </section>
      )}
    </>
  );
}
