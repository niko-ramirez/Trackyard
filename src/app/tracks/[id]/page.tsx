import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BuyForm } from "./buy-form";

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const track = await db.track.findUnique({
    where: { id },
    include: {
      producer: { select: { id: true, name: true } },
      licenses: { where: { active: true } },
    },
  });

  if (!track || track.status === "TAKEN_DOWN") {
    notFound();
  }

  const isOwner = session?.user?.id === track.producer.id;

  return (
    <main className="page-medium">
      <Link href="/browse" className="link text-sm">
        ← Back to browse
      </Link>

      <div className="aspect-square w-full overflow-hidden rounded-xl bg-surface">
        {track.coverArtUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.coverArtUrl}
            alt={track.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl text-muted">
            ♪
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{track.title}</h1>
          <p className="text-muted">
            {track.genre} · {track.bpm} BPM{track.key ? ` · ${track.key}` : ""}
          </p>
          <Link
            href={`/producers/${track.producer.id}`}
            className="link text-sm"
          >
            {track.producer.name ?? "Unknown producer"}
          </Link>
        </div>
        {isOwner && (
          <Link
            href={`/dashboard/tracks/${track.id}`}
            className="btn-secondary shrink-0"
          >
            Manage pricing
          </Link>
        )}
      </div>

      {track.status === "SOLD_EXCLUSIVE" && (
        <p className="notice-warning">
          This beat has been sold exclusively and is no longer available for
          new licenses.
        </p>
      )}

      <audio controls src={track.audioFileUrl} className="w-full" />

      {track.status === "ACTIVE" && !isOwner && (
        <BuyForm trackId={track.id} licenses={track.licenses} />
      )}
    </main>
  );
}
