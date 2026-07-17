"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cx } from "./UQuizUtils";

const linkClasses =
  "text-[13px] text-uq-faint transition-colors hover:text-uq-primary";

/** "← Back" breadcrumb link. Pass `href` for navigation or `onClick` for state-driven back. */
export function UQuizBackLink({
  href,
  onClick,
  children,
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  const content = <>&larr; {children}</>;
  if (href) {
    return (
      <Link href={href} className={cx(linkClasses, className)}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cx(linkClasses, "cursor-pointer", className)}>
      {content}
    </button>
  );
}
