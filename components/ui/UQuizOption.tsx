"use client";

import type { ReactNode } from "react";
import { cx } from "./UQuizUtils";

/** A quiz answer choice with a radio dot. Controlled via `selected` + `onSelect`. */
export function UQuizOption({
  selected,
  onSelect,
  children,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cx(
        "flex cursor-pointer items-center gap-3 rounded-[10px] border-[1.5px] px-[18px] py-3.5 text-left text-[15px] text-uq-ink transition-colors hover:border-uq-primary",
        selected ? "border-uq-primary bg-uq-primary-tint" : "border-uq-border-strong bg-white",
        className,
      )}
    >
      <span
        className={cx(
          "box-border size-[22px] shrink-0 rounded-full border-[1.5px]",
          selected
            ? "border-uq-primary bg-uq-primary"
            : "border-uq-border-dashed bg-white",
        )}
      />
      {children}
    </button>
  );
}
