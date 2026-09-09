import type { ReactNode } from "react";
import { css, cva, cx } from "styled-system/css";

export const divider = cva({
  base: { border: "none", m: 0, bg: "border", flexShrink: 0 },
  variants: {
    orientation: {
      horizontal: { w: "100%", h: "1px" },
      vertical: { w: "1px", h: "auto", alignSelf: "stretch" },
    },
  },
  defaultVariants: { orientation: "horizontal" },
});

const withLabel = css({ display: "flex", alignItems: "center", gap: "12px", w: "100%", color: "muted", fontSize: "13px", "& > hr": { flex: 1 } });

/** Replaces MUI <Divider>. Pass `children` for a centred label ("or"). */
export function Divider({ orientation, children, className }: { orientation?: "horizontal" | "vertical"; children?: ReactNode; className?: string }) {
  if (children) {
    return (
      <div role="separator" className={cx(withLabel, className)}>
        <hr className={divider({ orientation: "horizontal" })} />
        <span>{children}</span>
        <hr className={divider({ orientation: "horizontal" })} />
      </div>
    );
  }
  return <hr className={cx(divider({ orientation }), className)} />;
}
