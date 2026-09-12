"use client";

import { type ReactNode } from "react";
import { Eye, Info, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { css, cva, cx } from "styled-system/css";
import { Service } from "@/types/service";
import { serviceCoverUrl } from "@/lib/serviceCover";
import {
  StatusPill, Facts, Banner, CoverThumb, Chevron, mgCard,
  type CardTone, type Fact,
} from "@/components/dashboard/ManagementCard";

interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

const SERVICE_TONE: Record<Service["status"], { tone: CardTone; label: string }> = {
  active: { tone: "success", label: "Active" },
  pending_review: { tone: "pending", label: "Pending review" },
  rejected: { tone: "error", label: "Rejected" },
  draft: { tone: "neutral", label: "Draft" },
  disabled: { tone: "neutral", label: "Disabled" },
};

const usd = (v: string | number) => "$" + Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 });

// `[data-muted]` (draft/disabled) swaps the surface: the attribute selector outranks `mgCard`'s own `bg`.
const cardLayout = css({ display: "flex", alignItems: "center", gap: "18px", p: "18px", "&[data-muted]": { bg: "#FBFBFD" } });
const cardBody = css({ display: "flex", flexDirection: "column", gap: "12px", flex: 1, minW: 0 });
const topRow = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" });
const titleWrap = css({ display: "flex", gap: "8px", flexWrap: "wrap", minW: 0, alignItems: "center" });
const titleText = cva({
  base: { fontSize: "17px", fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.25 },
  variants: { muted: { true: { color: "ink2" }, false: { color: "ink" } } },
});
const actionsWrap = css({ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end", flex: "none" });

/* MUI `Button size="small"` metrics with the card's own tones. */
const actionBtn = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    boxSizing: "border-box",
    m: 0,
    p: "4px 11px",
    h: "30px",
    minW: 0,
    flex: "none",
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: "8px",
    fontFamily: "inherit",
    fontSize: "12.5px",
    fontWeight: 600,
    lineHeight: 1.75,
    whiteSpace: "nowrap",
    cursor: "pointer",
    transition: "background-color .25s, border-color .25s, color .25s",
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
    "& svg": { flexShrink: 0 },
  },
  variants: {
    tone: {
      quiet: {
        color: "ink2",
        bg: "transparent",
        borderColor: "hairline",
        _hover: { bg: "surface2", color: "ink", borderColor: "hairlineStrong" },
      },
      emphasis: {
        color: "#fff",
        bg: "#111",
        borderColor: "#111",
        _hover: { bg: "rgba(0,0,0,0.8)", color: "#fff", borderColor: "rgba(0,0,0,0.8)" },
      },
      danger: {
        color: "errorText",
        bg: "transparent",
        borderColor: "rgba(220,38,38,0.28)",
        _hover: { bg: "errorTint", color: "errorText", borderColor: "rgba(220,38,38,0.4)" },
      },
    },
  },
  defaultVariants: { tone: "quiet" },
});

/* Visible card action — never bubbles the click up to the whole-card navigation. */
function ActionButton({ icon, label, danger, emphasis, onClick }: { icon: ReactNode; label: string; danger?: boolean; emphasis?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onClick?.(); }}
      className={actionBtn({ tone: danger ? "danger" : emphasis ? "emphasis" : "quiet" })}>
      {icon}
      {label}
    </button>
  );
}

export default function ServiceCard({ service, onEdit, onView, onDelete }: ServiceCardProps) {
  const cfg = SERVICE_TONE[service.status] ?? SERVICE_TONE.active;
  const muted = service.status === "disabled" || service.status === "draft";
  const needsResubmit = service.status === "rejected" || service.status === "disabled";

  const prices = service.pricing_options?.map(o => parseFloat(o.price)).filter(p => p > 0) ?? [];
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const facts: Fact[] = [
    { label: "Orders", value: service.orders_count ? `${service.orders_count} order${service.orders_count === 1 ? "" : "s"}` : "No orders yet", color: service.orders_count ? undefined : "rgba(0, 0, 0, 0.4)" },
    { label: "Price · USD", mono: true, value: prices.length ? `${usd(minPrice)} – ${usd(maxPrice)}` : "—" },
  ];

  const banner =
    service.status === "rejected" ? <Banner tone="error" icon={<Info size={16} />} label="Rejected by admin" text={service.rejection_reason || "No reason provided. Use Resubmit to send it for review again."} />
      : service.status === "disabled" ? <Banner tone="error" icon={<Info size={16} />} label="Disabled by admin" text={service.rejection_reason || "This service has been taken down. Contact support for details."} />
        : service.status === "draft" ? <Banner tone="quiet" icon={<Pencil size={16} />} label="Draft — only you can see this" />
          : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => (onView ? onView() : onEdit())}
      className={cx(mgCard, cardLayout)}
      data-muted={muted ? "" : undefined}>
      <CoverThumb src={serviceCoverUrl(service)} size={92} radius={12} />
      <div className={cardBody}>
        <div className={topRow}>
          <div className={titleWrap}>
            <p className={titleText({ muted })}>{service.title}</p>
            <StatusPill tone={cfg.tone} label={cfg.label} />
          </div>
          {/* Visible actions (replaces the old kebab menu) */}
          <div onClick={e => e.stopPropagation()} className={actionsWrap}>
            {needsResubmit && (
              <ActionButton
                emphasis
                icon={<RotateCcw size={16} />}
                label={service.status === "disabled" ? "Request re-review" : "Resubmit for review"}
                onClick={onEdit}
              />
            )}
            <ActionButton icon={<Pencil size={16} />} label="Edit" onClick={onEdit} />
            <ActionButton icon={<Eye size={16} />} label="View" onClick={onView} />
            <ActionButton danger icon={<Trash2 size={16} />} label="Delete" onClick={onDelete} />
          </div>
        </div>
        <Facts items={facts} />
        {banner}
      </div>
      <Chevron />
    </div>
  );
}
