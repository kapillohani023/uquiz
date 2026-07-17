import type { HTMLAttributes } from "react";
import { cx } from "./UQuizUtils";

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-[22px]",
  lg: "px-9 py-[34px]",
} as const;

export type UQuizCardProps = HTMLAttributes<HTMLDivElement> & {
  /** Adds hover affordance (red border + soft shadow) for clickable cards. */
  interactive?: boolean;
  padding?: keyof typeof paddings;
};

export function UQuizCard({
  interactive = false,
  padding = "md",
  className,
  ...rest
}: UQuizCardProps) {
  return (
    <div
      className={cx(
        "bg-uq-surface border border-uq-border rounded-[14px]",
        paddings[padding],
        interactive &&
          "cursor-pointer transition-[border-color,box-shadow] hover:border-uq-primary hover:shadow-[0_3px_14px_rgba(208,52,44,0.08)]",
        className,
      )}
      {...rest}
    />
  );
}
