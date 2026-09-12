"use client";

import { useActionState } from "react";
import { updatePricingAction } from "./actions";

export function PricingForm({
  trackId,
  oneTimePrice,
  exclusivePrice,
  exclusiveLocked,
}: {
  trackId: string;
  oneTimePrice: number;
  exclusivePrice: number;
  exclusiveLocked: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updatePricingAction.bind(null, trackId),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">One-time license price ($)</span>
        <input
          name="oneTimePrice"
          type="number"
          min={0}
          step="0.01"
          defaultValue={oneTimePrice || ""}
          placeholder="0 = not for sale"
          className="rounded border px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Exclusive license price ($)</span>
        <input
          name="exclusivePrice"
          type="number"
          min={0}
          step="0.01"
          disabled={exclusiveLocked}
          defaultValue={exclusivePrice || ""}
          placeholder="0 = not for sale"
          className="rounded border px-3 py-2 disabled:bg-gray-100"
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
        {pending ? "Saving..." : "Save pricing"}
      </button>
    </form>
  );
}
