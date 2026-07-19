import Image from "next/image";
import { cx } from "./UQuizUtils";

const stripes =
  "repeating-linear-gradient(45deg,#f0e9e5,#f0e9e5 10px,#f7f2ef 10px,#f7f2ef 20px)";
const stripesSmall =
  "repeating-linear-gradient(45deg,#f0e9e5,#f0e9e5 6px,#f7f2ef 6px,#f7f2ef 12px)";

/**
 * Video thumbnail. Renders the real thumbnail when `src` is given, otherwise
 * a striped placeholder with a red play button.
 * `card` is the tall card-top variant; `row` is the small square list variant.
 */
export function UQuizVideoThumb({
  variant = "card",
  src,
  alt = "",
  className,
}: {
  variant?: "card" | "row";
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  if (variant === "row") {
    return (
      <div
        aria-hidden={src ? undefined : true}
        className={cx(
          "relative flex size-[34px] shrink-0 items-center justify-center overflow-hidden rounded-lg",
          className,
        )}
        style={src ? undefined : { background: stripesSmall }}
      >
        {src ? (
          <Image src={src} alt={alt} fill sizes="34px" className="object-cover" />
        ) : (
          <div className="ml-0.5 size-0 border-y-[5px] border-l-8 border-y-transparent border-l-uq-primary" />
        )}
      </div>
    );
  }

  return (
    <div
      aria-hidden={src ? undefined : true}
      className={cx(
        "relative flex h-[140px] items-center justify-center overflow-hidden rounded-t-[13px]",
        className,
      )}
      style={src ? undefined : { background: stripes }}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes="300px" className="object-cover" />
      ) : (
        <div className="flex size-11 items-center justify-center rounded-full bg-uq-primary shadow-[0_2px_8px_rgba(208,52,44,0.35)]">
          <div className="ml-[3px] size-0 border-y-8 border-l-[13px] border-y-transparent border-l-white" />
        </div>
      )}
    </div>
  );
}
