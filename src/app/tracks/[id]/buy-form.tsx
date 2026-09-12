"use client";

import { useState, useTransition } from "react";
import { purchaseAction } from "./actions";
import type { LicenseType } from "@/generated/prisma/enums";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const LICENSE_INFO: Record<LicenseType, { label: string; description: string }> = {
  ONE_TIME: {
    label: "One-time use",
    description: "Use this beat in one project. Others can license it too.",
  },
  EXCLUSIVE: {
    label: "Exclusive",
    description: "You own it outright — it's delisted for everyone else.",
  },
};

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
      <p className="notice-info">This beat isn&apos;t listed for sale yet.</p>
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
    <div className="flex flex-col gap-3">
      <p className="notice-warning">
        Test mode: purchases here don&apos;t move real money yet.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {licenses.map((license) => {
          const info = LICENSE_INFO[license.type];
          return (
            <div key={license.type} className="card flex flex-col gap-3">
              <div>
                <p className="font-medium">{info.label}</p>
                <p className="text-sm text-muted">{info.description}</p>
              </div>
              <p className="text-2xl font-semibold">
                {formatPrice(license.price)}
              </p>
              <button
                onClick={() => handleBuy(license.type)}
                disabled={isPending}
                className="btn-primary"
              >
                {isPending && buying === license.type ? "Buying..." : "Buy"}
              </button>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
