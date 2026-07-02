"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Avatar, Skeleton, Button } from "@mui/material";
import { ChevronRight, RequestQuoteOutlined } from "@mui/icons-material";
import { tokens } from "@/theme";
import { CustomOrder } from "@/types/customOrder";
import { Money, coCard, Chip, initials } from "@/components/customOrders/kit";
import { useMyCustomOrders } from "@/components/customOrders/hooks";

const STATUS_CHIP: Record<string, { label: string; tone: "neutral" | "pending" | "success" }> = {
  pending: { label: "Awaiting offer", tone: "neutral" },
  offered: { label: "Offer received", tone: "pending" },
  accepted: { label: "Active", tone: "success" },
  declined: { label: "Declined", tone: "neutral" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
};

// Once accepted, the real state lives on the linked order — a completed/cancelled
// order must not keep showing as "Active".
function chipFor(o: CustomOrder): { label: string; tone: "neutral" | "pending" | "success" } {
  if (o.status === "accepted") {
    if (o.order?.status === "completed") return { label: "Completed", tone: "success" };
    if (o.order?.status === "cancelled") return { label: "Ended", tone: "neutral" };
    return { label: "Active", tone: "success" };
  }
  return STATUS_CHIP[o.status] ?? STATUS_CHIP.pending;
}

export default function CustomOrdersContent() {
  const router = useRouter();
  const { data: orders = [], isLoading } = useMyCustomOrders();

  return (
    <Box>
      <Box sx={{ mb: { xs: 2.5, sm: 3.5 } }}>
        <Typography sx={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em" }}>Custom orders</Typography>
        <Typography sx={{ fontSize: 14, color: tokens.text2 }}>Negotiated, off-menu work paid by milestone.</Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={92} sx={{ borderRadius: "16px" }} />)}
        </Box>
      ) : orders.length === 0 ? (
        <Box sx={{ ...coCard, p: { xs: 5, sm: 8 }, textAlign: "center" }}>
          <Box sx={{ maxWidth: 360, mx: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 60, height: 60, borderRadius: "50%", bgcolor: tokens.surface2, border: `1px solid ${tokens.border}`, display: "grid", placeItems: "center" }}>
              <RequestQuoteOutlined sx={{ fontSize: 26, color: tokens.text3 }} />
            </Box>
            <Typography sx={{ fontSize: 18, fontWeight: 600 }}>No custom orders yet</Typography>
            <Typography sx={{ fontSize: 14, color: tokens.text2 }}>
              Need something off-menu? Open a freelancer&apos;s service and use &ldquo;Request a Custom Order&rdquo;.
            </Typography>
            <Button onClick={() => router.push("/explore-services")} sx={{ textTransform: "none", fontWeight: 600, fontSize: 13.5, borderRadius: "999px", bgcolor: tokens.text, color: "#fff", px: 2.5, height: 42, "&:hover": { bgcolor: "rgba(0,0,0,0.82)" } }}>
              Explore services
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {orders.map((o: CustomOrder) => {
            const chip = chipFor(o);
            return (
              <Box key={o.id} onClick={() => router.push(`/dashboard/custom-orders/${o.id}`)}
                sx={{ ...coCard, p: 2.5, display: "flex", alignItems: "center", gap: 2, cursor: "pointer", transition: "border-color .12s, box-shadow .12s", "&:hover": { borderColor: tokens.borderStrong, boxShadow: "0 6px 22px rgba(0,0,0,0.06)" } }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: tokens.text, fontSize: 14, fontWeight: 600 }}>{initials(o.freelancer.name)}</Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.service.title ?? "Custom order"}</Typography>
                    <Chip tone={chip.tone}>{chip.label}</Chip>
                  </Box>
                  <Typography sx={{ fontSize: 13, color: tokens.text2 }}>{o.freelancer.name}</Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Money value={o.escrow.total_value || o.offer?.total || o.budget} size={16} weight={600} />
                  {o.status === "accepted" && <Typography sx={{ fontSize: 11, color: tokens.text3 }}>{o.escrow.percent_released}% released</Typography>}
                </Box>
                <ChevronRight sx={{ fontSize: 20, color: tokens.text3 }} />
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
