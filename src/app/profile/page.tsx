import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logoutAction } from "../(auth)/actions";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <form action={logoutAction}>
          <button type="submit" className="text-sm underline">
            Log out
          </button>
        </form>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-500">Role: {user.role}</p>
        </div>
      </div>

      <ProfileForm name={user.name ?? ""} bio={user.bio ?? ""} />
    </main>
  );
}
