"use client";

import type { ReactNode } from "react";
import { cx } from "./UQuizUtils";

/**
 * Centered modal over a dimmed backdrop. Controlled: render nothing when closed.
 * Clicking the backdrop calls onClose; clicks inside the panel are contained.
 */
const sizeClasses = {
  default: "max-w-[420px] p-6 sm:p-8",
  video: "max-w-[720px] p-3",
} as const;

export function UQuizDialog({
  open,
  onClose,
  title,
  icon,
  description,
  children,
  className,
  size = "default",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Optional glyph rendered before the title. */
  icon?: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
  /** `video` widens the panel and tightens padding for edge-to-edge embeds. */
  size?: "default" | "video";
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-uq-ink/40 p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cx(
          "w-full rounded-2xl bg-uq-surface shadow-[0_20px_60px_rgba(28,25,23,0.25)]",
          sizeClasses[size],
          className,
        )}
      >
        {title && (
          <h2
            className={cx(
              "flex items-center gap-2 text-[19px] font-bold tracking-[-0.3px] text-uq-ink",
              description ? "mb-1.5" : "mb-[18px]",
            )}
          >
            {icon}
            {title}
          </h2>
        )}
        {description && (
          <p className="mb-[18px] text-[13px] text-uq-faint">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}

/** Right-aligned action row for the bottom of a dialog. */
export function UQuizDialogActions({
  children,
  align = "end",
  className,
}: {
  children: ReactNode;
  align?: "end" | "center";
  className?: string;
}) {
  return (
    <div
      className={cx(
        "mt-6 flex gap-2.5",
        align === "end" ? "justify-end" : "justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
