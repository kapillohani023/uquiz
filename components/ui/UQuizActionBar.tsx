import type { ReactNode } from "react";
import { cx } from "./UQuizUtils";

/**
 * Fixed bottom action bar with a fade-up gradient (e.g. "Create quiz" on the
 * course screen). Give the page enough bottom padding so content isn't hidden.
 */
export function UQuizActionBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "fixed inset-x-0 bottom-0 z-20 flex flex-wrap justify-center gap-3 px-5 pt-[18px] pb-[22px] sm:px-10",
        "bg-[linear-gradient(to_top,#faf9f7_60%,rgba(250,249,247,0))]",
        className,
      )}
    >
      {children}
    </div>
  );
}
