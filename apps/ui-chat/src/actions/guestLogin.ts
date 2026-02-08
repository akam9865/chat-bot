"use server";

import { cookies } from "next/headers";
import { signToken } from "../lib/auth/jwt";
import { createUser } from "../lib/db/drizzle";

export async function guestLoginAction() {
  const guest = await createUser("guest");
  const token = await signToken(guest.id);
  const cookieStore = await cookies();

  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { ok: true };
}
