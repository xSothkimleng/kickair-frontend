"use client";

import { useParams, useRouter } from "next/navigation";
import { Box, Container, Typography, Button, CircularProgress, Avatar } from "@mui/material";
import { ChevronLeft, AccessTime } from "@mui/icons-material";
import { tokens } from "@/theme";
import { useCustomOrder } from "@/components/customOrders/hooks";
import { Money, coCard, coLabel, initials } from "@/components/customOrders/kit";
import ReviewOffer from "@/components/customOrders/ReviewOffer";
import Workspace from "@/components/customOrders/Workspace";

const STATUS_TEXT: Record<string, string> = {
  pending: "Your request was sent. You'll be notified when a custom offer arrives.",
  declined: "This request was declined.",
  withdrawn: "This request was withdrawn.",
  expired: "This offer expired before it was accepted.",
};

export default function CustomOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: order, isLoading, error, refetch } = useCustomOrder(id);

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: tokens.canvas, display: "grid", placeItems: "center" }}>
        <CircularProgress sx={{ color: tokens.text }} />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: tokens.canvas, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <Typography sx={{ color: tokens.text2 }}>This custom order could not be found.</Typography>
        <Button onClick={() => router.back()} sx={{ textTransform: "none", borderRadius: "999px", border: `1px solid ${tokens.border}`, color: tokens.text, px: 2 }}>Go back</Button>
      </Box>
    );
  }

  const role = order.viewer_role ?? "client";

  // Accepted → the live milestone workspace (role-aware)
  if (order.status === "accepted") {
    return <Workspace order={order} role={role} />;
  }

  // Offered → client reviews + accepts; freelancer sees a read-only summary
  if (order.status === "offered" && role === "client") {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: tokens.canvas }}>
        <Container disableGutters sx={{ maxWidth: "1080px !important", px: { xs: 2, sm: 4 }, py: { xs: 3, sm: 5 } }}>
          <BackBtn onClick={() => router.push("/dashboard/client/custom-orders")} label="Back to custom orders" />
          <Header order={order} />
          <ReviewOffer order={order} onChanged={() => refetch()} />
        </Container>
      </Box>
    );
  }

  // Everything else → a compact status panel
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: tokens.canvas }}>
      <Container disableGutters sx={{ maxWidth: "720px !important", px: { xs: 2, sm: 4 }, py: { xs: 3, sm: 5 } }}>
        <BackBtn onClick={() => router.push(role === "freelancer" ? "/dashboard/freelancer/custom-requests" : "/dashboard/client/custom-orders")}
          label={role === "freelancer" ? "Back to requests" : "Back to custom orders"} />
        <Header order={order} />

        {order.status === "offered" && role === "freelancer" ? (
          <Box sx={{ ...coCard, p: { xs: 2.5, md: 3 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: "12px 14px", borderRadius: "10px", bgcolor: tokens.pendingTint, color: tokens.pendingText, mb: 2 }}>
              <AccessTime sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>Offer sent — awaiting the client&apos;s decision.</Typography>
            </Box>
            <Typography sx={{ ...coLabel, mb: 1.5 }}>Your milestone plan · {order.milestones.length} phases</Typography>
            {order.milestones.map((m, i) => (
              <Box key={m.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.25, borderBottom: i < order.milestones.length - 1 ? `1px solid ${tokens.border}` : "none" }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{m.seq}. {m.title}</Typography>
                <Money value={m.amount} size={14} weight={600} />
              </Box>
            ))}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1.5, mt: 0.5, borderTop: `1px solid ${tokens.borderStrong}` }}>
              <Typography sx={{ fontWeight: 600 }}>Total</Typography>
              <Money value={order.offer?.total ?? 0} size={18} weight={600} />
            </Box>
          </Box>
        ) : (
          <Box sx={{ ...coCard, p: { xs: 3, md: 4 }, textAlign: "center" }}>
            <Typography sx={{ fontSize: 14.5, color: tokens.text2, lineHeight: 1.6, maxWidth: 420, mx: "auto" }}>
              {STATUS_TEXT[order.status] ?? "This custom order is no longer active."}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

function BackBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button onClick={onClick} startIcon={<ChevronLeft sx={{ fontSize: 16 }} />}
      sx={{ mb: 2, textTransform: "none", fontSize: 13, fontWeight: 500, color: tokens.text2, p: 0, minWidth: 0, "&:hover": { color: tokens.text, bgcolor: "transparent" } }}>
      {label}
    </Button>
  );
}

function Header({ order }: { order: import("@/types/customOrder").CustomOrder }) {
  const other = order.viewer_role === "freelancer" ? order.client.name : order.freelancer.name;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.75, mb: 3 }}>
      <Avatar sx={{ width: 48, height: 48, bgcolor: tokens.text, fontSize: 16, fontWeight: 600 }}>{initials(other)}</Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>{order.service.title ?? "Custom order"}</Typography>
        <Typography sx={{ fontSize: 13, color: tokens.text2 }}>with {other} · <Box component="span" sx={{ fontFamily: tokens.mono }}>${order.budget.toLocaleString()}</Box> budget</Typography>
      </Box>
    </Box>
  );
}
