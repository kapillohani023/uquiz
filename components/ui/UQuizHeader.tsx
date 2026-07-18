import type { ReactNode } from "react";
import Link from "next/link";
import { cx } from "./UQuizUtils";
import { UQuizLogo } from "./UQuizLogo";

/**
 * Sticky app header: uquiz wordmark on the left (links home), actions on the right.
 */
export function UQuizHeader({
  homeHref = "/",
  children,
  className,
}: {
  homeHref?: string;
  /** Right-side actions (nav buttons, sign out, …). */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cx(
        "sticky top-0 z-30 flex items-center justify-between border-b border-uq-border bg-uq-surface px-5 py-[18px] sm:px-10",
        className,
      )}
    >
      <Link href={homeHref} aria-label="uquiz home">
        <UQuizLogo />
      </Link>
      <div className="flex items-center gap-2.5">{children}</div>
    </header>
  );
}
