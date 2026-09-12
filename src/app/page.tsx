import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        Track<span className="text-accent">yard</span>
      </h1>
      <p className="max-w-sm text-muted">
        Upload beats, sell licenses, and find your next placement — all in
        one place.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/browse" className="btn-primary">
          Browse beats
        </Link>
        {session?.user ? (
          <Link href="/dashboard" className="btn-secondary">
            Go to your dashboard
          </Link>
        ) : (
          <Link href="/signup" className="btn-secondary">
            Create an account
          </Link>
        )}
      </div>
    </main>
  );
}
