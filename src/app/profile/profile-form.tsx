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
        <span className="label">Name</span>
        <input
          name="name"
          type="text"
          defaultValue={name}
          required
          className="input"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="label">Bio</span>
        <textarea
          name="bio"
          defaultValue={bio}
          maxLength={500}
          rows={4}
          className="input"
        />
      </label>

      {state && "error" in state && (
        <p className="text-sm text-danger">{state.error}</p>
      )}
      {state && "success" in state && (
        <p className="text-sm text-success">Saved.</p>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
