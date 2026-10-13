import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type Sql = NeonQueryFunction<false, false>;

let ready: Promise<Sql> | undefined;

/** Neon SQL client; creates the table on first use. Needs DATABASE_URL. */
export function getDb(): Promise<Sql> {
  if (!ready) {
    ready = (async () => {
      const url = process.env.DATABASE_URL;
      if (!url) throw new Error("DATABASE_URL is not set");
      const sql = neon(url);
      await sql`
        CREATE TABLE IF NOT EXISTS weights (
          user_id text NOT NULL,
          day date NOT NULL,
          kg numeric(5, 2) NOT NULL,
          PRIMARY KEY (user_id, day)
        )`;
      return sql;
    })().catch((err) => {
      ready = undefined; // retry on the next request
      throw err;
    });
  }
  return ready;
}
