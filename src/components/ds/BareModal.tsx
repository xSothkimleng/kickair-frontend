"use client";

import { Dialog as Ark, Portal } from "@ark-ui/react";
import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";

/**
 * `Modal` without the built-in header / body / footer chrome. Same Ark Dialog
 * foundation (focus trap, ESC, aria wiring, scroll lock) and the same backdrop,
 * z-index and panel treatment as `Modal`, but `children` render directly inside
 * the panel so bespoke dialogs (payment result cards, the simulated ABA PayWay
 * popup, the purchase gate) own their padding and header. Replaces MUI
 * `<Dialog fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius } }}>`.
 *
 * `maxW` is the panel width (MUI `xs` = 444px). Compose `Dialog.Title` /
 * `Dialog.CloseTrigger` from `@/components/ds` inside for labelled dialogs.
 */

const backdropLayout = css({ position: "fixed", inset: 0, zIndex: 1300 });
const backdropLook = css({ bg: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(2px)" });

const positionerCss = css({
  position: "fixed",
  inset: 0,
  zIndex: 1300,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  p: "16px",
});

const contentCss = css({
  bg: "surface",
  borderRadius: "card",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
  width: "full",
  maxH: "100%",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  outline: "none",
});

export interface BareModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  /** Panel max width, e.g. "444px" (MUI `xs`, the default), "420px", "440px". */
  maxW?: string;
  closeOnInteractOutside?: boolean;
  closeOnEscape?: boolean;
  /** Extra classes on the panel (layout only — background/radius/shadow come from the base). */
  className?: string;
  /** Replaces the default backdrop *look* (colour/blur); position and z-index stay. */
  backdropClassName?: string;
  /** Stable element ids, e.g. `{ title: "purchase-gate-heading" }` for `Dialog.Title`. */
  ids?: { content?: string; title?: string; description?: string };
}

export function BareModal({
  open,
  onOpenChange,
  children,
  maxW = "444px",
  closeOnInteractOutside = true,
  closeOnEscape = true,
  className,
  backdropClassName,
  ids,
}: BareModalProps) {
  return (
    <Ark.Root
      open={open}
      onOpenChange={(d) => onOpenChange?.(d.open)}
      closeOnInteractOutside={closeOnInteractOutside}
      closeOnEscape={closeOnEscape}
      ids={ids}
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Ark.Backdrop className={cx(backdropLayout, backdropClassName ?? backdropLook)} />
        <Ark.Positioner className={positionerCss}>
          <Ark.Content className={cx(contentCss, className)} style={{ maxWidth: maxW }}>
            {children}
          </Ark.Content>
        </Ark.Positioner>
      </Portal>
    </Ark.Root>
  );
}
