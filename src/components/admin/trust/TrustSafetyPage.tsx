"use client";

import { Box, Typography } from "@mui/material";
import DisputeReviewSection from "./DisputeReviewSection";
import KycReviewSection from "./KycReviewSection";
import { tokens } from "@/theme";

export default function TrustSafetyPage() {
  return (
    <Box sx={{ p: { xs: 2.5, md: 4 } }}>
      <Box sx={{ maxWidth: 1180, mx: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 600, letterSpacing: "-0.025em" }}>Trust &amp; Safety</Typography>
          <Typography sx={{ fontSize: 14, color: tokens.text2, mt: 0.5 }}>Review disputes and verify identities to keep the marketplace safe.</Typography>
        </Box>

        <DisputeReviewSection />
        <KycReviewSection />
      </Box>
    </Box>
  );
}
