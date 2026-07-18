import Link from "next/link";
import { redirect } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { auth, signIn } from "@/app/auth";
import { UQuizLogo } from "@/components/ui";

export async function SignIn() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-[400px] rounded-2xl border border-uq-border bg-uq-surface px-11 py-12 text-center shadow-[0_2px_16px_rgba(28,25,23,0.05)]">
        <UQuizLogo size="lg" />
        <p className="mt-3.5 text-[15px] leading-relaxed text-uq-muted">
          Turn YouTube links into custom courses and generate quizzes on the
          fly.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="mt-8 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[10px] bg-uq-ink px-4 py-[13px] text-[15px] font-medium text-uq-surface transition-colors hover:bg-uq-ink-hover"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>
        </form>
        <p className="mt-[18px] text-xs text-uq-faint">
          Free while in beta &middot; no card required
        </p>
        <p className="mt-2 text-xs text-uq-faint">
          <Link
            href="/terms"
            className="text-uq-faint underline-offset-2 transition-colors hover:text-uq-primary"
          >
            Terms
          </Link>{" "}
          &middot;{" "}
          <Link
            href="/privacy"
            className="text-uq-faint underline-offset-2 transition-colors hover:text-uq-primary"
          >
            Privacy
          </Link>
        </p>
      </div>
    </div>
  );
}
