import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { parseFoodInput } from "@/lib/food-validation";
import { pgCode, rowToFood, serverError, type FoodRow } from "@/lib/api-helpers";

export async function GET() {
  try {
    const sql = await getDb();
    const rows = (await sql`
      SELECT id, name, kcal::float8 AS kcal, protein::float8 AS protein, fat::float8 AS fat,
             carbs::float8 AS carbs, fibre::float8 AS fibre, water_ml::float8 AS water_ml, units
      FROM foods ORDER BY lower(name)`) as FoodRow[];
    return NextResponse.json({ foods: rows.map(rowToFood) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: Request) {
  const input = parseFoodInput(await req.json().catch(() => null));
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });

  try {
    const sql = await getDb();
    const rows = (await sql`
      INSERT INTO foods (name, kcal, protein, fat, carbs, fibre, water_ml, units)
      VALUES (${input.name}, ${input.kcal}, ${input.protein}, ${input.fat}, ${input.carbs}, ${input.fibre},
              ${input.waterMl}, ${JSON.stringify(input.units)}::jsonb)
      RETURNING id`) as { id: number }[];
    return NextResponse.json({ food: { id: rows[0].id, ...input } }, { status: 201 });
  } catch (err) {
    if (pgCode(err) === "23505") return NextResponse.json({ error: "A food with that name already exists." }, { status: 409 });
    return serverError(err);
  }
}
