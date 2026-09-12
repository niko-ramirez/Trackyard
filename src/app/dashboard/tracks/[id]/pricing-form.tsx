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
        <span className="label">One-time license price ($)</span>
        <input
          name="oneTimePrice"
          type="number"
          min={0}
          step="0.01"
          defaultValue={oneTimePrice || ""}
          placeholder="0 = not for sale"
          className="input"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="label">Exclusive license price ($)</span>
        <input
          name="exclusivePrice"
          type="number"
          min={0}
          step="0.01"
          disabled={exclusiveLocked}
          defaultValue={exclusivePrice || ""}
          placeholder="0 = not for sale"
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
        {pending ? "Saving..." : "Save pricing"}
      </button>
    </form>
  );
}
