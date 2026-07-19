"use client";

import { useEffect } from "react";
import Link from "next/link";
import { UQuizButton, UQuizPage } from "@/components/ui";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <UQuizPage
      width="narrow"
      className="flex flex-1 flex-col items-center justify-center text-center"
    >
      <h1 className="text-[26px] font-bold tracking-[-0.5px] text-uq-ink">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-uq-muted">
        An unexpected error occurred. Try again, or head back home if it
        keeps happening.
      </p>
      <div className="mt-6 flex gap-2.5">
        <UQuizButton
          variant="primary"
          size="lg"
          onClick={() => unstable_retry()}
        >
          Try again
        </UQuizButton>
        <Link href="/">
          <UQuizButton variant="secondary" size="lg">
            Go home
          </UQuizButton>
        </Link>
      </div>
    </UQuizPage>
  );
}
