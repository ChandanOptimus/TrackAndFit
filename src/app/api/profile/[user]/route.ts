import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { MAX_HEIGHT_CM, MIN_HEIGHT_CM } from "@/lib/health";
import { getUser } from "@/lib/users";
import { serverError } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ user: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = getUser((await ctx.params).user);
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });
  try {
    const sql = await getDb();
    const rows = (await sql`SELECT height_cm::float8 AS height_cm FROM profiles WHERE user_id = ${user.id}`) as {
      height_cm: number | null;
    }[];
    return NextResponse.json({ heightCm: rows[0]?.height_cm ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  const user = getUser((await ctx.params).user);
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { heightCm?: unknown } | null;
  const heightCm = Math.round(Number(body?.heightCm) * 10) / 10;
  if (!Number.isFinite(heightCm) || heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) {
    return NextResponse.json({ error: `Height must be between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM} cm.` }, { status: 400 });
  }

  try {
    const sql = await getDb();
    await sql`
      INSERT INTO profiles (user_id, height_cm) VALUES (${user.id}, ${heightCm})
      ON CONFLICT (user_id) DO UPDATE SET height_cm = EXCLUDED.height_cm`;
    return NextResponse.json({ heightCm });
  } catch (err) {
    return serverError(err);
  }
}
