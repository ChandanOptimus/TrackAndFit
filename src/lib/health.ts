export type Level = "low" | "standard" | "high" | "toohigh";

export const LEVEL_LABEL: Record<Level, string> = {
  low: "Low",
  standard: "Standard",
  high: "High",
  toohigh: "Too high",
};

/** Below `low` is Low, below `standard` is Standard, below `high` is High, anything above is Too high. */
export interface Limits {
  low: number;
  standard: number;
  high: number;
}

export const BMI_LIMITS: Limits = { low: 18.5, standard: 25, high: 30 };
// "Low" is below 11 (the message said "1q", read as 11). Change it here if it should be another number.
export const BODY_FAT_LIMITS: Limits = { low: 11, standard: 22, high: 27 };

export function levelFor(value: number, limits: Limits): Level {
  if (value < limits.low) return "low";
  if (value < limits.standard) return "standard";
  if (value < limits.high) return "high";
  return "toohigh";
}

/** BMI rounded to 1 decimal, so the number shown and its category always agree. */
export function bmiOf(kg: number, heightCm: number): number {
  const m = heightCm / 100;
  return Math.round((kg / (m * m)) * 10) / 10;
}

export function bmiLevel(bmi: number): Level {
  return levelFor(bmi, BMI_LIMITS);
}

/** `limits` can be personal (women's body fat runs higher), see plan.ts. */
export function bodyFatLevel(percent: number, limits: Limits = BODY_FAT_LIMITS): Level {
  return levelFor(percent, limits);
}

export function average(values: number[]): number | null {
  return values.length ? values.reduce((s, v) => s + v, 0) / values.length : null;
}

/** Values of a { "YYYY-MM-DD": number } map whose date falls in [start, end]. */
export function valuesBetween(map: Record<string, number>, start: string, end: string): number[] {
  return Object.keys(map)
    .filter((d) => d >= start && d <= end)
    .map((d) => map[d]);
}

export const MIN_HEIGHT_CM = 100;
export const MAX_HEIGHT_CM = 250;
export const MIN_BODY_FAT = 2;
export const MAX_BODY_FAT = 60;
