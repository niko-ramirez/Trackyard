import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="mx-auto flex max-w-sm flex-col items-center gap-6 px-4 py-32 text-center">
      <h1 className="text-3xl font-semibold">Trackyard</h1>
      <p className="text-gray-600">Beats marketplace and social platform.</p>

      <Link href="/browse" className="underline">
        Browse beats
      </Link>

      {session?.user ? (
        <Link
          href="/profile"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Go to your profile
        </Link>
      ) : (
        <div className="flex gap-3">
          <Link href="/login" className="rounded border px-4 py-2">
            Log in
          </Link>
          <Link href="/signup" className="rounded bg-black px-4 py-2 text-white">
            Sign up
          </Link>
        </div>
      )}
    </main>
  );
}
