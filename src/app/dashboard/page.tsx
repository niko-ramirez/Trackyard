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
    <main className="page-medium">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Your tracks</h1>
        <div className="flex items-center gap-3">
          <Link href={`/producers/${session.user.id}`} className="link text-sm">
            View public page
          </Link>
          <Link href="/upload" className="btn-primary">
            Upload a beat
          </Link>
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-muted">You haven&apos;t uploaded any beats yet.</p>
          <Link href="/upload" className="btn-primary">
            Upload your first beat
          </Link>
        </div>
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
