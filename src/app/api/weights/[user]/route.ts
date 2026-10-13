import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { MAX_BODY_FAT, MIN_BODY_FAT } from "@/lib/health";
import { getUser } from "@/lib/users";

type Ctx = { params: Promise<{ user: string }> };

const MIN_KG = 20;
const MAX_KG = 400;

function isRealDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

async function resolveUser(ctx: Ctx) {
  const { user } = await ctx.params;
  return getUser(user);
}

function serverError(err: unknown) {
  console.error(err);
  return NextResponse.json({ error: "Database error" }, { status: 500 });
}

export async function GET(_req: Request, ctx: Ctx) {
  const user = await resolveUser(ctx);
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });
  try {
    const sql = await getDb();
    const rows = (await sql`
      SELECT to_char(day, 'YYYY-MM-DD') AS day, kg::float8 AS kg, body_fat::float8 AS body_fat
      FROM weights WHERE user_id = ${user.id} ORDER BY day`) as { day: string; kg: number; body_fat: number | null }[];
    const entries = Object.fromEntries(rows.map((r) => [r.day, r.kg]));
    const bodyFat = Object.fromEntries(rows.filter((r) => r.body_fat !== null).map((r) => [r.day, r.body_fat]));
    return NextResponse.json({ entries, bodyFat }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  const user = await resolveUser(ctx);
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { date?: unknown; kg?: unknown; bodyFat?: unknown } | null;
  const kg = Number(body?.kg);
  if (!isRealDate(body?.date) || !Number.isFinite(kg) || kg < MIN_KG || kg > MAX_KG) {
    return NextResponse.json({ error: "Invalid date or weight" }, { status: 400 });
  }
  // Body fat is optional. Saving without it clears any earlier value for that date (an entry is replaced as a whole).
  let bodyFat: number | null = null;
  if (body?.bodyFat !== undefined && body.bodyFat !== null && body.bodyFat !== "") {
    bodyFat = Math.round(Number(body.bodyFat) * 10) / 10;
    if (!Number.isFinite(bodyFat) || bodyFat < MIN_BODY_FAT || bodyFat > MAX_BODY_FAT) {
      return NextResponse.json({ error: `Body fat must be between ${MIN_BODY_FAT} and ${MAX_BODY_FAT}%.` }, { status: 400 });
    }
  }

  try {
    const sql = await getDb();
    await sql`
      INSERT INTO weights (user_id, day, kg, body_fat) VALUES (${user.id}, ${body.date}::date, ${kg}, ${bodyFat})
      ON CONFLICT (user_id, day) DO UPDATE SET kg = EXCLUDED.kg, body_fat = EXCLUDED.body_fat`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const user = await resolveUser(ctx);
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });

  const date = new URL(req.url).searchParams.get("date");
  if (!isRealDate(date)) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  try {
    const sql = await getDb();
    await sql`DELETE FROM weights WHERE user_id = ${user.id} AND day = ${date}::date`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}
