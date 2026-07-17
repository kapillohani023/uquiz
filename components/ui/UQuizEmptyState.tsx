import type { ReactNode } from "react";
import { cx } from "./UQuizUtils";

/** Dashed placeholder box for empty lists. */
export function UQuizEmptyState({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-[14px] border-[1.5px] border-dashed border-uq-border-dashed p-12 text-center text-sm text-uq-faint",
        className,
      )}
    >
      {children}
    </div>
  );
}
