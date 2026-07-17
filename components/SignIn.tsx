import { redirect } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { auth, signIn } from "@/app/auth";

export async function SignIn() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-black/10 p-8 shadow-sm dark:border-white/10">
        <h1 className="mb-6 text-center text-2xl font-semibold">Sign In</h1>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-md border border-black/10 py-2.5 font-medium transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
          >
            <FcGoogle size={20} />
            Sign in with Google
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-black/60 dark:text-white/60">
          By signing in you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
