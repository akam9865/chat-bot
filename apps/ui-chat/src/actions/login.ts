"use server";

import { cookies } from "next/headers";
import { signToken } from "../lib/auth/jwt";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password"));

  if (password !== process.env.AUTH_PASSWORD) {
    return { ok: false, error: "invalid password" };
  }

  const token = await signToken();
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
