import { cx } from "./UQuizUtils";

const sizes = {
  sm: "size-5 border-2",
  md: "size-[42px] border-[3.5px]",
} as const;

export function UQuizSpinner({
  size = "md",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cx(
        "animate-spin rounded-full border-uq-border border-t-uq-primary",
        sizes[size],
        className,
      )}
    />
  );
}
