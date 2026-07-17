import { redirect } from "next/navigation";
import { auth, signOut } from "@/app/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/signin");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <p className="text-lg">Signed in as {session.user?.email}</p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/signin" });
        }}
      >
        <button
          type="submit"
          className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
