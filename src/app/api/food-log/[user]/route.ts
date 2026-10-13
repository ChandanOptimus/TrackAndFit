import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/users";
import { parseCustomNutrition } from "@/lib/food-validation";
import { gramsFor, isMealId, type CustomNutrition, type MealId } from "@/lib/nutrition";
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
      SELECT id, food_id AS "foodId", amount::float8 AS amount, unit, grams::float8 AS grams, custom, category
      FROM food_log WHERE user_id = ${user.id} AND day = ${date}::date ORDER BY id`;
    return NextResponse.json({ entries }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return serverError(err);
  }
}

type Parsed =
  | { error: string; status: number }
  | {
      error?: undefined;
      foodId: number | null;
      amount: number;
      unit: string;
      grams: number;
      custom: CustomNutrition | null;
      category: MealId | null;
    };

/** Validates the body of an add/edit request and works out the grams. Shared by POST and PUT. */
async function parseEntry(body: Record<string, unknown> | null): Promise<Parsed> {
  let category: MealId | null = null;
  if (body?.category !== undefined && body.category !== null && body.category !== "") {
    if (!isMealId(body.category)) return { error: "Invalid meal", status: 400 };
    category = body.category;
  }

  // Manual "Others" entry: nutrition typed in by hand, no food from the library.
  if (body?.custom !== undefined) {
    const custom = parseCustomNutrition(body.custom);
    if (typeof custom === "string") return { error: custom, status: 400 };
    return { foodId: null, amount: 1, unit: "serving", grams: 0, custom, category };
  }

  const foodId = Number(body?.foodId);
  const amount = Number(body?.amount);
  const unit = typeof body?.unit === "string" ? body.unit : "";
  if (!Number.isInteger(foodId) || !(amount > 0) || amount > 10000 || !unit) {
    return { error: "Invalid food or amount", status: 400 };
  }

  const sql = await getDb();
  const found = (await sql`
    SELECT id, name, kcal::float8 AS kcal, protein::float8 AS protein, fat::float8 AS fat,
           carbs::float8 AS carbs, fibre::float8 AS fibre, water_ml::float8 AS water_ml, units
    FROM foods WHERE id = ${foodId}`) as FoodRow[];
  if (found.length === 0) return { error: "Food not found", status: 404 };

  const food = rowToFood(found[0]);
  const grams = gramsFor(food, amount, unit);
  if (grams === null || grams > 20000) return { error: `${food.name} has no unit "${unit}".`, status: 400 };
  return { foodId, amount, unit, grams: Math.round(grams * 100) / 100, custom: null, category };
}

export async function POST(req: Request, ctx: Ctx) {
  const user = await resolveUser(ctx);
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const date = body?.date;
  if (!isRealDate(date)) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  try {
    const parsed = await parseEntry(body);
    if (parsed.error !== undefined) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    const { foodId, amount, unit, grams, custom, category } = parsed;

    const sql = await getDb();
    const rows = (await sql`
      INSERT INTO food_log (user_id, day, food_id, amount, unit, grams, custom, category)
      VALUES (${user.id}, ${date}::date, ${foodId}, ${amount}, ${unit}, ${grams},
              ${custom ? JSON.stringify(custom) : null}::jsonb, ${category})
      RETURNING id`) as { id: number }[];
    return NextResponse.json({ entry: { id: rows[0].id, foodId, amount, unit, grams, custom, category } }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}

/** Edits an existing entry (?id=). The day it was logged on doesn't change. */
export async function PUT(req: Request, ctx: Ctx) {
  const user = await resolveUser(ctx);
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  try {
    const parsed = await parseEntry(body);
    if (parsed.error !== undefined) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    const { foodId, amount, unit, grams, custom, category } = parsed;

    const sql = await getDb();
    const rows = (await sql`
      UPDATE food_log
      SET food_id = ${foodId}, amount = ${amount}, unit = ${unit}, grams = ${grams},
          custom = ${custom ? JSON.stringify(custom) : null}::jsonb, category = ${category}
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id`) as { id: number }[];
    if (rows.length === 0) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    return NextResponse.json({ entry: { id, foodId, amount, unit, grams, custom, category } });
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
