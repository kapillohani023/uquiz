"use client";

import type { ReactNode } from "react";
import { cx } from "./UQuizUtils";

/**
 * Centered modal over a dimmed backdrop. Controlled: render nothing when closed.
 * Clicking the backdrop calls onClose; clicks inside the panel are contained.
 */
export function UQuizDialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
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
          "w-full max-w-[420px] rounded-2xl bg-uq-surface p-8 shadow-[0_20px_60px_rgba(28,25,23,0.25)]",
          className,
        )}
      >
        {title && (
          <h2
            className={cx(
              "text-[19px] font-bold tracking-[-0.3px] text-uq-ink",
              description ? "mb-1.5" : "mb-[18px]",
            )}
          >
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
