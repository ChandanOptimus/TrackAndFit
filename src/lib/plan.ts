import { MAINTENANCE_KCAL_PER_KG, calculateTargets, type Targets } from "./formulas";
import { BODY_FAT_LIMITS, bmiOf, type Limits } from "./health";
import { daysBetween } from "./weeks";

/**
 * Each person's calorie plan: maintenance (weight x 26) minus a deficit that shrinks as they get leaner,
 * so the diet never pushes them too thin.
 */
export interface Plan {
  fullDeficit: number; // kcal below maintenance while comfortably above the lean limits
  calorieFloor: number; // never go below this (but never above maintenance either)
  bodyFatStop: number; // below this body fat %: no deficit, eat at maintenance
  bodyFatTaper: number; // below this body fat %: half the deficit
  bmiStop: number;
  bmiTaper: number;
  bodyFatLimits: Limits; // body fat labels (Low / Standard / High / Too high)
}

export const PLANS: Record<string, Plan> = {
  chandan: {
    fullDeficit: 500,
    calorieFloor: 1500,
    bodyFatStop: 11,
    bodyFatTaper: 14,
    bmiStop: 18.5,
    bmiTaper: 20.5,
    bodyFatLimits: BODY_FAT_LIMITS,
  },
  // Women carry about 7 points more body fat than men at every level (ACE ranges), so her limits are Chandan's + 7.
  ankita: {
    fullDeficit: 300,
    calorieFloor: 1200,
    bodyFatStop: 18,
    bodyFatTaper: 21,
    bmiStop: 18.5,
    bmiTaper: 20.5,
    bodyFatLimits: { low: 18, standard: 29, high: 34 },
  },
};

export function planFor(userId: string): Plan {
  return PLANS[userId] ?? PLANS.chandan;
}

/** A body fat reading only counts towards the guard if it is this recent. */
export const RECENT_DAYS = 14;

export type GuardBasis = "bodyFat" | "bmi" | "none";

export interface Guard {
  factor: 0 | 0.5 | 1; // share of the full deficit that is applied
  basis: GuardBasis; // which reading decided it
}

function factorFor(value: number, stop: number, taper: number): 0 | 0.5 | 1 {
  if (value < stop) return 0;
  if (value < taper) return 0.5;
  return 1;
}

/** The more cautious of body fat and BMI wins. With no readings at all the full deficit applies. */
export function guardFor(plan: Plan, readings: { bmi: number | null; bodyFat: number | null }): Guard {
  const candidates: Guard[] = [];
  if (readings.bodyFat !== null) {
    candidates.push({ factor: factorFor(readings.bodyFat, plan.bodyFatStop, plan.bodyFatTaper), basis: "bodyFat" });
  }
  if (readings.bmi !== null) {
    candidates.push({ factor: factorFor(readings.bmi, plan.bmiStop, plan.bmiTaper), basis: "bmi" });
  }
  if (candidates.length === 0) return { factor: 1, basis: "none" };
  return candidates.reduce((best, c) => (c.factor < best.factor ? c : best));
}

/** Latest value of a { "YYYY-MM-DD": number } map on or before `asOf`, no older than `maxDays`. */
export function recentValue(map: Record<string, number>, asOf: string, maxDays = RECENT_DAYS): number | null {
  const date = Object.keys(map)
    .filter((d) => d <= asOf && daysBetween(d, asOf) <= maxDays)
    .sort()
    .pop();
  return date === undefined ? null : map[date];
}

export interface PlanResult {
  targets: Targets;
  maintenance: number;
  deficit: number; // kcal actually taken off maintenance
  guard: Guard;
  floored: boolean; // true when the calorie floor raised the target
}

export function computePlan(
  userId: string,
  weightKg: number,
  context: { heightCm: number | null; bodyFat: Record<string, number>; asOf: string },
): PlanResult {
  const plan = planFor(userId);
  const bmi = context.heightCm ? bmiOf(weightKg, context.heightCm) : null;
  const guard = guardFor(plan, { bmi, bodyFat: recentValue(context.bodyFat, context.asOf) });

  const maintenance = weightKg * MAINTENANCE_KCAL_PER_KG;
  const wanted = maintenance - plan.fullDeficit * guard.factor;
  const floor = Math.min(plan.calorieFloor, maintenance); // the floor never lifts calories above maintenance
  const calories = Math.max(wanted, floor);

  return {
    targets: calculateTargets(weightKg, calories),
    maintenance,
    deficit: maintenance - calories,
    guard,
    floored: wanted < floor,
  };
}

/** One sentence for the dashboard explaining why the deficit is what it is. */
export function describePlan(result: PlanResult, userId: string): string {
  const plan = planFor(userId);
  const what = result.guard.basis === "bodyFat" ? "body fat" : "BMI";
  if (result.floored) return `Raised to your minimum of ${plan.calorieFloor} kcal.`;
  switch (result.guard.factor) {
    case 0:
      return `No deficit: your ${what} is below its lower limit, so you eat at maintenance.`;
    case 0.5:
      return `Half deficit: your ${what} is close to its lower limit.`;
    default:
      return result.guard.basis === "none"
        ? "Full deficit. Add your height or a body fat reading to turn on the safety guard."
        : `Full deficit (${Math.round(result.deficit)} kcal below maintenance).`;
  }
}
