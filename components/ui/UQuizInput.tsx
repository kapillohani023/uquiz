"use client";

import { useId, type InputHTMLAttributes } from "react";
import { cx } from "./UQuizUtils";

export type UQuizInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function UQuizInput({ label, error, className, id, ...rest }: UQuizInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] text-uq-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cx(
          "w-full rounded-[9px] border bg-white px-3.5 py-[11px]",
          "text-sm text-uq-ink placeholder:text-uq-faint outline-none",
          "transition-colors",
          error
            ? "border-uq-primary"
            : "border-uq-border-strong focus:border-uq-primary",
        )}
        {...rest}
      />
      {error && <p className="mt-1.5 text-xs text-uq-primary">{error}</p>}
    </div>
  );
}
