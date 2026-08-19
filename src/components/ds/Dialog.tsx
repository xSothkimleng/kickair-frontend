"use client";

import { Dialog as Ark, Portal } from "@ark-ui/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";

/**
 * Modal dialog on Ark UI (accessible: focus trap, ESC, aria wiring) styled with
 * Panda. Replaces MUI <Dialog>. Controlled via `open`/`onOpenChange`, or
 * uncontrolled via `trigger`. Raw Ark parts are re-exported as `Dialog` for
 * bespoke layouts.
 */
export { Ark as Dialog, Portal };

const backdropCss = css({
  position: "fixed",
  inset: 0,
  bg: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(2px)",
  zIndex: 1300,
});

const positionerCss = css({
  position: "fixed",
  inset: 0,
  zIndex: 1300,
  display: "flex",
  alignItems: { base: "flex-end", sm: "center" },
  justifyContent: "center",
  p: { base: "0", sm: "4" },
});

const contentBase = css({
  bg: "surface",
  borderRadius: { base: "24px 24px 0 0", sm: "card" },
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
  width: "full",
  maxH: { base: "92vh", sm: "90vh" },
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

const sizeCss = {
  sm: css({ maxW: "400px" }),
  md: css({ maxW: "520px" }),
  lg: css({ maxW: "680px" }),
  xl: css({ maxW: "880px" }),
};

const headerCss = css({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "4",
  px: "6",
  pt: "6",
  pb: "2",
});

const titleCss = css({ fontSize: "18px", fontWeight: 700, color: "heading", margin: 0 });
const descCss = css({ fontSize: "14px", color: "muted", margin: 0, mt: "1" });

const closeBtnCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  w: "32px",
  h: "32px",
  flexShrink: 0,
  borderRadius: "pill",
  color: "muted",
  cursor: "pointer",
  transition: "background-color .15s, color .15s",
  _hover: { bg: "fill", color: "heading" },
});

const bodyCss = css({ px: "6", py: "4", overflowY: "auto", flex: 1 });
const footerCss = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "3",
  px: "6",
  py: "4",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "border",
});

export interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof sizeCss;
  closeOnInteractOutside?: boolean;
  showClose?: boolean;
}

export function Modal({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnInteractOutside = true,
  showClose = true,
}: ModalProps) {
  return (
    <Ark.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(d) => onOpenChange?.(d.open)}
      closeOnInteractOutside={closeOnInteractOutside}
      lazyMount
      unmountOnExit
    >
      {trigger ? <Ark.Trigger asChild>{trigger}</Ark.Trigger> : null}
      <Portal>
        <Ark.Backdrop className={backdropCss} />
        <Ark.Positioner className={positionerCss}>
          <Ark.Content className={cx(contentBase, sizeCss[size])}>
            {(title || description || showClose) && (
              <div className={headerCss}>
                <div>
                  {title ? <Ark.Title className={titleCss}>{title}</Ark.Title> : null}
                  {description ? <Ark.Description className={descCss}>{description}</Ark.Description> : null}
                </div>
                {showClose ? (
                  <Ark.CloseTrigger className={closeBtnCss} aria-label="Close">
                    <X size={18} />
                  </Ark.CloseTrigger>
                ) : null}
              </div>
            )}
            <div className={bodyCss}>{children}</div>
            {footer ? <div className={footerCss}>{footer}</div> : null}
          </Ark.Content>
        </Ark.Positioner>
      </Portal>
    </Ark.Root>
  );
}
