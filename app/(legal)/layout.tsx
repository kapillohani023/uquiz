import Link from "next/link";
import { UQuizLogo } from "@/components/ui";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-uq-border bg-uq-surface px-5 py-[18px] sm:px-10">
        <Link href="/" aria-label="uquiz home">
          <UQuizLogo />
        </Link>
      </header>
      {children}
    </>
  );
}
