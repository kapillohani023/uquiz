import type { ButtonHTMLAttributes } from "react";
import { cx } from "./UQuizUtils";

/**
 * Dashed "add" affordance (e.g. "+ New course").
 * `tile` renders the tall grid-cell variant with a large plus glyph.
 */
export type UQuizDashedButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tile?: boolean;
};

export function UQuizDashedButton({
  tile = false,
  className,
  children,
  type = "button",
  ...rest
}: UQuizDashedButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "cursor-pointer border-[1.5px] border-dashed border-uq-border-dashed bg-transparent text-uq-faint transition-colors",
        "hover:border-uq-primary hover:text-uq-primary",
        tile
          ? "flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-[14px] hover:bg-uq-primary-tint"
          : "rounded-xl p-3.5 text-[13px]",
        className,
      )}
      {...rest}
    >
      {tile ? (
        <>
          <span className="text-3xl font-light leading-none">+</span>
          <span className="text-[13px]">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
