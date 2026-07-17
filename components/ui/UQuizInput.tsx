"use client";

import { useId, type InputHTMLAttributes } from "react";
import { cx } from "./UQuizUtils";

export type UQuizInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function UQuizInput({ label, className, id, ...rest }: UQuizInputProps) {
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
        className={cx(
          "w-full rounded-[9px] border border-uq-border-strong bg-white px-3.5 py-[11px]",
          "text-sm text-uq-ink placeholder:text-uq-faint outline-none",
          "focus:border-uq-primary transition-colors",
        )}
        {...rest}
      />
    </div>
  );
}
