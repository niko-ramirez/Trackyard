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
    <li className="flex flex-col gap-2 rounded border p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-medium">{track.title}</p>
          <p className="text-sm text-gray-500">
            {track.genre} · {track.bpm} BPM · {track.status}
          </p>
        </div>
        {track.status !== "TAKEN_DOWN" && (
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/tracks/${track.id}`} className="text-sm underline">
              Pricing
            </Link>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-sm text-red-600 underline disabled:opacity-50"
            >
              {isPending ? "Removing..." : "Take down"}
            </button>
          </div>
        )}
      </div>
      <audio controls src={track.audioFileUrl} className="w-full" />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </li>
  );
}
