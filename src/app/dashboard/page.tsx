import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TrackRow } from "./track-row";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const tracks = await db.track.findMany({
    where: { producerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your tracks</h1>
        <Link href="/upload" className="rounded bg-black px-4 py-2 text-white">
          Upload a beat
        </Link>
      </div>

      {tracks.length === 0 ? (
        <p className="text-gray-500">
          You haven&apos;t uploaded any beats yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tracks.map((track) => (
            <TrackRow key={track.id} track={track} />
          ))}
        </ul>
      )}
    </main>
  );
}
