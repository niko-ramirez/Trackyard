"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function deleteTrackAction(trackId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const track = await db.track.findUnique({ where: { id: trackId } });
  if (!track || track.producerId !== session.user.id) {
    throw new Error("Track not found");
  }

  await db.track.update({
    where: { id: trackId },
    data: { status: "TAKEN_DOWN" },
  });

  revalidatePath("/dashboard");
}
