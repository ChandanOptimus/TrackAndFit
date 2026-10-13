export interface FoodUnit {
  label: string; // e.g. "chapati", "tsp"
  grams: number; // grams (or ml) in one of this unit
}

/** Nutrition is stored per 100 g (or 100 ml for liquids). */
export interface Food {
  id: number;
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fibre: number;
  waterMl: number; // water counted towards the daily water target, per 100 g
  units: FoodUnit[];
}

/** Nutrition typed in by hand for one "Others" entry (totals for what was eaten, not per 100 g). */
export interface CustomNutrition {
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fibre: number;
}

export interface LogEntry {
  id: number;
  foodId: number | null; // null for a manual "Others" entry
  amount: number;
  unit: string; // "g" or one of the food's unit labels
  grams: number; // grams at the time it was logged
  custom?: CustomNutrition | null; // set for manual entries
}

/** The food-list choice that lets you type nutrition in manually. It isn't stored in the library. */
export const OTHERS_LABEL = "Others (enter manually)";

export interface Nutrients {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fibre: number;
  waterMl: number;
}

export const GRAMS = "g";

export const ZERO_NUTRIENTS: Nutrients = { kcal: 0, protein: 0, fat: 0, carbs: 0, fibre: 0, waterMl: 0 };

/** Grams for `amount` of `unit`, or null if the food has no such unit. */
export function gramsFor(food: Pick<Food, "units">, amount: number, unit: string): number | null {
  if (unit === GRAMS) return amount;
  const u = food.units.find((x) => x.label === unit);
  return u ? amount * u.grams : null;
}

export function nutrientsFor(food: Food, grams: number): Nutrients {
  const f = grams / 100;
  return {
    kcal: food.kcal * f,
    protein: food.protein * f,
    fat: food.fat * f,
    carbs: food.carbs * f,
    fibre: food.fibre * f,
    waterMl: food.waterMl * f,
  };
}

export function sumNutrients(list: Nutrients[]): Nutrients {
  return list.reduce(
    (t, n) => ({
      kcal: t.kcal + n.kcal,
      protein: t.protein + n.protein,
      fat: t.fat + n.fat,
      carbs: t.carbs + n.carbs,
      fibre: t.fibre + n.fibre,
      waterMl: t.waterMl + n.waterMl,
    }),
    ZERO_NUTRIENTS,
  );
}

/** Nutrition of one log entry, or null if its food no longer exists. */
export function entryNutrients(e: LogEntry, byId: Map<number, Food>): Nutrients | null {
  if (e.custom) {
    const { kcal, protein, fat, carbs, fibre } = e.custom;
    return { kcal, protein, fat, carbs, fibre, waterMl: 0 };
  }
  const food = e.foodId === null ? undefined : byId.get(e.foodId);
  return food ? nutrientsFor(food, e.grams) : null;
}

/** Totals for a day's log. Entries whose food no longer exists are skipped. */
export function totalsFor(log: LogEntry[], foods: Food[]): Nutrients {
  const byId = new Map(foods.map((f) => [f.id, f]));
  return sumNutrients(log.flatMap((e) => entryNutrients(e, byId) ?? []));
}

/** "1 chapati", "40 g" */
export function describeAmount(amount: number, unit: string): string {
  const n = Math.round(amount * 100) / 100;
  return unit === GRAMS ? `${n} g` : `${n} ${unit}`;
}
