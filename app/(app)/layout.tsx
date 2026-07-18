import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/app/auth";
import { UQuizHeader } from "@/components/ui";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  return (
    <>
      <UQuizHeader>
        <Link
          href="/quizzes"
          className="rounded-lg px-3 py-2 text-sm text-uq-muted transition-colors hover:bg-uq-chip hover:text-uq-ink"
        >
          Quizzes
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/signin" });
          }}
        >
          <button
            type="submit"
            className="cursor-pointer rounded-lg border border-uq-border-strong bg-white px-4 py-2 text-sm text-uq-ink transition-colors hover:border-uq-primary hover:text-uq-primary"
          >
            Sign out
          </button>
        </form>
      </UQuizHeader>
      {children}
    </>
  );
}
