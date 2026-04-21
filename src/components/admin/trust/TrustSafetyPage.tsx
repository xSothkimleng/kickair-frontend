"use client";

import {
  Box, Paper, Typography, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import ReportIcon from "@mui/icons-material/Report";
import GavelIcon from "@mui/icons-material/Gavel";
import DisputeReviewSection from "./DisputeReviewSection";
import KycReviewSection from "./KycReviewSection";


const RISK_SIGNALS = [
  { id: 1, user: "SuspiciousUser99", issue: "Multiple accounts from same IP", severity: "Critical", details: "3 accounts detected from IP 123.45.67.89", flagged: "30 mins ago" },
  { id: 2, user: "HighDispute Seller", issue: "Excessive disputes", severity: "High", details: "8 disputes in last 30 days (platform avg: 0.2)", flagged: "2 hours ago" },
  { id: 3, user: "BigWithdrawal User", issue: "Large sudden withdrawal", severity: "Medium", details: "Attempted withdrawal of $15,000 (10x avg)", flagged: "1 day ago" },
  { id: 4, user: "CardPattern123", issue: "Potential stolen card pattern", severity: "Critical", details: "Multiple failed payments from different cards", flagged: "3 hours ago" },
];

const CONTENT_MOD = [
  { id: 1, type: "Gig", content: "Get 1000 Instagram followers - GUARANTEED!!!", reporter: "System", reason: "Spam/Misleading", time: "1 hour ago" },
  { id: 2, type: "Message", content: "Hey, let's continue this on WhatsApp: +855...", reporter: "buyer123", reason: "Off-platform communication", time: "3 hours ago" },
  { id: 3, type: "Gig Image", content: "[Image flagged by AI]", reporter: "System AI", reason: "Inappropriate content", time: "5 hours ago" },
  { id: 4, type: "Review", content: "This seller is a thief! Scam! Report to police!", reporter: "seller456", reason: "Harassment/Defamation", time: "2 days ago" },
];

const POLICY_ACTIONS = [
  { id: 1, template: "First Warning", description: "Send warning email for minor policy violation", usage: 234 },
  { id: 2, template: "Temporary Suspension (7 days)", description: "Suspend account for 7 days", usage: 45 },
  { id: 3, template: "Temporary Suspension (30 days)", description: "Suspend account for 30 days", usage: 12 },
  { id: 4, template: "Permanent Ban", description: "Permanently ban user from platform", usage: 8 },
  { id: 5, template: "KYC Re-verification Required", description: "Require user to re-submit KYC documents", usage: 67 },
];

const riskColor = (r: string) => r === "Critical" ? "error" : r === "High" ? "error" : r === "Medium" ? "warning" : "success";

export default function TrustSafetyPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Trust, Safety & Verification</Typography>
        <Typography color="text.secondary">Maintain platform integrity and user safety</Typography>
      </Box>

      {/* Dispute Review */}
      <DisputeReviewSection />

      {/* KYC Queue */}
      <KycReviewSection />

      {/* Risk Signals */}
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                {["User", "Issue", "Severity", "Details", "Flagged", "Actions"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {RISK_SIGNALS.map(r => (
                <TableRow key={r.id} hover>
                  <TableCell><Typography variant="body2" fontWeight={600}>{r.user}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{r.issue}</Typography></TableCell>
                  <TableCell><Chip label={r.severity} size="small" color={riskColor(r.severity) as any} /></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{r.details}</Typography></TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{r.flagged}</Typography></TableCell>
                  <TableCell>
                    <Stack direction="row" gap={1}>
                      <Button size="small" variant="outlined">Investigate</Button>
                      <Button size="small" variant="contained" color="error">Suspend</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                {["Type", "Content", "Reporter", "Reason", "Reported", "Actions"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {CONTENT_MOD.map(c => (
                <TableRow key={c.id} hover>
                  <TableCell><Chip label={c.type} size="small" color="primary" variant="outlined" /></TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 280 }}>{c.content}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{c.reporter}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{c.reason}</Typography></TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{c.time}</Typography></TableCell>
                  <TableCell>
                    <Stack direction="row" gap={1}>
                      <Button size="small" variant="contained" color="error">Remove</Button>
                      <Button size="small" variant="outlined">Dismiss</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Policy Action Templates */}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <GavelIcon color="secondary" />
            <Typography fontWeight={700} fontSize={17}>Policy Action Templates</Typography>
          </Stack>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                {["Template", "Description", "Times Used", "Actions"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {POLICY_ACTIONS.map(p => (
                <TableRow key={p.id} hover>
                  <TableCell><Typography variant="body2" fontWeight={600}>{p.template}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{p.description}</Typography></TableCell>
                  <TableCell><Chip label={p.usage} size="small" color="default" /></TableCell>
                  <TableCell><Button size="small" variant="outlined">Apply</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
