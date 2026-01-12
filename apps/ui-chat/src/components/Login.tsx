"use client";

import { useState } from "react";
import { loginAction } from "../actions/login";
import { redirect, useRouter } from "next/navigation";

export const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function login(formData: FormData) {
    const res = await loginAction(formData);
    if (!res.ok) {
      setError(res.error || "Login failed");
      return;
    }
    redirect("/");
  }

  return (
    <form action={login}>
      <input type="password" name="password" placeholder="Password" autoFocus />
      <button type="submit">Sign In</button>
      {error && error}
    </form>
  );
};
