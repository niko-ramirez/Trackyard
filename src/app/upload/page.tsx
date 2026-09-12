"use client";

import { useRef, useState, type FormEvent } from "react";
import { requestUploadTarget, createTrackAction } from "./actions";

const MAX_AUDIO_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5MB

async function uploadFile(file: File, kind: "audio" | "cover") {
  const ext = file.name.split(".").pop() ?? "";
  const target = await requestUploadTarget(kind, ext);

  const res = await fetch(target.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Failed to upload ${kind} file`);
  }
  return target.fileUrl;
}

export default function UploadPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const audioFile = audioInputRef.current?.files?.[0];
    const coverFile = coverInputRef.current?.files?.[0];

    if (!audioFile) {
      setError("Choose an audio file to upload");
      return;
    }
    if (audioFile.size > MAX_AUDIO_BYTES) {
      setError("Audio file must be under 50MB");
      return;
    }
    if (coverFile && coverFile.size > MAX_COVER_BYTES) {
      setError("Cover art must be under 5MB");
      return;
    }

    setPending(true);
    try {
      const audioFileUrl = await uploadFile(audioFile, "audio");
      const coverArtUrl = coverFile
        ? await uploadFile(coverFile, "cover")
        : undefined;

      const result = await createTrackAction({
        title: String(formData.get("title") ?? ""),
        genre: String(formData.get("genre") ?? ""),
        bpm: Number(formData.get("bpm")),
        key: String(formData.get("key") ?? "") || undefined,
        audioFileUrl,
        coverArtUrl,
      });

      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Upload a beat</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Title</span>
          <input name="title" type="text" required className="rounded border px-3 py-2" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Genre</span>
          <input name="genre" type="text" required className="rounded border px-3 py-2" />
        </label>

        <div className="flex gap-4">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium">BPM</span>
            <input
              name="bpm"
              type="number"
              min={40}
              max={300}
              required
              className="rounded border px-3 py-2"
            />
          </label>

          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium">Key (optional)</span>
            <input name="key" type="text" placeholder="e.g. C minor" className="rounded border px-3 py-2" />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Audio file</span>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg"
            required
            className="rounded border px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Cover art (optional)</span>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="rounded border px-3 py-2"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Uploading..." : "Upload beat"}
        </button>
      </form>
    </main>
  );
}
