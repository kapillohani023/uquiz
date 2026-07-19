import type { ButtonHTMLAttributes } from "react";
import { cx } from "./UQuizUtils";

const variants = {
  primary:
    "bg-uq-primary text-white font-semibold shadow-[0_4px_14px_rgba(208,52,44,0.3)] hover:bg-uq-primary-hover",
  /** Red→orange gradient used by the create-quiz flow. */
  gradient:
    "bg-[linear-gradient(135deg,#d0342c,#e05a2b)] text-white font-semibold shadow-[0_4px_14px_rgba(208,52,44,0.3)] hover:bg-none hover:bg-uq-primary-hover",
  ink: "bg-uq-ink text-white font-medium hover:bg-uq-ink-hover",
  secondary:
    "bg-white border border-uq-border-strong text-uq-ink hover:border-uq-primary hover:text-uq-primary",
  outline: "bg-white border border-uq-border-strong text-uq-ink hover:border-uq-ink",
  ghost: "bg-transparent text-uq-muted hover:bg-uq-chip hover:text-uq-ink",
  danger:
    "bg-transparent border border-uq-border-strong text-uq-primary hover:border-uq-primary hover:bg-uq-primary-tint",
} as const;

const sizes = {
  sm: "text-xs px-3 py-[5px] rounded-[7px]",
  md: "text-sm px-4 py-2 rounded-lg",
  /** Dialog actions and quiz navigation (slightly taller, rounder). */
  action: "text-sm px-[22px] py-2.5 rounded-[9px]",
  lg: "text-[15px] px-6 py-[13px] rounded-[10px]",
} as const;

export type UQuizButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  fullWidth?: boolean;
};

export function UQuizButton({
  variant = "secondary",
  size = "md",
  fullWidth = false,
  className,
  type = "button",
  ...rest
}: UQuizButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center gap-2.5 cursor-pointer transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    />
  );
}
