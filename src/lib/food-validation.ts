import { GRAMS, type CustomNutrition, type FoodUnit } from "./nutrition";

export interface FoodInput {
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fibre: number;
  waterMl: number;
  units: FoodUnit[];
}

const NUMERIC: { key: "kcal" | "protein" | "fat" | "carbs" | "fibre" | "waterMl"; label: string; max: number }[] = [
  { key: "kcal", label: "Calories", max: 1000 },
  { key: "protein", label: "Protein", max: 100 },
  { key: "fat", label: "Fat", max: 100 },
  { key: "carbs", label: "Carbs", max: 100 },
  { key: "fibre", label: "Fibre", max: 100 },
  { key: "waterMl", label: "Water", max: 100 },
];

/** Validates a food from a request body. Returns the cleaned food, or an error message. */
export function parseFoodInput(body: unknown): FoodInput | string {
  if (!body || typeof body !== "object") return "Invalid food";
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name || name.length > 80) return "Enter a food name (up to 80 characters).";

  const out: Partial<FoodInput> = { name };
  for (const { key, label, max } of NUMERIC) {
    const raw = b[key] === "" || b[key] === undefined || b[key] === null ? 0 : Number(b[key]);
    if (!Number.isFinite(raw) || raw < 0 || raw > max) return `${label} must be between 0 and ${max} per 100 g.`;
    out[key] = raw;
  }

  const unitsRaw = Array.isArray(b.units) ? b.units : [];
  if (unitsRaw.length > 8) return "Use at most 8 units.";
  const units: FoodUnit[] = [];
  for (const u of unitsRaw as Record<string, unknown>[]) {
    const label = typeof u?.label === "string" ? u.label.trim() : "";
    const grams = Number(u?.grams);
    if (!label || label.length > 30) return "Each unit needs a name (up to 30 characters).";
    if (label.toLowerCase() === GRAMS) return `"${GRAMS}" is built in, use another unit name.`;
    if (!Number.isFinite(grams) || grams <= 0 || grams > 5000) return `"${label}" needs a weight between 0 and 5000 g.`;
    if (units.some((x) => x.label.toLowerCase() === label.toLowerCase())) return `Unit "${label}" is listed twice.`;
    units.push({ label, grams });
  }
  out.units = units;
  return out as FoodInput;
}

/** Validates a manual "Others" entry from a request body. Returns the cleaned values, or an error message. */
export function parseCustomNutrition(body: unknown): CustomNutrition | string {
  if (!body || typeof body !== "object") return "Invalid entry";
  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 80) : "";
  const out = { name: name || "Other", kcal: 0, protein: 0, fat: 0, carbs: 0, fibre: 0 };
  const fields = [
    { key: "kcal", label: "Calories", max: 10000 },
    { key: "protein", label: "Protein", max: 1000 },
    { key: "fat", label: "Fat", max: 1000 },
    { key: "carbs", label: "Carbs", max: 2000 },
    { key: "fibre", label: "Fibre", max: 500 },
  ] as const;
  for (const { key, label, max } of fields) {
    const raw = b[key] === "" || b[key] === undefined || b[key] === null ? 0 : Number(b[key]);
    if (!Number.isFinite(raw) || raw < 0 || raw > max) return `${label} must be between 0 and ${max}.`;
    out[key] = Math.round(raw * 100) / 100;
  }
  return out;
}
