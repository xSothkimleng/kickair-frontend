import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { Button } from "./Button";
import { Spinner } from "./Spinner";

const wrap = css({ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "8px", py: "48px", px: "24px" });
const iconWrap = css({ w: "44px", h: "44px", borderRadius: "cardSm", bg: "fill", display: "grid", placeItems: "center", color: "muted", mb: "4px" });
const titleCss = css({ fontSize: "15px", fontWeight: 600, color: "heading" });
const bodyCss = css({ fontSize: "13.5px", color: "muted", maxW: "380px", lineHeight: 1.5 });

export function EmptyState({ icon, title, body, action, className }: { icon?: ReactNode; title: ReactNode; body?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cx(wrap, className)}>
      {icon ? <div className={iconWrap}>{icon}</div> : null}
      <div className={titleCss}>{title}</div>
      {body ? <div className={bodyCss}>{body}</div> : null}
      {action ? <div className={css({ mt: "8px" })}>{action}</div> : null}
    </div>
  );
}

/** Centred spinner + label. Replaces the `<Box textAlign=center><CircularProgress/></Box>` pattern. */
export function Loading({ label = "Loading…", tall, className }: { label?: string; tall?: boolean; className?: string }) {
  return (
    <div className={cx(css({ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", color: "muted", fontSize: "13.5px" }), tall ? css({ py: "96px" }) : css({ py: "40px" }), className)}>
      <Spinner size={20} /> {label}
    </div>
  );
}

export function ErrorState({ title = "Couldn't load this", body, onRetry, className }: { title?: ReactNode; body?: ReactNode; onRetry?: () => void; className?: string }) {
  return <EmptyState className={className} icon={<AlertTriangle size={20} />} title={title} body={body ?? "Check your connection and try again."} action={onRetry ? <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button> : undefined} />;
}
