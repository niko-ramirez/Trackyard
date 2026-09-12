"use client";

import { useRef, useState, type FormEvent } from "react";
import { requestUploadTarget, createTrackAction } from "./actions";

const MAX_AUDIO_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5MB

const fileInputClass =
  "input file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent-foreground hover:file:bg-accent-hover";

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
  const [step, setStep] = useState<string | null>(null);
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
      setStep("Uploading audio...");
      const audioFileUrl = await uploadFile(audioFile, "audio");

      let coverArtUrl: string | undefined;
      if (coverFile) {
        setStep("Uploading cover art...");
        coverArtUrl = await uploadFile(coverFile, "cover");
      }

      setStep("Saving...");
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
      setStep(null);
    }
  }

  return (
    <main className="page-narrow">
      <h1 className="text-2xl font-semibold">Upload a beat</h1>

      <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="label">Title</span>
          <input name="title" type="text" required className="input" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="label">Genre</span>
          <input name="genre" type="text" required className="input" />
        </label>

        <div className="flex gap-4">
          <label className="flex flex-1 flex-col gap-1">
            <span className="label">BPM</span>
            <input
              name="bpm"
              type="number"
              min={40}
              max={300}
              required
              className="input"
            />
          </label>

          <label className="flex flex-1 flex-col gap-1">
            <span className="label">Key (optional)</span>
            <input
              name="key"
              type="text"
              placeholder="e.g. C minor"
              className="input"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="label">Audio file</span>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg"
            required
            className={fileInputClass}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="label">Cover art (optional)</span>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className={fileInputClass}
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? (step ?? "Uploading...") : "Upload beat"}
        </button>
      </form>
    </main>
  );
}
