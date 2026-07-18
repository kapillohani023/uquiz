import type { ReactNode } from "react";
import { cx, type UQuizTone } from "./UQuizUtils";

const tones: Record<UQuizTone, string> = {
  neutral: "bg-uq-chip text-uq-muted",
  success: "bg-uq-success-tint text-uq-success",
  warning: "bg-uq-chip text-uq-warning",
  danger: "bg-uq-chip text-uq-primary",
  muted: "bg-uq-chip text-uq-faint",
};

export function UQuizBadge({
  tone = "neutral",
  bold = false,
  chip = false,
  className,
  children,
}: {
  tone?: UQuizTone;
  /** Slightly larger, bolder pill — used for scores. */
  bold?: boolean;
  /** Force the neutral chip background regardless of tone — used for score pills. */
  chip?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full whitespace-nowrap",
        bold ? "text-[13px] font-semibold px-3.5 py-[5px]" : "text-xs px-2.5 py-[3px]",
        tones[tone],
        chip && "bg-uq-chip",
        className,
      )}
    >
      {children}
    </span>
  );
}
