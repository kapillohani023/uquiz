import Link from "next/link";
import { UQuizButton, UQuizPage } from "@/components/ui";

export default function NotFound() {
  return (
    <UQuizPage
      width="narrow"
      className="flex flex-1 flex-col items-center justify-center text-center"
    >
      <h1 className="text-[26px] font-bold tracking-[-0.5px] text-uq-ink">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-uq-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <Link href="/" className="mt-6">
        <UQuizButton variant="primary" size="lg">
          Go home
        </UQuizButton>
      </Link>
    </UQuizPage>
  );
}
