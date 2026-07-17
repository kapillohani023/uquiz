import { cx } from "./UQuizUtils";

const sizes = {
  sm: "text-[22px]",
  lg: "text-[34px]",
} as const;

export function UQuizLogo({
  size = "sm",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "font-bold tracking-[-0.5px] text-uq-ink select-none",
        sizes[size],
        className,
      )}
    >
      u<span className="text-uq-primary">quiz</span>
    </span>
  );
}
