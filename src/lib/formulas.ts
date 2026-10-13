export interface Targets {
  calories: number; // kcal
  protein: number; // g
  fat: number; // g
  fibre: number; // g
  carbs: number; // kcal (Calories - protein * 4, exactly as specified)
  water: number; // litres
}

export function calculateTargets(bodyWeight: number): Targets {
  const calories = bodyWeight * 26;
  const protein = bodyWeight * 2;
  const fat = calories / 30;
  const fibre = calories * 0.014;
  const carbs = calories - protein * 4;
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
