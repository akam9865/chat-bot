import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error("Missing SUPABASE_DB_URL");
}

const sql = postgres(connectionString, {
  ssl: "require",
});

export const db = drizzle(sql);
export { sql };
