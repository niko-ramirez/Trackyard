"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createUploadTarget, type UploadTarget } from "@/lib/storage";

const AUDIO_EXTENSIONS = ["mp3", "wav", "m4a", "ogg"];
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

export async function requestUploadTarget(
  kind: "audio" | "cover",
  extension: string,
): Promise<UploadTarget> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const allowed = kind === "audio" ? AUDIO_EXTENSIONS : IMAGE_EXTENSIONS;
  const ext = extension.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!allowed.includes(ext)) {
    throw new Error(
      `Unsupported file type: .${extension}. Allowed: ${allowed.join(", ")}`,
    );
  }

  const key = `tracks/${session.user.id}/${crypto.randomUUID()}.${ext}`;
  return createUploadTarget(key);
}

const trackSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  genre: z.string().min(1, "Genre is required").max(60),
  bpm: z.number().int().min(40, "BPM looks too low").max(300, "BPM looks too high"),
  key: z.string().max(10).optional(),
  audioFileUrl: z.string().min(1, "Audio file is required"),
  coverArtUrl: z.string().optional(),
});

export type CreateTrackInput = z.input<typeof trackSchema>;
export type CreateTrackResult = { error: string } | undefined;

export async function createTrackAction(
  input: CreateTrackInput,
): Promise<CreateTrackResult> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in" };

  const parsed = trackSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.track.create({
    data: {
      producerId: session.user.id,
      title: parsed.data.title,
      genre: parsed.data.genre,
      bpm: parsed.data.bpm,
      key: parsed.data.key || null,
      audioFileUrl: parsed.data.audioFileUrl,
      coverArtUrl: parsed.data.coverArtUrl || null,
    },
  });

  redirect("/dashboard");
}
