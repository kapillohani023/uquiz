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

/** Full-screen translucent overlay with spinner, title, and subtitle. */
export function UQuizLoadingOverlay({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="fixed inset-0 z-60 flex flex-col items-center justify-center gap-[18px] bg-uq-bg/92">
      <UQuizSpinner />
      <div className="text-[15px] font-semibold text-uq-ink">{title}</div>
      {subtitle && <div className="text-[13px] text-uq-faint">{subtitle}</div>}
    </div>
  );
}
