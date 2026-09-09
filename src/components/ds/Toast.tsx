"use client";

import { Toast as Ark, Toaster, createToaster } from "@ark-ui/react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { iconButton } from "./IconButton";

/**
 * App-wide toasts on Ark Toast. Replaces MUI <Snackbar>/<Alert> stacks.
 * Mount <AppToaster /> once (root layout) and call `toast.success("…")` anywhere.
 */
export const toaster = createToaster({ placement: "top-end", overlap: false, gap: 10, max: 4, offsets: { top: "80px", right: "16px", bottom: "16px", left: "16px" } });

type Tone = "info" | "success" | "warning" | "error";
const ICONS = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle } as const;
const ICON_COLOR = { info: css({ color: "accent" }), success: css({ color: "success" }), warning: css({ color: "pending" }), error: css({ color: "error" }) } as const;

export interface ToastInput { title?: ReactNode; description?: ReactNode; duration?: number; icon?: ReactNode }
function push(tone: Tone, input: ToastInput | string) {
  const o = typeof input === "string" ? { title: input } : input;
  return toaster.create({ title: o.title as string | undefined, description: o.description as string | undefined, type: tone, duration: o.duration ?? 5000, meta: { icon: o.icon } });
}
export const toast = {
  info: (i: ToastInput | string) => push("info", i),
  success: (i: ToastInput | string) => push("success", i),
  warning: (i: ToastInput | string) => push("warning", i),
  error: (i: ToastInput | string) => push("error", i),
  dismiss: (id?: string) => toaster.dismiss(id),
};

const rootCss = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  minW: "280px",
  maxW: "380px",
  px: "14px",
  py: "12px",
  bg: "surface",
  color: "heading",
  borderRadius: "input",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
  // Ark drives position/stacking through these vars.
  translate: "var(--x) var(--y)",
  scale: "var(--scale)",
  zIndex: "var(--z-index)",
  height: "var(--height)",
  opacity: "var(--opacity)",
  willChange: "translate, opacity, scale",
  transition: "translate .3s, scale .3s, opacity .3s, height .3s",
  "& svg": { flexShrink: 0 },
});
const titleCss = css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.3, m: 0 });
const descCss = css({ fontSize: "12px", color: "muted", lineHeight: 1.4, m: 0, mt: "2px" });

export function AppToaster() {
  return (
    <Toaster toaster={toaster}>
      {(t) => {
        const tone = (t.type as Tone) in ICONS ? (t.type as Tone) : "info";
        const Icon = ICONS[tone];
        const custom = (t.meta as { icon?: ReactNode } | undefined)?.icon;
        return (
          <Ark.Root key={t.id} className={rootCss}>
            {custom ?? <Icon size={18} className={cx(ICON_COLOR[tone], css({ mt: "1px" }))} />}
            <div className={css({ flex: 1, minW: 0 })}>
              {t.title ? <Ark.Title className={titleCss}>{t.title}</Ark.Title> : null}
              {t.description ? <Ark.Description className={descCss}>{t.description}</Ark.Description> : null}
            </div>
            <Ark.CloseTrigger className={cx(iconButton({ size: "xs" }), css({ mr: "-4px", mt: "-2px" }))} aria-label="Dismiss"><X size={14} /></Ark.CloseTrigger>
          </Ark.Root>
        );
      }}
    </Toaster>
  );
}
