"use client";

import { Box, Paper, Typography, Stack } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import ReportIcon from "@mui/icons-material/Report";
import GavelIcon from "@mui/icons-material/Gavel";
import DisputeReviewSection from "./DisputeReviewSection";
import KycReviewSection from "./KycReviewSection";

function EmptyState({ label }: { label: string }) {
  return (
    <Box sx={{ py: 8, textAlign: "center" }}>
      <Typography variant="body2" color="text.disabled">{label}</Typography>
    </Box>
  );
}

export default function TrustSafetyPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Trust, Safety & Verification</Typography>
        <Typography color="text.secondary">Maintain platform integrity and user safety</Typography>
      </Box>

      {/* Dispute Review — real API */}
      <DisputeReviewSection />

      {/* KYC Queue — real API */}
      <KycReviewSection />

      {/* Risk & Fraud Signals */}
      <Paper variant="outlined" sx={{ borderRadius: 2, mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <WarningIcon color="warning" />
            <Box>
              <Typography fontWeight={700} fontSize={17}>Risk & Fraud Signals</Typography>
              <Typography variant="body2" color="text.secondary">Auto-flagged suspicious user behaviors</Typography>
            </Box>
          </Stack>
        </Box>
        <EmptyState label="Automated risk detection not yet connected." />
      </Paper>

      {/* Content Moderation */}
      <Paper variant="outlined" sx={{ borderRadius: 2, mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <ReportIcon color="error" />
            <Box>
              <Typography fontWeight={700} fontSize={17}>Content Moderation Queue</Typography>
              <Typography variant="body2" color="text.secondary">Flagged content awaiting review</Typography>
            </Box>
          </Stack>
        </Box>
        <EmptyState label="Content moderation queue not yet available." />
      </Paper>

      {/* Policy Action Templates */}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <GavelIcon color="secondary" />
            <Typography fontWeight={700} fontSize={17}>Policy Action Templates</Typography>
          </Stack>
        </Box>
        <EmptyState label="Policy action templates coming soon." />
      </Paper>
    </Box>
  );
}
