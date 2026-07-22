import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import { UQuizHeader } from "@/components/ui";
import { UserMenu } from "@/components/UserMenu";

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
        <UserMenu
          name={session.user.name ?? ""}
          email={session.user.email ?? ""}
        />
      </UQuizHeader>
      {children}
    </>
  );
}
