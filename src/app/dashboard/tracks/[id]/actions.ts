"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { LicenseType } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

const pricingSchema = z.object({
  oneTimePrice: z.coerce.number().nonnegative("Price can't be negative"),
  exclusivePrice: z.coerce.number().nonnegative("Price can't be negative"),
});

export type PricingFormState = { error: string } | { success: true } | undefined;

async function upsertLicense(
  tx: Prisma.TransactionClient,
  trackId: string,
  type: LicenseType,
  dollars: number,
) {
  if (dollars > 0) {
    await tx.licenseOption.upsert({
      where: { trackId_type: { trackId, type } },
      create: { trackId, type, price: Math.round(dollars * 100), active: true },
      update: { price: Math.round(dollars * 100), active: true },
    });
  } else {
    await tx.licenseOption.updateMany({
      where: { trackId, type },
      data: { active: false },
    });
  }
}

export async function updatePricingAction(
  trackId: string,
  _prevState: PricingFormState,
  formData: FormData,
): Promise<PricingFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in" };

  const track = await db.track.findUnique({ where: { id: trackId } });
  if (!track || track.producerId !== session.user.id) {
    return { error: "Track not found" };
  }

  const parsed = pricingSchema.safeParse({
    oneTimePrice: formData.get("oneTimePrice") || 0,
    exclusivePrice: formData.get("exclusivePrice") || 0,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.$transaction(async (tx) => {
    await upsertLicense(tx, trackId, "ONE_TIME", parsed.data.oneTimePrice);
    if (track.status !== "SOLD_EXCLUSIVE") {
      await upsertLicense(tx, trackId, "EXCLUSIVE", parsed.data.exclusivePrice);
    }
  });

  revalidatePath(`/dashboard/tracks/${trackId}`);
  revalidatePath(`/tracks/${trackId}`);
  revalidatePath("/dashboard");
  revalidatePath("/browse");

  return { success: true };
}
