"use client";

import { useEffect, useState } from "react";
import {
  Box, Grid, Paper, Typography, Stack, Tabs, Tab, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import { LineChart, BarChart } from "@mui/x-charts";
import { api, AdminStats, AdminTransaction } from "@/lib/api";

// Chart data stays as mock until a time-series endpoint is built
const GMV_DATA = {
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  gmv: [8200, 9100, 7800, 11200, 10500, 12847, 9300],
  revenue: [1640, 1820, 1560, 2240, 2100, 2569, 1860],
};

const CATEGORY_REVENUE = {
  categories: ["Design", "Translation", "Marketing", "Web Dev", "Writing"],
  revenue: [8200, 5400, 6100, 9800, 3200],
};

function formatAmount(value: string | undefined): string {
  if (!value) return "$0.00";
  return `$${parseFloat(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusColor(status: string): "success" | "warning" | "default" | "error" {
  if (status === "completed") return "success";
  if (status === "pending") return "warning";
  if (status === "cancelled") return "error";
  return "default";
}

function statusLabel(status: string): string {
  if (status === "completed") return "Completed";
  if (status === "pending") return "Pending";
  if (status === "cancelled") return "Rejected";
  return status;
}

export default function PaymentsPage() {
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.getAdminStats(),
      api.getAdminTransactions(),
      api.getAdminWithdrawals(),
    ])
      .then(([statsData, txData, wdData]) => {
        setStats(statsData);
        setTransactions(txData.data.data);
        setWithdrawals(wdData.data.data);
      })
      .catch(() => setError("Failed to load payment data."))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await api.approveWithdrawal(id);
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: "completed" as const } : w))
      );
    } catch {
      setError("Failed to approve withdrawal.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await api.rejectWithdrawal(id);
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: "cancelled" as const } : w))
      );
    } catch {
      setError("Failed to reject withdrawal.");
    } finally {
      setActionLoading(null);
    }
  };

  const kpiCards = [
    {
      label: "Today's GMV",
      value: stats ? formatAmount(stats.gmv_today) : "—",
      sub: "",
      icon: AttachMoneyIcon,
      color: "primary.main",
      bg: "primary.50",
    },
    {
      label: "Total GMV",
      value: stats ? formatAmount(stats.total_gmv) : "—",
      sub: "",
      icon: TrendingUpIcon,
      color: "success.main",
      bg: "success.50",
    },
    {
      label: "Pending Payouts",
      value: stats ? formatAmount(stats.pending_payouts_amount) : "—",
      sub: stats ? `${stats.pending_payouts_count} requests` : "",
      icon: AccountBalanceIcon,
      color: "warning.main",
      bg: "warning.50",
    },
    {
      label: "Refunds (Today)",
      value: stats ? formatAmount(stats.refunds_today_amount) : "—",
      sub: stats ? `${stats.refunds_today_count} refunds` : "",
      icon: ReceiptIcon,
      color: "error.main",
      bg: "error.50",
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' fontWeight={700} gutterBottom>Payments & Finance</Typography>
        <Typography color='text.secondary'>Monitor transactions, payouts, and revenue</Typography>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Grid key={label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Paper variant='outlined' sx={{ p: 2.5, borderRadius: 2 }}>
              <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='body2' color='text.secondary' mb={0.5}>{label}</Typography>
                  <Typography variant='h5' fontWeight={700}>
                    {loading ? <CircularProgress size={20} /> : value}
                  </Typography>
                  {sub && <Typography variant='caption' color='text.secondary'>{sub}</Typography>}
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: bg }}>
                  <Icon sx={{ color, fontSize: 22 }} />
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper variant='outlined' sx={{ borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid", borderColor: "grey.200", px: 2 }}>
          <Tab icon={<ReceiptIcon fontSize='small' />} iconPosition='start' label='All Transactions' />
          <Tab icon={<AccountBalanceIcon fontSize='small' />} iconPosition='start' label='Payouts & Withdrawals' />
          <Tab icon={<BarChartIcon fontSize='small' />} iconPosition='start' label='Revenue Charts' />
          <Tab icon={<DownloadIcon fontSize='small' />} iconPosition='start' label='Financial Reports' />
        </Tabs>

        {/* All Transactions */}
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : transactions.length === 0 ? (
              <Typography color='text.secondary' textAlign='center' py={4}>No transactions found.</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      {["Type", "User", "Amount", "Balance After", "Status", "Date"].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} hover>
                        <TableCell>
                          <Chip label={tx.type} size='small' variant='outlined' sx={{ textTransform: "capitalize" }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' fontWeight={500}>{tx.user?.name ?? "—"}</Typography>
                          <Typography variant='caption' color='text.secondary'>{tx.user?.email ?? ""}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' fontWeight={600}>{formatAmount(tx.amount)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' color='text.secondary'>{formatAmount(tx.balance_after)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={statusLabel(tx.status)} size='small' color={statusColor(tx.status)} />
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption' color='text.secondary'>{formatDate(tx.created_at)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Payouts & Withdrawals */}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={3}>
              <Typography fontWeight={700} fontSize={17}>Withdrawal Requests</Typography>
              <Button
                variant='outlined'
                size='small'
                startIcon={<CheckCircleIcon />}
                disabled={!withdrawals.some((w) => w.status === "pending")}
                onClick={() => withdrawals.filter((w) => w.status === "pending").forEach((w) => handleApprove(w.id))}>
                Approve All Pending
              </Button>
            </Stack>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : withdrawals.length === 0 ? (
              <Typography color='text.secondary' textAlign='center' py={4}>No withdrawal requests found.</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      {["Freelancer", "Amount", "Requested", "Status", "Actions"].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {withdrawals.map((w) => (
                      <TableRow key={w.id} hover>
                        <TableCell>
                          <Typography variant='body2' fontWeight={500}>{w.user?.name ?? "—"}</Typography>
                          <Typography variant='caption' color='text.secondary'>{w.user?.email ?? ""}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' fontWeight={600}>{formatAmount(w.amount)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption' color='text.secondary'>{formatDate(w.created_at)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={statusLabel(w.status)} size='small' color={statusColor(w.status)} />
                        </TableCell>
                        <TableCell>
                          {w.status === "pending" && (
                            <Stack direction='row' gap={1}>
                              <Button
                                size='small'
                                variant='contained'
                                color='success'
                                startIcon={actionLoading === w.id ? <CircularProgress size={12} color='inherit' /> : <CheckCircleIcon />}
                                disabled={actionLoading === w.id}
                                onClick={() => handleApprove(w.id)}>
                                Approve
                              </Button>
                              <Button
                                size='small'
                                variant='outlined'
                                color='error'
                                startIcon={actionLoading === w.id ? <CircularProgress size={12} color='inherit' /> : <PauseCircleIcon />}
                                disabled={actionLoading === w.id}
                                onClick={() => handleReject(w.id)}>
                                Reject
                              </Button>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Revenue Charts */}
        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <Paper variant='outlined' sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography fontWeight={700} mb={2}>GMV & Revenue (Last 7 Days)</Typography>
                  <LineChart
                    xAxis={[{ data: GMV_DATA.days, scaleType: "band" }]}
                    series={[
                      { data: GMV_DATA.gmv, label: "GMV ($)", color: "#3b82f6" },
                      { data: GMV_DATA.revenue, label: "Revenue ($)", color: "#10b981" },
                    ]}
                    height={280}
                  />
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, lg: 5 }}>
                <Paper variant='outlined' sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography fontWeight={700} mb={2}>Revenue by Category</Typography>
                  <BarChart
                    xAxis={[{ data: CATEGORY_REVENUE.categories, scaleType: "band" }]}
                    series={[{ data: CATEGORY_REVENUE.revenue, label: "Revenue ($)", color: "#8b5cf6" }]}
                    height={280}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Financial Reports */}
        {tab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography fontWeight={700} fontSize={17} mb={3}>Export Financial Reports</Typography>
            <Grid container spacing={2}>
              {[
                { label: "Daily Transaction Report", desc: "All transactions for today" },
                { label: "Monthly Revenue Summary", desc: "Revenue breakdown by month" },
                { label: "Payout History", desc: "All completed freelancer payouts" },
                { label: "Refunds & Chargebacks", desc: "All refund transactions" },
                { label: "Tax Report (CSV)", desc: "Taxable transactions for compliance" },
              ].map((r) => (
                <Grid key={r.label} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper variant='outlined' sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography fontWeight={600} mb={0.5}>{r.label}</Typography>
                    <Typography variant='caption' color='text.secondary' display='block' mb={2}>{r.desc}</Typography>
                    <Button size='small' variant='outlined' startIcon={<DownloadIcon />}>Export CSV</Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
