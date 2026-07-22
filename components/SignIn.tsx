import Link from "next/link";
import { redirect } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { auth, signIn } from "@/app/auth";
import { UQuizLogo } from "@/components/ui";

const features = [
  {
    title: "Paste a link",
    description: "Add any YouTube video to a course.",
  },
  {
    title: "Generate the quiz",
    description: "Questions generated straight from the video.",
  },
  {
    title: "Take it, timed",
    description: "Answer against the clock and see your score instantly.",
  },
];

export async function SignIn() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="flex h-dvh flex-1 flex-col items-center justify-center gap-6 overflow-y-auto p-6 py-8">
      <div className="max-w-[600px] text-center">
        <UQuizLogo size="lg" />
        <h1 className="mt-3 text-[24px] font-bold tracking-[-0.6px] text-uq-ink sm:text-[30px]">
          Turn YouTube videos into quizzes you&apos;ll actually remember
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-uq-muted">
          Stop rewatching videos to cram before a test. Drop in a YouTube
          link and uquiz turns it into a timed quiz in seconds — so you find
          out what actually stuck.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="rounded-xl border border-uq-border bg-uq-surface px-4 py-3 text-left"
            >
              <div className="flex size-6 items-center justify-center rounded-full bg-uq-primary-tint text-xs font-bold text-uq-primary">
                {i + 1}
              </div>
              <div className="mt-2 text-[13px] font-semibold text-uq-ink">
                {f.title}
              </div>
              <div className="mt-0.5 text-xs leading-relaxed text-uq-muted">
                {f.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-[400px] rounded-2xl border border-uq-border bg-uq-surface px-11 py-6 text-center shadow-[0_2px_16px_rgba(28,25,23,0.05)]">
        <h2 className="text-[17px] font-bold tracking-[-0.3px] text-uq-ink">
          Get started
        </h2>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[10px] bg-uq-ink px-4 py-[13px] text-[15px] font-medium text-uq-surface transition-colors hover:bg-uq-ink-hover"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>
        </form>
        <p className="mt-3 text-xs text-uq-faint">
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
