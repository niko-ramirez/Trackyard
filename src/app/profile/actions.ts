"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().max(500).optional(),
});

export type ProfileFormState = { error: string } | { success: true } | undefined;

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not signed in" };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, bio: parsed.data.bio },
  });

  revalidatePath("/profile");
  return { success: true };
}
