"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./UQuizUtils";

export type UQuizMenuItem = {
  label: string;
  onSelect: () => void;
  danger?: boolean;
};

/**
 * "⋯" overflow menu. Owns its open state and closes on outside click or Escape.
 */
export function UQuizMenu({
  items,
  trigger,
  align = "right",
  className,
}: {
  items: UQuizMenuItem[];
  /** Custom trigger content; defaults to the ⋯ glyph. */
  trigger?: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cx("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="cursor-pointer rounded-md px-1.5 py-0.5 text-lg leading-none text-uq-faint transition-colors hover:bg-uq-chip hover:text-uq-ink"
      >
        {trigger ?? "⋯"}
      </button>
      {open && (
        <div
          role="menu"
          className={cx(
            "absolute top-7 z-10 flex min-w-[140px] flex-col rounded-[10px] border border-uq-border-strong bg-white p-1 shadow-[0_6px_20px_rgba(28,25,23,0.12)]",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onSelect();
              }}
              className={cx(
                "cursor-pointer rounded-[7px] px-3 py-[9px] text-left text-[13px] transition-colors",
                item.danger
                  ? "text-uq-primary hover:bg-uq-primary-tint"
                  : "text-uq-ink hover:bg-uq-chip",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
