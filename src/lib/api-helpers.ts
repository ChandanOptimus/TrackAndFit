import { NextResponse } from "next/server";
import type { Food } from "./nutrition";

export interface FoodRow {
  id: number;
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fibre: number;
  water_ml: number;
  units: { label: string; grams: number }[];
}

export function rowToFood(r: FoodRow): Food {
  return {
    id: r.id,
    name: r.name,
    kcal: r.kcal,
    protein: r.protein,
    fat: r.fat,
    carbs: r.carbs,
    fibre: r.fibre,
    waterMl: r.water_ml,
    units: r.units ?? [],
  };
}

export function isRealDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function pgCode(err: unknown): string | undefined {
  return (err as { code?: string } | null)?.code;
}

export function serverError(err: unknown) {
  console.error(err);
  return NextResponse.json({ error: "Database error" }, { status: 500 });
}
