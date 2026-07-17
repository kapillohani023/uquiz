import { cx } from "./UQuizUtils";

const stripes =
  "repeating-linear-gradient(45deg,#f0e9e5,#f0e9e5 10px,#f7f2ef 10px,#f7f2ef 20px)";

/**
 * Striped video placeholder with a red play button.
 * `card` is the tall card-top variant; `row` is the small square list variant.
 */
export function UQuizVideoThumb({
  variant = "card",
  className,
}: {
  variant?: "card" | "row";
  className?: string;
}) {
  if (variant === "row") {
    return (
      <div
        aria-hidden
        className={cx(
          "flex size-[34px] shrink-0 items-center justify-center rounded-lg",
          className,
        )}
        style={{ background: stripes }}
      >
        <div className="ml-0.5 size-0 border-y-[5px] border-l-8 border-y-transparent border-l-uq-primary" />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cx(
        "flex h-[140px] items-center justify-center rounded-t-[13px]",
        className,
      )}
      style={{ background: stripes }}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-uq-primary shadow-[0_2px_8px_rgba(208,52,44,0.35)]">
        <div className="ml-[3px] size-0 border-y-8 border-l-[13px] border-y-transparent border-l-white" />
      </div>
    </div>
  );
}
