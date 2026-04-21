"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BadgeIcon from "@mui/icons-material/Badge";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { api, AdminDashboardStats } from "@/lib/api";
import Link from "next/link";

// ─── Static mock sections (no backend yet) ───────────────────────────────────

const HEALTH_ALERTS = [
  { type: "info", message: "Health monitoring not yet connected — coming soon.", time: "" },
];

const RECENT_ACTIVITY = [
  { user: "—", action: "Audit log not yet available.", time: "", admin: "" },
];

const alertColors: Record<string, { bg: string; border: string }> = {
  critical: { bg: "#fef2f2", border: "#ef4444" },
  warning:  { bg: "#fffbeb", border: "#f59e0b" },
  info:     { bg: "#eff6ff", border: "#3b82f6" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(amount: string): string {
  return `$${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  loading,
  color = "primary",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  loading: boolean;
  color?: string;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, "&:hover": { boxShadow: 3 }, transition: "box-shadow 0.2s" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box sx={{ p: 1.5, bgcolor: `${color}.50`, borderRadius: 2 }}>
          <Icon sx={{ color: `${color}.main`, fontSize: 24 }} />
        </Box>
      </Stack>
      {loading ? (
        <Skeleton variant="text" width={80} height={40} />
      ) : (
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
      )}
      <Typography variant="body2" color="text.secondary" mt={0.5}>{label}</Typography>
    </Paper>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getAdminDashboardStats()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const metrics = stats
    ? [
        { label: "Total Users", value: stats.users.total.toLocaleString(), icon: PeopleIcon, color: "primary" },
        { label: "New Users Today", value: stats.users.new_today, icon: PeopleIcon, color: "primary" },
        { label: "New Freelancers Today", value: stats.users.new_freelancers_today, icon: PeopleIcon, color: "secondary" },
        { label: "New Clients Today", value: stats.users.new_clients_today, icon: PeopleIcon, color: "secondary" },
        { label: "Active Orders", value: stats.orders.active.toLocaleString(), icon: WorkIcon, color: "warning" },
        { label: "Completed Orders Today", value: stats.orders.completed_today, icon: CheckCircleIcon, color: "success" },
        { label: "GMV Today", value: fmt(stats.gmv.today), icon: AttachMoneyIcon, color: "success" },
        { label: "Total GMV (All Time)", value: fmt(stats.gmv.total), icon: AttachMoneyIcon, color: "success" },
      ]
    : Array(8).fill(null);

  const quickActions = stats
    ? [
        { label: "Review Pending Withdrawals", count: stats.withdrawals.pending_count, color: "primary", href: "/admin/payments" },
        { label: "Approve KYC", count: stats.kyc.pending_count, color: "secondary", href: "/admin/trust" },
        { label: "Total Completed Orders", count: stats.orders.total_completed, color: "success", href: "#" },
      ]
    : [];

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Dashboard Overview</Typography>
        <Typography color="text.secondary">Monitor your KickAir marketplace in real-time</Typography>
      </Box>

      {error && (
        <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2, borderColor: "error.main" }}>
          <Typography color="error">Failed to load dashboard stats. Please refresh.</Typography>
        </Paper>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {(stats ? metrics : Array(8).fill(null)).map((metric, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
            {metric ? (
              <MetricCard
                label={metric.label}
                value={metric.value}
                icon={metric.icon}
                loading={loading}
                color={metric.color}
              />
            ) : (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Skeleton variant="rectangular" height={24} width={48} sx={{ mb: 2, borderRadius: 1 }} />
                <Skeleton variant="text" width={80} height={40} />
                <Skeleton variant="text" width={120} />
              </Paper>
            )}
          </Grid>
        ))}
      </Grid>

      {/* Health & Alerts + Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" gap={1} mb={2.5}>
              <ErrorOutlineIcon sx={{ color: "warning.main" }} />
              <Typography fontWeight={700} fontSize={16}>Health & Alerts</Typography>
            </Stack>
            <Stack gap={1.5}>
              {HEALTH_ALERTS.map((alert, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    borderLeft: "4px solid",
                    bgcolor: alertColors[alert.type].bg,
                    borderColor: alertColors[alert.type].border,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="body2" fontWeight={500}>{alert.message}</Typography>
                    {alert.time && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2, flexShrink: 0 }}>
                        {alert.time}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography fontWeight={700} fontSize={16} mb={2.5}>Quick Actions</Typography>
            {loading ? (
              <Stack gap={1}>
                {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={44} sx={{ borderRadius: 1.5 }} />)}
              </Stack>
            ) : (
              <Stack gap={1}>
                {quickActions.map((action, i) => (
                  <Link key={i} href={action.href} style={{ textDecoration: "none" }}>
                    <Button
                      variant="text"
                      color={action.color as any}
                      fullWidth
                      sx={{
                        justifyContent: "space-between",
                        px: 1.5,
                        py: 1,
                        borderRadius: 1.5,
                        bgcolor: `${action.color}.50`,
                        "&:hover": { bgcolor: `${action.color}.100` },
                      }}
                      endIcon={
                        <Chip
                          label={action.count}
                          size="small"
                          sx={{ bgcolor: "white", fontWeight: 700, height: 22, fontSize: 11 }}
                        />
                      }
                    >
                      <Typography variant="body2" fontWeight={500} color="inherit">
                        {action.label}
                      </Typography>
                    </Button>
                  </Link>
                ))}

                {/* Pending withdrawal amount callout */}
                {stats && parseFloat(stats.withdrawals.pending_amount) > 0 && (
                  <Box sx={{ mt: 1, p: 1.5, bgcolor: "primary.50", borderRadius: 1.5 }}>
                    <Typography variant="caption" color="primary.main" fontWeight={600}>
                      {fmt(stats.withdrawals.pending_amount)} pending withdrawal amount
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity (stub) */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Typography fontWeight={700} fontSize={16}>Recent Admin Activity</Typography>
          <Chip label="Audit log coming soon" size="small" variant="outlined" />
        </Stack>
        <Stack divider={<Divider />}>
          {RECENT_ACTIVITY.map((activity, i) => (
            <Stack
              key={i}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ py: 1.5, px: 1, borderRadius: 1, "&:hover": { bgcolor: "grey.50" } }}
            >
              <Box>
                <Typography variant="body2" fontWeight={500}>{activity.user}</Typography>
                <Typography variant="caption" color="text.secondary">{activity.action}</Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
