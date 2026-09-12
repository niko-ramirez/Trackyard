import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const track = await db.track.findUnique({
    where: { id },
    include: { producer: { select: { id: true, name: true } } },
  });

  if (!track || track.status === "TAKEN_DOWN") {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16">
      <div className="aspect-square w-full overflow-hidden rounded bg-gray-100">
        {track.coverArtUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.coverArtUrl}
            alt={track.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{track.title}</h1>
        <p className="text-gray-500">
          {track.genre} · {track.bpm} BPM{track.key ? ` · ${track.key}` : ""}
        </p>
        <Link
          href={`/producers/${track.producer.id}`}
          className="text-sm underline"
        >
          {track.producer.name ?? "Unknown producer"}
        </Link>
      </div>

      {track.status === "SOLD_EXCLUSIVE" && (
        <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          This beat has been sold exclusively and is no longer available for
          new licenses.
        </p>
      )}

      <audio controls src={track.audioFileUrl} className="w-full" />
    </main>
  );
}
