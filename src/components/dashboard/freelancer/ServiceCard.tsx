"use client";

import { type ReactNode } from "react";
import { Box, Typography, Button } from "@mui/material";
import {
  EditOutlined,
  VisibilityOutlined,
  DeleteOutlined,
  ReplayOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { Service } from "@/types/service";
import { tokens } from "@/theme";
import { serviceCoverUrl } from "@/lib/serviceCover";
import {
  StatusPill, Facts, Banner, CoverThumb, Chevron, mgCardSx,
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

/* Visible card action — never bubbles the click up to the whole-card navigation. */
function ActionButton({ icon, label, danger, emphasis, onClick }: { icon: ReactNode; label: string; danger?: boolean; emphasis?: boolean; onClick?: () => void }) {
  return (
    <Button
      size="small"
      startIcon={icon}
      onClick={e => { e.stopPropagation(); onClick?.(); }}
      sx={{
        height: 30,
        px: 1.375,
        minWidth: 0,
        flex: "none",
        borderRadius: "8px",
        fontSize: 12.5,
        fontWeight: 600,
        textTransform: "none",
        whiteSpace: "nowrap",
        color: danger ? tokens.errorText : emphasis ? "#fff" : tokens.text2,
        bgcolor: emphasis ? "#111" : "transparent",
        border: `1px solid ${danger ? "rgba(220,38,38,0.28)" : emphasis ? "#111" : tokens.border}`,
        "& .MuiButton-startIcon": { mr: 0.625, ml: 0 },
        "&:hover": {
          bgcolor: danger ? tokens.errorTint : emphasis ? "rgba(0,0,0,0.8)" : tokens.surface2,
          color: danger ? tokens.errorText : emphasis ? "#fff" : tokens.text,
          borderColor: danger ? "rgba(220,38,38,0.4)" : emphasis ? "rgba(0,0,0,0.8)" : tokens.borderStrong,
        },
      }}>
      {label}
    </Button>
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
    { label: "Orders", value: service.orders_count ? `${service.orders_count} order${service.orders_count === 1 ? "" : "s"}` : "No orders yet", color: service.orders_count ? undefined : tokens.text3 },
    { label: "Price · USD", mono: true, value: prices.length ? `${usd(minPrice)} – ${usd(maxPrice)}` : "—" },
  ];

  const banner =
    service.status === "rejected" ? <Banner tone="error" icon={<InfoOutlined sx={{ fontSize: 16 }} />} label="Rejected by admin" text={service.rejection_reason || "No reason provided. Use Resubmit to send it for review again."} />
      : service.status === "disabled" ? <Banner tone="error" icon={<InfoOutlined sx={{ fontSize: 16 }} />} label="Disabled by admin" text={service.rejection_reason || "This service has been taken down. Contact support for details."} />
        : service.status === "draft" ? <Banner tone="quiet" icon={<EditOutlined sx={{ fontSize: 16 }} />} label="Draft — only you can see this" />
          : null;

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => (onView ? onView() : onEdit())}
      sx={{ ...mgCardSx, ...(muted ? { bgcolor: tokens.surface2 } : {}), display: "flex", alignItems: "center", gap: 2.25, p: 2.25 }}>
      <CoverThumb src={serviceCoverUrl(service)} size={92} radius={12} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", minWidth: 0, alignItems: "center" }}>
            <Typography sx={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.25, color: muted ? tokens.text2 : tokens.text }}>{service.title}</Typography>
            <StatusPill tone={cfg.tone} label={cfg.label} />
          </Box>
          {/* Visible actions (replaces the old kebab menu) */}
          <Box onClick={e => e.stopPropagation()} sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", justifyContent: "flex-end", flex: "none" }}>
            {needsResubmit && (
              <ActionButton
                emphasis
                icon={<ReplayOutlined sx={{ fontSize: 16 }} />}
                label={service.status === "disabled" ? "Request re-review" : "Resubmit for review"}
                onClick={onEdit}
              />
            )}
            <ActionButton icon={<EditOutlined sx={{ fontSize: 16 }} />} label="Edit" onClick={onEdit} />
            <ActionButton icon={<VisibilityOutlined sx={{ fontSize: 16 }} />} label="View" onClick={onView} />
            <ActionButton danger icon={<DeleteOutlined sx={{ fontSize: 16 }} />} label="Delete" onClick={onDelete} />
          </Box>
        </Box>
        <Facts items={facts} />
        {banner}
      </Box>
      <Chevron />
    </Box>
  );
}
