import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/app/(auth)/actions";

export async function Nav() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Track<span className="text-accent">yard</span>
        </Link>

        <div className="flex items-center gap-1 text-sm">
          <Link href="/browse" className="btn-ghost">
            Browse
          </Link>

          {session?.user ? (
            <>
              <Link href="/dashboard" className="btn-ghost">
                Dashboard
              </Link>
              <Link href="/upload" className="btn-ghost">
                Upload
              </Link>
              <Link href="/purchases" className="btn-ghost">
                Purchases
              </Link>
              <Link href="/profile" className="btn-ghost">
                Profile
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="btn-ghost">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
