import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

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
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Your purchases</h1>

      {purchases.length === 0 ? (
        <p className="text-gray-500">
          You haven&apos;t bought any licenses yet.{" "}
          <Link href="/browse" className="underline">
            Browse beats
          </Link>
          .
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {purchases.map((purchase) => (
            <li key={purchase.id} className="flex flex-col gap-2 rounded border p-3">
              <div className="flex items-center justify-between">
                <Link href={`/tracks/${purchase.trackId}`} className="font-medium underline">
                  {purchase.track.title}
                </Link>
                <span className="text-sm text-gray-500">
                  {formatPrice(purchase.priceAtSale)}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {purchase.licenseType === "ONE_TIME" ? "One-time use" : "Exclusive"}{" "}
                license · {purchase.status} ·{" "}
                {purchase.createdAt.toLocaleDateString()}
              </p>
              <audio controls src={purchase.track.audioFileUrl} className="w-full" />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
