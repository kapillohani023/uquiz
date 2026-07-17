import { cx } from "./UQuizUtils";

/** Monospace countdown chip. Turns red when under a minute remains. */
export function UQuizTimer({
  seconds,
  urgentBelow = 60,
  className,
}: {
  seconds: number;
  urgentBelow?: number;
  className?: string;
}) {
  const s = Math.max(0, Math.floor(seconds));
  const label = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return (
    <span
      className={cx(
        "rounded-lg bg-uq-chip px-2.5 py-1 font-mono text-[13px] font-semibold",
        s < urgentBelow ? "text-uq-primary" : "text-uq-muted",
        className,
      )}
    >
      {label}
    </span>
  );
}
