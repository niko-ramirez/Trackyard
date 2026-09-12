"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <main className="page-narrow flex-1 justify-center">
      <div className="card flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Log in</h1>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="label">Email</span>
            <input name="email" type="email" required className="input" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">Password</span>
            <input
              name="password"
              type="password"
              required
              className="input"
            />
          </label>

          {state?.error && (
            <p className="text-sm text-danger">{state.error}</p>
          )}

          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="link">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
