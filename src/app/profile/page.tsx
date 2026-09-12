import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileForm } from "./profile-form";

const ROLE_LABELS: Record<string, string> = {
  PRODUCER: "Producer",
  ARTIST: "Artist",
  BOTH: "Producer & Artist",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const initial = (user.name || user.email).charAt(0).toUpperCase();

  return (
    <main className="page-narrow">
      <h1 className="text-2xl font-semibold">Your profile</h1>

      <div className="card flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xl font-semibold text-accent">
          {initial}
        </div>
        <div>
          <p className="text-sm text-muted">{user.email}</p>
          <span className="badge mt-1">
            {ROLE_LABELS[user.role] ?? user.role}
          </span>
        </div>
      </div>

      <div className="card">
        <ProfileForm name={user.name ?? ""} bio={user.bio ?? ""} />
      </div>
    </main>
  );
}
