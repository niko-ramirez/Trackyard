import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PricingForm } from "./pricing-form";

export default async function TrackPricingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const track = await db.track.findUnique({
    where: { id },
    include: { licenses: true },
  });

  if (!track || track.producerId !== session.user.id) {
    notFound();
  }

  const oneTime = track.licenses.find((l) => l.type === "ONE_TIME");
  const exclusive = track.licenses.find((l) => l.type === "EXCLUSIVE");

  return (
    <main className="page-narrow">
      <div>
        <Link href="/dashboard" className="link text-sm">
          ← Back to your tracks
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">
          Pricing for &quot;{track.title}&quot;
        </h1>
      </div>

      {track.status === "SOLD_EXCLUSIVE" && (
        <p className="notice-warning">
          This beat was sold exclusively, so it&apos;s no longer available for
          new licenses.
        </p>
      )}

      <div className="card">
        <PricingForm
          trackId={track.id}
          oneTimePrice={oneTime?.active ? oneTime.price / 100 : 0}
          exclusivePrice={exclusive?.active ? exclusive.price / 100 : 0}
          exclusiveLocked={track.status === "SOLD_EXCLUSIVE"}
        />
      </div>
    </main>
  );
}
