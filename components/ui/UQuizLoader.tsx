import { cx } from "./UQuizUtils";
import { UQuizSpinner } from "./UQuizSpinner";

/**
 * Centered loading state: spinner with optional title/subtitle, per the
 * "Generating quiz…" design. Used by route `loading.tsx` files and overlays.
 */
export function UQuizLoader({
  title,
  subtitle,
  className,
}: {
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center gap-[18px]",
        className,
      )}
    >
      <UQuizSpinner />
      {title && (
        <div className="text-[15px] font-semibold text-uq-ink">{title}</div>
      )}
      {subtitle && <div className="text-[13px] text-uq-faint">{subtitle}</div>}
    </div>
  );
}

/** Full-screen translucent overlay variant (e.g. while a quiz generates). */
export function UQuizLoadingOverlay({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <UQuizLoader
      title={title}
      subtitle={subtitle}
      className="fixed inset-0 z-60 bg-uq-bg/92"
    />
  );
}
