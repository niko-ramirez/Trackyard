import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

const LICENSE_LABELS: Record<string, string> = {
  ONE_TIME: "One-time use",
  EXCLUSIVE: "Exclusive",
};

export default async function PurchasesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const purchases = await db.purchase.findMany({
    where: { buyerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { track: true },
  });

  return (
    <main className="page-medium">
      <h1 className="text-2xl font-semibold">Your purchases</h1>

      {purchases.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-muted">You haven&apos;t bought any licenses yet.</p>
          <Link href="/browse" className="btn-primary">
            Browse beats
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {purchases.map((purchase) => (
            <li key={purchase.id} className="card flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/tracks/${purchase.trackId}`}
                  className="font-medium hover:text-accent"
                >
                  {purchase.track.title}
                </Link>
                <span className="text-sm text-muted">
                  {formatPrice(purchase.priceAtSale)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="badge">
                  {LICENSE_LABELS[purchase.licenseType] ?? purchase.licenseType}
                </span>
                <span>{purchase.status}</span>
                <span>·</span>
                <span>{formatDate(purchase.createdAt)}</span>
              </div>
              <audio
                controls
                src={purchase.track.audioFileUrl}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
