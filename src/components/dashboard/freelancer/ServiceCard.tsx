"use client";

import { Box, Typography } from "@mui/material";
import {
  EditOutlined,
  VisibilityOutlined,
  DeleteOutlined,
  ReplayOutlined,
  InfoOutlined,
  AccessTimeOutlined,
} from "@mui/icons-material";
import { Service } from "@/types/service";
import { tokens } from "@/theme";
import {
  StatusPill, CategoryPill, KebabMenu, Facts, Banner, CoverThumb, Chevron, mgCardSx,
  type CardTone, type Fact, type MenuAction,
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

export default function ServiceCard({ service, onEdit, onView, onDelete }: ServiceCardProps) {
  const cfg = SERVICE_TONE[service.status] ?? SERVICE_TONE.active;
  const muted = service.status === "disabled" || service.status === "draft";

  const prices = service.pricing_options?.map(o => parseFloat(o.price)).filter(p => p > 0) ?? [];
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const facts: Fact[] = [
    { label: "Orders", value: service.orders_count ? `${service.orders_count} order${service.orders_count === 1 ? "" : "s"}` : "No orders yet", color: service.orders_count ? undefined : tokens.text3 },
    { label: "Price · USD", mono: true, value: prices.length ? `${usd(minPrice)} – ${usd(maxPrice)}` : "—" },
  ];

  const edit: MenuAction = { icon: <EditOutlined sx={{ fontSize: 18 }} />, label: "Edit service", onClick: onEdit };
  const view: MenuAction = { icon: <VisibilityOutlined sx={{ fontSize: 18 }} />, label: service.status === "active" || service.status === "disabled" ? "View public page" : "Preview", onClick: onView };
  const del: MenuAction = { icon: <DeleteOutlined sx={{ fontSize: 18 }} />, label: "Delete service", danger: true, onClick: onDelete };
  const resubmit: MenuAction = { icon: <ReplayOutlined sx={{ fontSize: 18 }} />, label: service.status === "disabled" ? "Request re-review" : "Resubmit for review", onClick: onEdit };
  const menu: MenuAction[] =
    service.status === "rejected" || service.status === "disabled"
      ? [edit, resubmit, view, { sep: true, label: "" }, del]
      : [edit, view, { sep: true, label: "" }, del];

  const banner =
    service.status === "rejected" ? <Banner tone="error" icon={<InfoOutlined sx={{ fontSize: 16 }} />} label="Rejected by admin" text={service.rejection_reason || "No reason provided. Use Resubmit to send it for review again."} />
      : service.status === "disabled" ? <Banner tone="error" icon={<InfoOutlined sx={{ fontSize: 16 }} />} label="Disabled by admin" text={service.rejection_reason || "This service has been taken down. Contact support for details."} />
        : service.status === "pending_review" ? <Banner tone="quiet" icon={<AccessTimeOutlined sx={{ fontSize: 16 }} />} label="Awaiting admin approval — not public yet" />
          : service.status === "draft" ? <Banner tone="quiet" icon={<EditOutlined sx={{ fontSize: 16 }} />} label="Draft — only you can see this" />
            : null;

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => (onView ? onView() : onEdit())}
      sx={{ ...mgCardSx, ...(muted ? { bgcolor: tokens.surface2 } : {}), display: "flex", alignItems: "center", gap: 2.25, p: 2.25 }}>
      <CoverThumb src={service.feature_image?.file_url} size={92} radius={12} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", minWidth: 0, alignItems: "center" }}>
            <CategoryPill>{service.category?.category_name || "Uncategorized"}</CategoryPill>
            <StatusPill tone={cfg.tone} label={cfg.label} />
          </Box>
          <KebabMenu items={menu} />
        </Box>
        <Typography sx={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.25, color: muted ? tokens.text2 : tokens.text }}>{service.title}</Typography>
        <Facts items={facts} />
        {banner}
      </Box>
      <Chevron />
    </Box>
  );
}
