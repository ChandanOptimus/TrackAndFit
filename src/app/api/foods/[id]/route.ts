import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { parseFoodInput } from "@/lib/food-validation";
import { pgCode, serverError } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

async function parseId(ctx: Ctx): Promise<number | null> {
  const id = Number((await ctx.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(req: Request, ctx: Ctx) {
  const id = await parseId(ctx);
  if (id === null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const input = parseFoodInput(await req.json().catch(() => null));
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });

  try {
    const sql = await getDb();
    const rows = (await sql`
      UPDATE foods SET name = ${input.name}, kcal = ${input.kcal}, protein = ${input.protein}, fat = ${input.fat},
        carbs = ${input.carbs}, fibre = ${input.fibre}, water_ml = ${input.waterMl},
        units = ${JSON.stringify(input.units)}::jsonb
      WHERE id = ${id} RETURNING id`) as { id: number }[];
    if (rows.length === 0) return NextResponse.json({ error: "Food not found" }, { status: 404 });
    return NextResponse.json({ food: { id, ...input } });
  } catch (err) {
    if (pgCode(err) === "23505") return NextResponse.json({ error: "A food with that name already exists." }, { status: 409 });
    return serverError(err);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const id = await parseId(ctx);
  if (id === null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const sql = await getDb();
    await sql`DELETE FROM foods WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (pgCode(err) === "23503" || pgCode(err) === "23001") { // foreign_key_violation / restrict_violation
      return NextResponse.json({ error: "This food is used in a food log, so it can't be deleted." }, { status: 409 });
    }
    return serverError(err);
  }
}
