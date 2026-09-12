"use client";

import { useState, useTransition } from "react";
import { purchaseAction } from "./actions";
import type { LicenseType } from "@/generated/prisma/enums";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function BuyForm({
  trackId,
  licenses,
}: {
  trackId: string;
  licenses: { type: LicenseType; price: number }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<LicenseType | null>(null);

  if (licenses.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        This beat isn&apos;t listed for sale yet.
      </p>
    );
  }

  function handleBuy(licenseType: LicenseType) {
    setError(null);
    setBuying(licenseType);
    startTransition(async () => {
      const result = await purchaseAction(trackId, licenseType);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded border p-4">
      <p className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-800">
        Test mode: purchases here don&apos;t move real money yet.
      </p>

      {licenses.map((license) => (
        <div
          key={license.type}
          className="flex items-center justify-between gap-3"
        >
          <span className="text-sm">
            {license.type === "ONE_TIME" ? "One-time use" : "Exclusive"} —{" "}
            {formatPrice(license.price)}
          </span>
          <button
            onClick={() => handleBuy(license.type)}
            disabled={isPending}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {isPending && buying === license.type ? "Buying..." : "Buy"}
          </button>
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
