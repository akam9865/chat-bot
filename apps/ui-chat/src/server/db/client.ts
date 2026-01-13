import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { Sql } from "postgres";

let db: ReturnType<typeof drizzle> | null = null;
let sql: Sql | null = null;

function connect() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    throw new Error("Missing SUPABASE_DB_URL");
  }
  if (!sql) {
    sql = postgres(connectionString, {
      ssl: "require",
      prepare: false,
      max: 10,
    });
  }
  if (!db) {
    db = drizzle(sql);
  }
  return db;
}

export function getDb() {
  return db ?? connect();
}
