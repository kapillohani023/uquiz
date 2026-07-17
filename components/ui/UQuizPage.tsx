import type { ReactNode } from "react";
import { cx } from "./UQuizUtils";

const widths = {
  /** Course/home grids (1040px). */
  wide: "max-w-[1040px]",
  /** Quiz lists (840px). */
  medium: "max-w-[840px]",
  /** Quiz taking / results (680px). */
  narrow: "max-w-[680px]",
} as const;

/** Centered page column used by every screen. */
export function UQuizPage({
  width = "wide",
  children,
  className,
}: {
  width?: keyof typeof widths;
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cx(
        "mx-auto w-full flex-1 px-10 pt-8 pb-20",
        widths[width],
        className,
      )}
    >
      {children}
    </main>
  );
}

/** Page heading with optional meta line below and actions on the right. */
export function UQuizPageHeader({
  title,
  meta,
  actions,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "mb-6 flex flex-wrap items-center justify-between gap-3.5",
        className,
      )}
    >
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.5px] text-uq-ink">
          {title}
        </h1>
        {meta && <div className="mt-1 text-[13px] text-uq-faint">{meta}</div>}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}
