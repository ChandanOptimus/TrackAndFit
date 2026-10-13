import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { SEED_FOODS } from "./seed-foods";

type Sql = NeonQueryFunction<false, false>;

let ready: Promise<Sql> | undefined;

async function setup(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS weights (
      user_id text NOT NULL,
      day date NOT NULL,
      kg numeric(5, 2) NOT NULL,
      PRIMARY KEY (user_id, day)
    )`;

  // Seed the starter foods only when the table is created for the first time,
  // so foods you delete later don't come back.
  const existed = ((await sql`SELECT to_regclass('public.foods') AS t`) as { t: string | null }[])[0].t !== null;
  await sql`
    CREATE TABLE IF NOT EXISTS foods (
      id serial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      kcal numeric(7, 2) NOT NULL,
      protein numeric(6, 2) NOT NULL,
      fat numeric(6, 2) NOT NULL,
      carbs numeric(6, 2) NOT NULL,
      fibre numeric(6, 2) NOT NULL,
      water_ml numeric(6, 2) NOT NULL DEFAULT 0,
      units jsonb NOT NULL DEFAULT '[]'
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS food_log (
      id serial PRIMARY KEY,
      user_id text NOT NULL,
      day date NOT NULL,
      food_id integer REFERENCES foods(id) ON DELETE RESTRICT,
      amount numeric(8, 2) NOT NULL,
      unit text NOT NULL,
      grams numeric(8, 2) NOT NULL,
      custom jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
  // Manual "Others" entries have no food. These are safe to repeat on tables that already exist.
  await sql`ALTER TABLE food_log ALTER COLUMN food_id DROP NOT NULL`;
  await sql`ALTER TABLE food_log ADD COLUMN IF NOT EXISTS custom jsonb`;
  await sql`CREATE INDEX IF NOT EXISTS food_log_user_day ON food_log (user_id, day)`;

  if (!existed) {
    await sql.transaction(
      SEED_FOODS.map(
        (f) => sql`
          INSERT INTO foods (name, kcal, protein, fat, carbs, fibre, water_ml, units)
          VALUES (${f.name}, ${f.kcal}, ${f.protein}, ${f.fat}, ${f.carbs}, ${f.fibre}, ${f.waterMl ?? 0},
                  ${JSON.stringify(f.units ?? [])}::jsonb)
          ON CONFLICT (name) DO NOTHING`,
      ),
    );
  }
}

/** Neon SQL client; creates the tables on first use. Needs DATABASE_URL. */
export function getDb(): Promise<Sql> {
  if (!ready) {
    ready = (async () => {
      const url = process.env.DATABASE_URL;
      if (!url) throw new Error("DATABASE_URL is not set");
      const sql = neon(url);
      await setup(sql);
      return sql;
    })().catch((err) => {
      ready = undefined; // retry on the next request
      throw err;
    });
  }
  return ready;
}
