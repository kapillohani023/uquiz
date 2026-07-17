import { cx } from "./UQuizUtils";

/** Thin quiz progress bar. `value` is 0–100. */
export function UQuizProgress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cx("h-1 overflow-hidden rounded-full bg-uq-border", className)}
    >
      <div
        className="h-full rounded-full bg-uq-primary transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
