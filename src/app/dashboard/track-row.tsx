"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteTrackAction } from "./actions";

type Track = {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  status: string;
  audioFileUrl: string;
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "border-success/40 text-success",
  SOLD_EXCLUSIVE: "border-accent/40 text-accent",
  TAKEN_DOWN: "border-border text-muted",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  SOLD_EXCLUSIVE: "Sold exclusively",
  TAKEN_DOWN: "Taken down",
};

export function TrackRow({ track }: { track: Track }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(`Take down "${track.title}"?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteTrackAction(track.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  }

  return (
    <li className="card flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-medium">{track.title}</p>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted">
            <span>
              {track.genre} · {track.bpm} BPM
            </span>
            <span className={`badge ${STATUS_STYLES[track.status] ?? ""}`}>
              {STATUS_LABELS[track.status] ?? track.status}
            </span>
          </div>
        </div>
        {track.status !== "TAKEN_DOWN" && (
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/tracks/${track.id}`} className="link text-sm">
              Pricing
            </Link>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="btn-danger text-sm"
            >
              {isPending ? "Removing..." : "Take down"}
            </button>
          </div>
        )}
      </div>
      <audio controls src={track.audioFileUrl} className="w-full" />
      {error && <p className="text-sm text-danger">{error}</p>}
    </li>
  );
}
