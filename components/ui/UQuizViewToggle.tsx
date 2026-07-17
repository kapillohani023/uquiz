"use client";

import { cx } from "./UQuizUtils";

export type UQuizViewToggleOption<V extends string> = {
  value: V;
  label: string;
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
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cx(
              "text-[13px] px-3.5 py-[7px] cursor-pointer transition-colors",
              active ? "bg-uq-ink text-white" : "bg-white text-uq-muted hover:text-uq-ink",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
