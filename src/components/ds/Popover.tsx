"use client";

import { Popover as Ark, Portal } from "@ark-ui/react";
import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";

/**
 * Anchored popover on Ark (ESC, outside click, focus management). Replaces MUI
 * <Popover>/<Menu> used as a panel (notification bells, wallet chip, filters).
 * `trigger` must be a single element (rendered asChild). Raw parts: PopoverPrimitive.
 */
export { Ark as PopoverPrimitive };

export const popoverContent = css({
  bg: "surface",
  color: "heading",
  borderRadius: "cardSm",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  boxShadow: "0 12px 32px rgba(15,23,42,0.14)",
  outline: "none",
  zIndex: 1400,
  animation: "pop .16s ease-out",
});

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: "bottom-start" | "bottom-end" | "bottom" | "top-start" | "top-end" | "top" | "left" | "right";
  gutter?: number;
  /** Set false when the popover lives inside a MUI Dialog (its focus trap fights portals). */
  portalled?: boolean;
  className?: string;
}

export function Popover({ trigger, children, open, onOpenChange, placement = "bottom-end", gutter = 8, portalled = true, className }: PopoverProps) {
  const body = (
    <Ark.Positioner className={css({ zIndex: 1400 })}>
      <Ark.Content className={cx(popoverContent, className)}>{children}</Ark.Content>
    </Ark.Positioner>
  );
  return (
    <Ark.Root open={open} onOpenChange={(d) => onOpenChange?.(d.open)} positioning={{ placement, gutter, strategy: "fixed" }} portalled={portalled} lazyMount unmountOnExit>
      <Ark.Trigger asChild>{trigger}</Ark.Trigger>
      {portalled ? <Portal>{body}</Portal> : body}
    </Ark.Root>
  );
}
