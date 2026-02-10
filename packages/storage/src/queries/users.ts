import { eq } from "drizzle-orm";
import { getDb } from "../client";
import { users as usersTable } from "../schema";

export async function createUser(type: "guest" | "admin") {
  const db = getDb();
  const [user] = await db.insert(usersTable).values({ type }).returning();
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function findOrCreateAdmin() {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.type, "admin"))
    .limit(1);
  if (existing) return existing;
  return createUser("admin");
}
