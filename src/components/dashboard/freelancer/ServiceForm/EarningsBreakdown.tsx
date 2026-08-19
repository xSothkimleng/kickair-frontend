import { Box, Paper, Typography } from "@mui/material";
import { ServiceFormData } from "../types";
import { useCommissionRate } from "@/hooks/useCommissionRate";

/**
 * The transparent price breakdown shown before the freelancer agrees to the
 * Terms: for each enabled tier — what the client pays, KickAir's commission,
 * and what actually lands in the freelancer's wallet.
 */
export default function EarningsBreakdown({ pricing }: { pricing: ServiceFormData["pricing"] }) {
  const rate = useCommissionRate();

  const tiers = (["basic", "standard", "premium"] as const)
    .filter(t => pricing[t].enabled && parseFloat(pricing[t].price) > 0)
    .map(t => ({ tier: t, price: parseFloat(pricing[t].price) }));

  if (rate == null || tiers.length === 0) return null;

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
      <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 0.5 }}>Your earnings per order</Typography>
      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 2.5 }}>
        Clients always pay your exact price — KickAir&apos;s {Math.round(rate * 100)}% commission comes out of your side.
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: `repeat(${tiers.length}, 1fr)` }, gap: 1.5 }}>
        {tiers.map(({ tier, price }) => {
          const commission = price * rate;
          const net = price - commission;
          return (
            <Box key={tier} sx={{ p: 2, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 3 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: "capitalize", mb: 1.25 }}>{tier}</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: 12.5, color: "rgba(0,0,0,0.6)" }}>Client pays</Typography>
                  <Typography sx={{ fontSize: 12.5, fontFamily: "monospace", fontWeight: 600 }}>${price.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: 12.5, color: "rgba(0,0,0,0.6)" }}>Platform fee ({Math.round(rate * 100)}%)</Typography>
                  <Typography sx={{ fontSize: 12.5, fontFamily: "monospace", fontWeight: 600, color: "#B45309" }}>−${commission.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ height: 1, bgcolor: "rgba(0,0,0,0.08)", my: 0.25 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>You receive</Typography>
                  <Typography sx={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: "#166534" }}>${net.toFixed(2)}</Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
