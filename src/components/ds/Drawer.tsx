"use client";

import { Dialog as Ark, Portal } from "@ark-ui/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { css, cva, cx } from "styled-system/css";
import { iconButton } from "./IconButton";

/** Side panel on Ark Dialog (focus trap, ESC, aria). Replaces MUI <Drawer>. */
const backdropCss = css({ position: "fixed", inset: 0, bg: "rgba(0,0,0,0.45)", zIndex: 1300, animation: "fadeIn .16s ease-out" });
const positionerCss = css({ position: "fixed", inset: 0, zIndex: 1300, display: "flex", pointerEvents: "none" });
const panel = cva({
  base: {
    pointerEvents: "auto", bg: "surface", h: "100%", display: "flex", flexDirection: "column", overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)", _focus: { outline: "none" },
  },
  variants: {
    side: {
      right: { ml: "auto", animation: "slideInRight .22s cubic-bezier(.2,.8,.2,1)" },
      left: { mr: "auto", animation: "slideInLeft .22s cubic-bezier(.2,.8,.2,1)" },
    },
    size: { sm: { w: "min(320px, 100vw)" }, md: { w: "min(400px, 100vw)" }, lg: { w: "min(560px, 100vw)" }, full: { w: "100vw" } },
  },
  defaultVariants: { side: "right", size: "md" },
});
const headerCss = css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", px: "20px", py: "16px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "border" });
const titleCss = css({ fontSize: "17px", fontWeight: 700, color: "heading", m: 0 });
const bodyCss = css({ flex: 1, overflowY: "auto", px: "20px", py: "16px" });
const footerCss = css({ px: "20px", py: "14px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "border" });

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg" | "full";
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Render the body without the default padding (e.g. a nav list). */
  flush?: boolean;
  showClose?: boolean;
  className?: string;
}

export function Drawer({ open, onOpenChange, side, size, title, children, footer, flush, showClose = true, className }: DrawerProps) {
  return (
    <Ark.Root open={open} onOpenChange={(d) => onOpenChange(d.open)} lazyMount unmountOnExit>
      <Portal>
        <Ark.Backdrop className={backdropCss} />
        <Ark.Positioner className={positionerCss}>
          <Ark.Content className={cx(panel({ side, size }), className)}>
            {(title || showClose) && (
              <div className={headerCss}>
                {title ? <Ark.Title className={titleCss}>{title}</Ark.Title> : <span />}
                {showClose ? <Ark.CloseTrigger className={iconButton({ size: "sm" })} aria-label="Close"><X size={18} /></Ark.CloseTrigger> : null}
              </div>
            )}
            <div className={cx(bodyCss, flush && css({ p: 0 }))}>{children}</div>
            {footer ? <div className={footerCss}>{footer}</div> : null}
          </Ark.Content>
        </Ark.Positioner>
      </Portal>
    </Ark.Root>
  );
}
