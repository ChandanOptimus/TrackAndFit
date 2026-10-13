export interface Targets {
  calories: number; // kcal
  protein: number; // g
  fat: number; // g
  fibre: number; // g
  carbs: number; // kcal left after protein and fat, so protein + fat + carbs add up to the calorie target
  water: number; // litres
}

/** Estimated maintenance calories per kg of body weight. */
export const MAINTENANCE_KCAL_PER_KG = 26;

/** `calories` defaults to maintenance. The diet plan passes in a lower target (see plan.ts). */
export function calculateTargets(bodyWeight: number, calories = bodyWeight * MAINTENANCE_KCAL_PER_KG): Targets {
  const protein = bodyWeight * 2;
  const fat = calories / 30;
  const fibre = calories * 0.014;
  const carbs = Math.max(0, calories - protein * 4 - fat * 9); // protein is 4 kcal/g, fat 9 kcal/g
  const water = bodyWeight / 30;
  return { calories, protein, fat, fibre, carbs, water };
}

export const TARGET_META: {
  key: keyof Targets;
  label: string;
  unit: string;
  decimals: number;
}[] = [
  { key: "calories", label: "Calories", unit: "kcal", decimals: 0 },
  { key: "protein", label: "Protein", unit: "g", decimals: 0 },
  { key: "fat", label: "Fat", unit: "g", decimals: 1 },
  { key: "fibre", label: "Fibre", unit: "g", decimals: 1 },
  { key: "carbs", label: "Carbs", unit: "kcal", decimals: 0 },
  { key: "water", label: "Water", unit: "L", decimals: 1 },
];
