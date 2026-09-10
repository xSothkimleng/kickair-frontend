"use client";

import {
  Check, CircleDollarSign, FileText, Gavel, Paperclip, Play, RotateCcw, Scale, Upload,
  type LucideIcon,
} from "lucide-react";
import { css, cx } from "styled-system/css";
import { text } from "../design";

/**
 * The order's single history surface.
 *
 * Lifecycle events, numbered deliveries and revisions with their files, and
 * dispute rows all live in this one chronological record — shared by the client
 * view, the freelancer view and admin. New event types get a style entry here;
 * they never get a second card elsewhere on the page. A parallel "latest
 * delivery" panel would immediately disagree with this list about what happened.
 */

export type EventType =
  | "created" | "accepted" | "delivered" | "revision_requested"
  | "resubmitted" | "dispute_opened" | "evidence" | "dispute_resolved"
  | "released" | "completed";

const STYLE: Record<EventType, { icon: LucideIcon; fg: string; bg: string }> = {
  created:            { icon: FileText,          fg: "var(--v2-tertiary)",  bg: "rgba(10,10,11,0.05)" },
  accepted:           { icon: Play,              fg: "var(--v2-accent)",    bg: "var(--v2-accentTint)" },
  delivered:          { icon: Upload,            fg: "var(--v2-attention)", bg: "var(--v2-attentionTint)" },
  revision_requested: { icon: RotateCcw,         fg: "var(--v2-attention)", bg: "var(--v2-attentionTint)" },
  resubmitted:        { icon: Upload,            fg: "var(--v2-attention)", bg: "var(--v2-attentionTint)" },
  dispute_opened:     { icon: Gavel,             fg: "var(--v2-danger)",    bg: "var(--v2-dangerTint)" },
  evidence:           { icon: Scale,             fg: "var(--v2-danger)",    bg: "var(--v2-dangerTint)" },
  dispute_resolved:   { icon: Gavel,             fg: "var(--v2-secure)",    bg: "var(--v2-secureTint)" },
  released:           { icon: CircleDollarSign,  fg: "var(--v2-success)",   bg: "var(--v2-successTint)" },
  completed:          { icon: Check,             fg: "var(--v2-success)",   bg: "var(--v2-successTint)" },
};

export interface RecordEvent {
  type: EventType;
  title: string;
  when: string;
  by?: string;
  note?: string;
  files?: string[];
  /** Deliveries, revisions and disputes are numbered per order. */
  index?: number;
}

const list = css({ display: "flex", flexDirection: "column" });

const rowBase = css({ display: "grid", gridTemplateColumns: "1.75rem 1fr", gap: "0.875rem", position: "relative" });

/** The rail is drawn on the row, not behind it, so it stops at the last event. */
const rail = css({
  position: "absolute",
  left: "0.84375rem",
  top: "1.75rem",
  bottom: 0,
  width: "1px",
  bg: "var(--v2-hairline)",
});

const dot = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  w: "1.75rem", h: "1.75rem", borderRadius: "var(--v2-r-pill)", flexShrink: 0,
});

const body = css({ pb: "1.5rem", minWidth: 0 });

const fileChip = css({
  display: "inline-flex", alignItems: "center", gap: "0.3125rem",
  px: "0.5rem", height: "1.625rem", borderRadius: "var(--v2-r-chip)",
  fontSize: "0.6875rem", color: "var(--v2-secondary)", bg: "var(--v2-canvas)",
});

export default function OrderRecord({ events }: { events: RecordEvent[] }) {
  return (
    <div className={list}>
      {events.map((e, i) => {
        const s = STYLE[e.type];
        const Icon = s.icon;
        const last = i === events.length - 1;
        return (
          <div key={`${e.type}-${i}`} className={rowBase}>
            {!last && <span aria-hidden className={rail} />}
            <span className={dot} style={{ background: s.bg, color: s.fg }}>
              <Icon size={14} strokeWidth={2.1} aria-hidden />
            </span>
            <div className={body}>
              <div className={css({ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem" })}>
                <span className={css({ fontSize: "0.875rem", fontWeight: 550, letterSpacing: "-0.008em", color: "var(--v2-primary)" })}>
                  {e.title}
                  {e.index !== undefined && (
                    <span className={css({ color: "var(--v2-tertiary)", fontWeight: 500 })}> #{e.index}</span>
                  )}
                </span>
                <span className={cx(text.caption, css({ color: "var(--v2-tertiary)" }))}>
                  {e.by ? `${e.by} · ` : ""}{e.when}
                </span>
              </div>
              {e.note && (
                <p className={css({ fontSize: "0.8125rem", lineHeight: 1.5, color: "var(--v2-secondary)", mt: "0.3125rem" })}>
                  {e.note}
                </p>
              )}
              {e.files && e.files.length > 0 && (
                <div className={css({ display: "flex", flexWrap: "wrap", gap: "0.375rem", mt: "0.5rem" })}>
                  {e.files.map((f) => (
                    <span key={f} className={fileChip}>
                      <Paperclip size={11} aria-hidden /> {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
