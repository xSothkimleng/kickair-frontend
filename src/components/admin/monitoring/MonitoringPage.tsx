"use client";

import {
  Box, Grid, Paper, Typography, Stack, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, LinearProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import StorageIcon from "@mui/icons-material/Storage";
import BoltIcon from "@mui/icons-material/Bolt";
import HistoryIcon from "@mui/icons-material/History";

const SYSTEM_STATUS = [
  { service: "Web Application", status: "Operational", uptime: "99.98%", responseTime: "142ms", color: "success" },
  { service: "API Backend", status: "Operational", uptime: "99.95%", responseTime: "89ms", color: "success" },
  { service: "Database (Primary)", status: "Operational", uptime: "99.99%", responseTime: "12ms", color: "success" },
  { service: "Payment Gateway", status: "Degraded", uptime: "98.20%", responseTime: "2.4s", color: "warning" },
  { service: "File Storage", status: "Operational", uptime: "99.92%", responseTime: "234ms", color: "success" },
  { service: "Email Service", status: "Operational", uptime: "99.88%", responseTime: "1.2s", color: "success" },
];

const ERROR_LOG = [
  { id: 1, severity: "Critical", service: "Payment Gateway", error: "Connection timeout to payment processor", count: 23, firstSeen: "1 hour ago", status: "Investigating" },
  { id: 2, severity: "High", service: "File Upload", error: "S3 bucket permission denied", count: 7, firstSeen: "3 hours ago", status: "Open" },
  { id: 3, severity: "Medium", service: "API", error: "Rate limit exceeded for /api/gigs", count: 145, firstSeen: "5 hours ago", status: "Resolved" },
  { id: 4, severity: "Low", service: "Email", error: "Soft bounce - mailbox full", count: 12, firstSeen: "1 day ago", status: "Monitoring" },
];

const RECENT_ACTIONS = [
  { admin: "Tech Admin Mike", action: "Logged in as user \"sophea@example.com\" to debug checkout issue", timestamp: "15 mins ago", ip: "192.168.1.100" },
  { admin: "Tech Admin Sarah", action: "Cleared cache for user profile pages", timestamp: "1 hour ago", ip: "192.168.1.101" },
  { admin: "Super Admin", action: "Updated commission rate from 18% to 20%", timestamp: "3 hours ago", ip: "192.168.1.99" },
  { admin: "Finance Admin Lisa", action: "Approved payout batch #2847 ($12,450)", timestamp: "5 hours ago", ip: "192.168.1.102" },
  { admin: "Support Admin John", action: "Suspended user \"suspicious_user99\" for policy violation", timestamp: "1 day ago", ip: "192.168.1.103" },
];

const API_METRICS = [
  { endpoint: "/api/gigs/search", calls: "24.5K", avgTime: "124ms", errorRate: "0.2%", status: "Good" },
  { endpoint: "/api/orders/create", calls: "3.2K", avgTime: "456ms", errorRate: "1.8%", status: "Warning" },
  { endpoint: "/api/users/profile", calls: "18.9K", avgTime: "89ms", errorRate: "0.1%", status: "Good" },
  { endpoint: "/api/payments/process", calls: "2.8K", avgTime: "1.2s", errorRate: "3.2%", status: "Critical" },
];

const severityColor = (s: string) => s === "Critical" ? "error" : s === "High" ? "error" : s === "Medium" ? "warning" : "default";
const errorStatusColor = (s: string) => s === "Resolved" ? "success" : s === "Investigating" ? "warning" : s === "Monitoring" ? "primary" : "error";
const apiStatusColor = (s: string) => s === "Good" ? "success" : s === "Warning" ? "warning" : "error";

export default function MonitoringPage() {
  const degraded = SYSTEM_STATUS.filter(s => s.status !== "Operational").length;

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Technical Monitoring & Support Tools</Typography>
        <Typography color="text.secondary">Monitor system health and support operations</Typography>
      </Box>

      {/* Overall Status Banner */}
      <Paper
        variant="outlined"
        sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: degraded > 0 ? "warning.50" : "success.50", borderColor: degraded > 0 ? "warning.200" : "success.200" }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" gap={2}>
            {degraded > 0 ? (
              <WarningIcon sx={{ color: "warning.main", fontSize: 40 }} />
            ) : (
              <CheckCircleIcon sx={{ color: "success.main", fontSize: 40 }} />
            )}
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {degraded > 0 ? `${degraded} Service${degraded > 1 ? "s" : ""} Degraded` : "All Systems Operational"}
              </Typography>
              <Typography variant="body2" color="text.secondary">Last checked: just now</Typography>
            </Box>
          </Stack>
          <Button variant="outlined" size="small">View Status Page</Button>
        </Stack>
      </Paper>

      {/* Service Status Grid */}
      <Typography fontWeight={700} fontSize={17} mb={2}>Service Status</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {SYSTEM_STATUS.map((s, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <StorageIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  <Typography variant="body2" fontWeight={600}>{s.service}</Typography>
                </Stack>
                <Chip label={s.status} size="small" color={s.color as any} />
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">Uptime</Typography>
                  <Typography variant="body2" fontWeight={700}>{s.uptime}</Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="caption" color="text.secondary">Response</Typography>
                  <Typography variant="body2" fontWeight={700} color={s.color === "warning" ? "warning.main" : "text.primary"}>{s.responseTime}</Typography>
                </Box>
              </Stack>
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
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    {["Severity", "Service", "Error", "Count", "First Seen", "Status"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ERROR_LOG.map(e => (
                    <TableRow key={e.id} hover>
                      <TableCell><Chip label={e.severity} size="small" color={severityColor(e.severity) as any} /></TableCell>
                      <TableCell><Typography variant="caption" fontWeight={600}>{e.service}</Typography></TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary" sx={{ maxWidth: 180, display: "block" }}>{e.error}</Typography></TableCell>
                      <TableCell><Chip label={e.count} size="small" /></TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{e.firstSeen}</Typography></TableCell>
                      <TableCell><Chip label={e.status} size="small" color={errorStatusColor(e.status) as any} variant="outlined" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    {["Endpoint", "Calls", "Avg Time", "Error Rate", "Health"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {API_METRICS.map((m, i) => (
                    <TableRow key={i} hover>
                      <TableCell><Typography variant="caption" sx={{ fontFamily: "monospace" }}>{m.endpoint}</Typography></TableCell>
                      <TableCell><Typography variant="caption" fontWeight={600}>{m.calls}</Typography></TableCell>
                      <TableCell><Typography variant="caption">{m.avgTime}</Typography></TableCell>
                      <TableCell>
                        <Typography variant="caption" color={m.status === "Critical" ? "error.main" : m.status === "Warning" ? "warning.main" : "success.main"} fontWeight={600}>
                          {m.errorRate}
                        </Typography>
                      </TableCell>
                      <TableCell><Chip label={m.status} size="small" color={apiStatusColor(m.status) as any} variant="outlined" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    {["Admin", "Action", "Timestamp", "IP Address"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {RECENT_ACTIONS.map((a, i) => (
                    <TableRow key={i} hover>
                      <TableCell><Typography variant="caption" fontWeight={600} color="primary.main">{a.admin}</Typography></TableCell>
                      <TableCell><Typography variant="caption">{a.action}</Typography></TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{a.timestamp}</Typography></TableCell>
                      <TableCell><Typography variant="caption" sx={{ fontFamily: "monospace" }} color="text.secondary">{a.ip}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
