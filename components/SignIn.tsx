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
    <div className="flex flex-1 flex-col items-center justify-center gap-10 p-6 py-14">
      <div className="max-w-[600px] text-center">
        <UQuizLogo size="lg" />
        <h1 className="mt-4 text-[28px] font-bold tracking-[-0.6px] text-uq-ink sm:text-[34px]">
          Turn YouTube videos into quizzes you&apos;ll actually remember
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-uq-muted">
          Drop in a few links, and uquiz reads the transcripts, writes
          multiple-choice questions, and times you on what you just watched.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="rounded-xl border border-uq-border bg-uq-surface px-4 py-4 text-left"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-uq-primary-tint text-xs font-bold text-uq-primary">
                {i + 1}
              </div>
              <div className="mt-2.5 text-[13px] font-semibold text-uq-ink">
                {f.title}
              </div>
              <div className="mt-1 text-xs leading-relaxed text-uq-muted">
                {f.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-[400px] rounded-2xl border border-uq-border bg-uq-surface px-11 py-10 text-center shadow-[0_2px_16px_rgba(28,25,23,0.05)]">
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
            className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[10px] bg-uq-ink px-4 py-[13px] text-[15px] font-medium text-uq-surface transition-colors hover:bg-uq-ink-hover"
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
