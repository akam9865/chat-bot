"use client";

import { useState } from "react";
import { loginAction } from "../actions/login";
import { guestLoginAction } from "../actions/guestLogin";
import { redirect } from "next/navigation";

export const Login = () => {
  const [error, setError] = useState<string | null>(null);

  async function login(formData: FormData) {
    const res = await loginAction(formData);
    if (!res.ok) {
      setError(res.error || "Login failed");
      return;
    }
    redirect("/");
  }

  async function loginAsGuest() {
    const res = await guestLoginAction();
    if (res.ok) {
      redirect("/");
    }
  }

  return (
    <div className="flex items-center justify-center h-dvh">
      <div className="flex flex-col gap-6 w-80">
        <h1 className="text-xl font-semibold text-center">Sign In</h1>

        <form action={login} className="flex flex-col gap-3">
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoFocus
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
          <button
            type="submit"
            className="bg-neutral-900 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-neutral-800"
          >
            Sign In
          </button>
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-sm text-neutral-400">or</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        <button
          type="button"
          onClick={loginAsGuest}
          className="border border-neutral-300 rounded-md px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
};
