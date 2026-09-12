import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { TrackCard } from "../../browse/track-card";

export default async function ProducerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const producer = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, bio: true },
  });

  if (!producer) {
    notFound();
  }

  const tracks = await db.track.findMany({
    where: { producerId: id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: {
      producer: { select: { id: true, name: true } },
      licenses: { where: { active: true } },
    },
  });

  const initial = (producer.name || "?").charAt(0).toUpperCase();

  return (
    <main className="page">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xl font-semibold text-accent">
          {initial}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">
            {producer.name ?? "Unknown producer"}
          </h1>
          {producer.bio && <p className="text-muted">{producer.bio}</p>}
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="card py-10 text-center text-muted">
          No beats listed yet.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </ul>
      )}
    </main>
  );
}
