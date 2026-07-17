"use client";

import { cx } from "./UQuizUtils";

/** Labeled range slider with a value readout on the right, as used in Create quiz. */
export function UQuizSlider({
  label,
  valueLabel,
  min,
  max,
  step = 1,
  value,
  onChange,
  className,
}: {
  label: string;
  /** Text shown bold on the right, e.g. "5", "Medium (3/5)", "10 min". */
  valueLabel: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex justify-between text-[13px] text-uq-muted">
        <span>{label}</span>
        <strong className="font-semibold text-uq-ink">{valueLabel}</strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className={cx("w-full accent-uq-primary")}
      />
    </div>
  );
}
