import { cx } from "./UQuizUtils";

/**
 * Four-point sparkle glyph used across the create-quiz flow.
 * Fills with the current text color; `pulse` runs the uq-sparkle animation.
 */
export function UQuizSparkle({
  size = 17,
  pulse,
  className,
}: {
  size?: number;
  pulse?: "fast" | "slow";
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      className={cx(
        "shrink-0 fill-current",
        pulse === "fast" && "animate-uq-sparkle",
        pulse === "slow" && "animate-uq-sparkle-slow",
        className,
      )}
    >
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
    </svg>
  );
}
