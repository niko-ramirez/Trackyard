"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { LicenseType } from "@/generated/prisma/enums";

export type PurchaseState = { error: string } | undefined;

type TransactionResult = { ok: true } | { ok: false; error: string };

export async function purchaseAction(
  trackId: string,
  licenseType: LicenseType,
): Promise<PurchaseState> {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/tracks/${trackId}`);
  }
  const buyerId = session.user.id;

  const result = await db.$transaction(
    async (tx): Promise<TransactionResult> => {
      const track = await tx.track.findUnique({ where: { id: trackId } });
      if (!track || track.status !== "ACTIVE") {
        return { ok: false, error: "This beat is no longer available." };
      }

      const license = await tx.licenseOption.findUnique({
        where: { trackId_type: { trackId, type: licenseType } },
      });
      if (!license || !license.active) {
        return { ok: false, error: "That license is no longer available." };
      }

      await tx.purchase.create({
        data: {
          buyerId,
          trackId,
          licenseType,
          priceAtSale: license.price,
          status: "COMPLETED",
        },
      });

      if (licenseType === "EXCLUSIVE") {
        await tx.track.update({
          where: { id: trackId },
          data: { status: "SOLD_EXCLUSIVE" },
        });
        await tx.licenseOption.updateMany({
          where: { trackId },
          data: { active: false },
        });
      }

      return { ok: true };
    },
  );

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath(`/tracks/${trackId}`);
  revalidatePath("/browse");
  redirect("/purchases");
}
