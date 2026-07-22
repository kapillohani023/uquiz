"use client";

import type { LucideIcon } from "lucide-react";
import { cx } from "./UQuizUtils";

export type UQuizViewToggleOption<V extends string> = {
  value: V;
  label: string;
  icon: LucideIcon;
};

/** Segmented control, e.g. Grid / List. Controlled. */
export function UQuizViewToggle<V extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: ReadonlyArray<UQuizViewToggleOption<V>>;
  value: V;
  onChange: (value: V) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      className={cx(
        "inline-flex border border-uq-border-strong rounded-lg overflow-hidden",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => onChange(opt.value)}
            className={cx(
              "flex items-center px-3 py-[7px] cursor-pointer transition-colors",
              active ? "bg-uq-ink text-white" : "bg-white text-uq-muted hover:text-uq-ink",
            )}
          >
            <Icon size={16} strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
