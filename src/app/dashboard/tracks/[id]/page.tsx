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
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Pricing for &quot;{track.title}&quot;</h1>

      {track.status === "SOLD_EXCLUSIVE" && (
        <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          This beat was sold exclusively, so it&apos;s no longer available for
          new licenses.
        </p>
      )}

      <PricingForm
        trackId={track.id}
        oneTimePrice={oneTime?.active ? oneTime.price / 100 : 0}
        exclusivePrice={exclusive?.active ? exclusive.price / 100 : 0}
        exclusiveLocked={track.status === "SOLD_EXCLUSIVE"}
      />
    </main>
  );
}
