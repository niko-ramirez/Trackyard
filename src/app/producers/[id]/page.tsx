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
    include: { producer: { select: { id: true, name: true } } },
  });

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold">
          {producer.name ?? "Unknown producer"}
        </h1>
        {producer.bio && <p className="text-gray-500">{producer.bio}</p>}
      </div>

      {tracks.length === 0 ? (
        <p className="text-gray-500">No beats listed yet.</p>
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
