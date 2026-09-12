"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "../actions";

const ROLES = [
  { value: "PRODUCER", label: "Producer", hint: "I upload beats" },
  { value: "ARTIST", label: "Artist", hint: "I buy licenses" },
  { value: "BOTH", label: "Both", hint: "" },
] as const;

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, undefined);

  return (
    <main className="page-narrow flex-1 justify-center">
      <div className="card flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Create your account</h1>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="label">Name</span>
            <input name="name" type="text" required className="input" />
          </label>

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
              minLength={8}
              className="input"
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="label">I am a...</legend>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((role, i) => (
                <label
                  key={role.value}
                  className="has-checked:border-accent has-checked:bg-accent/10 flex cursor-pointer flex-col items-center gap-0.5 rounded-lg border border-border px-2 py-2 text-center text-sm"
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    defaultChecked={i === 0}
                    className="sr-only"
                  />
                  <span className="font-medium">{role.label}</span>
                  {role.hint && (
                    <span className="text-xs text-muted">{role.hint}</span>
                  )}
                </label>
              ))}
            </div>
          </fieldset>

          {state?.error && (
            <p className="text-sm text-danger">{state.error}</p>
          )}

          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="link">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
