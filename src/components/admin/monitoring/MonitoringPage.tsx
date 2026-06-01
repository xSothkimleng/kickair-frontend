"use client";

import { Box, Grid, Paper, Typography, Stack } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import BoltIcon from "@mui/icons-material/Bolt";
import StorageIcon from "@mui/icons-material/Storage";
import HistoryIcon from "@mui/icons-material/History";

function EmptyState({ label }: { label: string }) {
  return (
    <Box sx={{ py: 8, textAlign: "center" }}>
      <Typography variant="body2" color="text.disabled">{label}</Typography>
    </Box>
  );
}

export default function MonitoringPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Technical Monitoring & Support Tools</Typography>
        <Typography color="text.secondary">Monitor system health and support operations</Typography>
      </Box>

      {/* Overall Status Banner */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: "grey.50" }}>
        <Stack direction="row" alignItems="center" gap={2}>
          <CheckCircleIcon sx={{ color: "text.disabled", fontSize: 40 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.disabled">Status monitoring not yet connected</Typography>
            <Typography variant="body2" color="text.secondary">System health data coming soon</Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Service Status */}
      <Typography fontWeight={700} fontSize={17} mb={2}>Service Status</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {["Web Application", "API Backend", "Database", "File Storage", "Email Service"].map(service => (
          <Grid key={service} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <StorageIcon fontSize="small" sx={{ color: "text.disabled" }} />
                <Typography variant="body2" fontWeight={600} color="text.secondary">{service}</Typography>
              </Stack>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: "block" }}>Status data not yet available</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Error Log */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <BoltIcon color="error" />
                <Typography fontWeight={700} fontSize={16}>Error Log</Typography>
              </Stack>
            </Box>
            <EmptyState label="Error log not yet connected." />
          </Paper>
        </Grid>

        {/* API Metrics */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <MonitorHeartIcon color="primary" />
                <Typography fontWeight={700} fontSize={16}>API Endpoint Metrics</Typography>
              </Stack>
            </Box>
            <EmptyState label="API metrics not yet connected." />
          </Paper>
        </Grid>

        {/* Audit Log */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <HistoryIcon color="secondary" />
                <Typography fontWeight={700} fontSize={16}>Admin Audit Log</Typography>
              </Stack>
            </Box>
            <EmptyState label="Audit log not yet available." />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
