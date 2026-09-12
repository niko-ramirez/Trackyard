"use client";

import { useActionState } from "react";
import { updateProfileAction } from "./actions";

export function ProfileForm({ name, bio }: { name: string; bio: string }) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Name</span>
        <input
          name="name"
          type="text"
          defaultValue={name}
          required
          className="rounded border px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Bio</span>
        <textarea
          name="bio"
          defaultValue={bio}
          maxLength={500}
          rows={4}
          className="rounded border px-3 py-2"
        />
      </label>

      {state && "error" in state && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {state && "success" in state && (
        <p className="text-sm text-green-600">Saved.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
