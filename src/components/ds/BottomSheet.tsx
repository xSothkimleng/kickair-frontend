"use client";

import { Dialog as Ark, Portal } from "@ark-ui/react";
import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";

/**
 * Bottom sheet on Ark Dialog (focus trap, ESC, aria wiring) styled with Panda.
 * The `anchor="bottom"` counterpart of `ds/Drawer` (which only slides in from the
 * left/right): a bottom drawer with a 20px top radius and a height cap.
 *
 * `children` render directly in the panel (flex column, scrolls when taller than
 * `maxH`), so the caller owns its own header / body / footer chrome.
 */

const backdropCss = css({ position: "fixed", inset: 0, zIndex: 1300, bg: "rgba(0, 0, 0, 0.5)", animation: "fadeIn .16s ease-out" });
const positionerCss = css({ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "flex-end", justifyContent: "center", pointerEvents: "none" });
const panelCss = css({
  pointerEvents: "auto",
  w: "100%",
  bg: "surface",
  borderRadius: "20px 20px 0 0",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  outline: "none",
  boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.18)",
  animation: "slideUp .24s cubic-bezier(.2,.8,.2,1)",
});

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: ReactNode;
  /** Panel height cap , e.g. "88%". */
  maxH?: string;
  closeOnInteractOutside?: boolean;
  closeOnEscape?: boolean;
  /** Extra classes on the panel (layout only — background/radius come from the base). */
  className?: string;
  /** Replaces the default backdrop *look*; position and z-index stay. */
  backdropClassName?: string;
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  maxH = "88%",
  closeOnInteractOutside = true,
  closeOnEscape = true,
  className,
  backdropClassName,
}: BottomSheetProps) {
  return (
    <Ark.Root
      open={open}
      onOpenChange={(d) => onOpenChange(d.open)}
      closeOnInteractOutside={closeOnInteractOutside}
      closeOnEscape={closeOnEscape}
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Ark.Backdrop className={cx(backdropCss, backdropClassName)} />
        <Ark.Positioner className={positionerCss}>
          <Ark.Content className={cx(panelCss, className)} style={{ maxHeight: maxH }}>
            {children}
          </Ark.Content>
        </Ark.Positioner>
      </Portal>
    </Ark.Root>
  );
}
