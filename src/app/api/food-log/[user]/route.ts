import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/users";
import { parseCustomNutrition } from "@/lib/food-validation";
import { gramsFor, type Food } from "@/lib/nutrition";
import { isRealDate, rowToFood, serverError, type FoodRow } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ user: string }> };

async function resolveUser(ctx: Ctx) {
  return getUser((await ctx.params).user);
}

export async function GET(req: Request, ctx: Ctx) {
  const user = await resolveUser(ctx);
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });
  const date = new URL(req.url).searchParams.get("date");
  if (!isRealDate(date)) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  try {
    const sql = await getDb();
    const entries = await sql`
      SELECT id, food_id AS "foodId", amount::float8 AS amount, unit, grams::float8 AS grams, custom
      FROM food_log WHERE user_id = ${user.id} AND day = ${date}::date ORDER BY id`;
    return NextResponse.json({ entries }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: Request, ctx: Ctx) {
  const user = await resolveUser(ctx);
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as
    | { date?: unknown; foodId?: unknown; amount?: unknown; unit?: unknown; custom?: unknown }
    | null;

  // Manual "Others" entry: nutrition typed in by hand, no food from the library.
  if (body?.custom !== undefined) {
    const custom = parseCustomNutrition(body.custom);
    if (typeof custom === "string") return NextResponse.json({ error: custom }, { status: 400 });
    if (!isRealDate(body.date)) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    try {
      const sql = await getDb();
      const rows = (await sql`
        INSERT INTO food_log (user_id, day, food_id, amount, unit, grams, custom)
        VALUES (${user.id}, ${body.date}::date, NULL, 1, 'serving', 0, ${JSON.stringify(custom)}::jsonb)
        RETURNING id`) as { id: number }[];
      return NextResponse.json(
        { entry: { id: rows[0].id, foodId: null, amount: 1, unit: "serving", grams: 0, custom } },
        { status: 201 },
      );
    } catch (err) {
      return serverError(err);
    }
  }

  const foodId = Number(body?.foodId);
  const amount = Number(body?.amount);
  const unit = typeof body?.unit === "string" ? body.unit : "";
  if (!isRealDate(body?.date) || !Number.isInteger(foodId) || !(amount > 0) || amount > 10000 || !unit) {
    return NextResponse.json({ error: "Invalid food, amount or date" }, { status: 400 });
  }

  try {
    const sql = await getDb();
    const found = (await sql`
      SELECT id, name, kcal::float8 AS kcal, protein::float8 AS protein, fat::float8 AS fat,
             carbs::float8 AS carbs, fibre::float8 AS fibre, water_ml::float8 AS water_ml, units
      FROM foods WHERE id = ${foodId}`) as FoodRow[];
    if (found.length === 0) return NextResponse.json({ error: "Food not found" }, { status: 404 });

    const food: Food = rowToFood(found[0]);
    const grams = gramsFor(food, amount, unit);
    if (grams === null || grams > 20000) {
      return NextResponse.json({ error: `${food.name} has no unit "${unit}".` }, { status: 400 });
    }

    const rounded = Math.round(grams * 100) / 100;
    const rows = (await sql`
      INSERT INTO food_log (user_id, day, food_id, amount, unit, grams)
      VALUES (${user.id}, ${body!.date as string}::date, ${foodId}, ${amount}, ${unit}, ${rounded})
      RETURNING id`) as { id: number }[];
    return NextResponse.json({ entry: { id: rows[0].id, foodId, amount, unit, grams: rounded } }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const user = await resolveUser(ctx);
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const sql = await getDb();
    await sql`DELETE FROM food_log WHERE id = ${id} AND user_id = ${user.id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}
