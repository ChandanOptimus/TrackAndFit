import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
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
      SELECT to_char(day, 'YYYY-MM-DD') AS day, kg::float8 AS kg
      FROM weights WHERE user_id = ${user.id} ORDER BY day`) as { day: string; kg: number }[];
    const entries = Object.fromEntries(rows.map((r) => [r.day, r.kg]));
    return NextResponse.json({ entries }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  const user = await resolveUser(ctx);
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { date?: unknown; kg?: unknown } | null;
  const kg = Number(body?.kg);
  if (!isRealDate(body?.date) || !Number.isFinite(kg) || kg < MIN_KG || kg > MAX_KG) {
    return NextResponse.json({ error: "Invalid date or weight" }, { status: 400 });
  }

  try {
    const sql = await getDb();
    await sql`
      INSERT INTO weights (user_id, day, kg) VALUES (${user.id}, ${body.date}::date, ${kg})
      ON CONFLICT (user_id, day) DO UPDATE SET kg = EXCLUDED.kg`;
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
