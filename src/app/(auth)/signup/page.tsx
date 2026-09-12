"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "../actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, undefined);

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Create your account</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Name</span>
          <input
            name="name"
            type="text"
            required
            className="rounded border px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            className="rounded border px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="rounded border px-3 py-2"
          />
        </label>

        <fieldset className="flex flex-col gap-1">
          <legend className="text-sm font-medium">I am a...</legend>
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="PRODUCER" defaultChecked />
            Producer (I upload beats)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="ARTIST" />
            Artist (I buy licenses)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="BOTH" />
            Both
          </label>
        </fieldset>

        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
