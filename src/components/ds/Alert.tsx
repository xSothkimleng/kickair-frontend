import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { css, cva, cx } from "styled-system/css";
import { iconButton } from "./IconButton";

export const alert = cva({
  base: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    px: "14px",
    py: "12px",
    borderRadius: "input",
    borderWidth: "1px",
    borderStyle: "solid",
    fontSize: "14px",
    lineHeight: 1.5,
    "& svg": { flexShrink: 0 },
  },
  variants: {
    tone: {
      info: { bg: "accentFill", borderColor: "rgba(0,113,227,0.25)", color: "heading", "& > svg": { color: "accent" } },
      success: { bg: "successTint", borderColor: "rgba(22,163,74,0.25)", color: "successText", "& > svg": { color: "success" } },
      warning: { bg: "pendingTint", borderColor: "rgba(234,88,12,0.25)", color: "pendingText", "& > svg": { color: "pending" } },
      error: { bg: "errorTint", borderColor: "rgba(220,38,38,0.25)", color: "errorText", "& > svg": { color: "error" } },
      neutral: { bg: "fill", borderColor: "border", color: "body", "& > svg": { color: "muted" } },
    },
  },
  defaultVariants: { tone: "info" },
});

const ICONS = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle, neutral: Info } as const;

export interface AlertProps {
  tone?: keyof typeof ICONS;
  title?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode | false;
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
}

/** Replaces MUI <Alert severity=…>. */
export function Alert({ tone = "info", title, children, icon, action, onClose, className }: AlertProps) {
  const Icon = ICONS[tone];
  return (
    <div role={tone === "error" || tone === "warning" ? "alert" : "status"} className={cx(alert({ tone }), className)}>
      {icon === false ? null : icon ?? <Icon size={18} className={css({ mt: "1px" })} />}
      <div className={css({ flex: 1, minW: 0 })}>
        {title ? <div className={css({ fontWeight: 600, mb: children ? "2px" : 0 })}>{title}</div> : null}
        {children}
      </div>
      {action}
      {onClose ? (
        <button type="button" onClick={onClose} aria-label="Dismiss" className={cx(iconButton({ size: "xs" }), css({ color: "inherit", mr: "-4px", mt: "-2px", _hover: { bg: "rgba(0,0,0,0.06)", color: "inherit" } }))}>
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
