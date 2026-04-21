"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import { api } from "@/lib/api";
import { Wallet, Transaction } from "@/types/wallet";

export default function FinanceContent() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [walletResponse, transactionsResponse] = await Promise.all([
        api.get("/api/wallet"),
        api.get("/api/wallet/transactions"),
      ]);
      setWallet(walletResponse.data);
      setTransactions(Array.isArray(transactionsResponse.data) ? transactionsResponse.data : transactionsResponse.data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch finance data");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    const available = wallet ? parseFloat(wallet.available_balance_raw) : 0;

    if (!withdrawAmount || isNaN(amount) || amount <= 0) {
      setWithdrawError("Please enter a valid amount.");
      return;
    }
    if (amount > available) {
      setWithdrawError("Amount exceeds your available balance.");
      return;
    }

    try {
      setWithdrawLoading(true);
      setWithdrawError(null);
      await api.post("/api/wallet/withdraw", { amount });
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      await fetchFinanceData();
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : "Withdrawal failed. Please try again.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Derived transaction groups
  const escrowEarnings = transactions.filter(t => t.type === "earning" && t.status === "pending");
  const completedPayments = transactions.filter(t => t.status === "completed" && (t.type === "clearance" || t.type === "earning"));
  const pendingWithdrawals = transactions.filter(t => t.type === "withdrawal" && t.status === "pending");
  const pendingWithdrawalsTotal = pendingWithdrawals.reduce((sum, t) => sum + parseFloat(t.amount_raw), 0);

  const availableBalance = wallet ? parseFloat(wallet.available_balance_raw) : 0;
  const pendingTotal = wallet ? parseFloat(wallet.pending_balance_raw) : 0;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return { bgcolor: "rgba(34, 197, 94, 0.1)", color: "rgb(21, 128, 61)" };
      case "pending":   return { bgcolor: "rgba(37, 99, 235, 0.1)", color: "rgb(29, 78, 216)" };
      case "cancelled": return { bgcolor: "rgba(239, 68, 68, 0.1)", color: "rgb(185, 28, 28)" };
      default:          return { bgcolor: "rgba(0, 0, 0, 0.1)", color: "black" };
    }
  };

  const getAmountColor = (transaction: Transaction) => {
    if (transaction.type === "withdrawal") return "#ef4444";
    if (transaction.type === "earning" && transaction.status === "pending") return "#3b82f6";
    return "#16a34a";
  };

  // Bug #7: added "earning" and "clearance" — the actual types in a freelancer's wallet
  const getTransactionActivity = (transaction: Transaction) => {
    switch (transaction.type) {
      case "earning":    return transaction.status === "completed" ? "Earning Released" : "Earning in Escrow";
      case "clearance":  return "Payment Received";
      case "payment":    return transaction.status === "completed" ? "Payment Received" : "Payment Pending";
      case "deposit":    return "Deposit";
      case "withdrawal": return "Withdrawal Request";
      case "refund":     return "Refund";
      default:           return "Transaction";
    }
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.metadata?.service_title) {
      const pricingOption = transaction.metadata.pricing_option_title;
      return pricingOption
        ? `${transaction.metadata.service_title} - ${pricingOption}`
        : transaction.metadata.service_title;
    }
    if (transaction.order?.service?.title) {
      const pricingOption = transaction.order.pricing_option?.title;
      return pricingOption
        ? `${transaction.order.service.title} - ${pricingOption}`
        : transaction.order.service.title;
    }
    return transaction.description;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress size={32} sx={{ color: "rgba(0, 0, 0, 0.4)" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography sx={{ fontSize: 13, color: "rgba(239, 68, 68, 0.8)", mb: 2 }}>{error}</Typography>
        <Button onClick={fetchFinanceData} sx={{ fontSize: 12, textTransform: "none" }}>Try again</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* Balance Cards */}
      <Grid container spacing={2}>
        {/* Available Balance */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ background: "linear-gradient(135deg, #000 0%, rgba(0,0,0,0.8) 100%)", borderRadius: 4, p: 3, color: "white" }}>
            <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.6)", mb: 1 }}>Available Balance</Typography>
            <Typography sx={{ fontSize: 32, fontWeight: 600, mb: 2 }}>${availableBalance.toLocaleString()}</Typography>
            <Button
              onClick={() => { setShowWithdrawModal(true); setWithdrawError(null); setWithdrawAmount(""); }}
              sx={{ width: "100%", height: 36, bgcolor: "white", color: "black", fontSize: 12, borderRadius: 2, textTransform: "none", fontWeight: 500, "&:hover": { bgcolor: "rgba(255,255,255,0.9)" } }}>
              Withdraw
            </Button>
          </Paper>
        </Grid>

        {/* In Escrow */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)" }}>In Escrow</Typography>
              <Box sx={{ width: 8, height: 8, bgcolor: "#3b82f6", borderRadius: "50%" }} />
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>${pendingTotal.toLocaleString()}</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.4)" }}>Released when order completes</Typography>
          </Paper>
        </Grid>

        {/* Pending Withdrawals */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)" }}>Pending Withdrawal</Typography>
              <Box sx={{ width: 8, height: 8, bgcolor: "#f59e0b", borderRadius: "50%" }} />
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>${pendingWithdrawalsTotal.toLocaleString()}</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.4)" }}>
              {pendingWithdrawals.length > 0 ? `${pendingWithdrawals.length} request${pendingWithdrawals.length > 1 ? "s" : ""} awaiting approval` : "No pending requests"}
            </Typography>
          </Paper>
        </Grid>

        {/* Total Balance */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)" }}>Total Balance</Typography>
              <Box sx={{ width: 8, height: 8, bgcolor: "#16a34a", borderRadius: "50%" }} />
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>
              ${wallet ? wallet.total_balance_raw.toLocaleString() : "0"}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.4)" }}>Available + Escrow</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* In Escrow + Pending Withdrawals sections */}
      <Grid container spacing={3}>
        {/* In Escrow Details */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>In Escrow</Typography>
              <Chip label={`${escrowEarnings.length} order${escrowEarnings.length !== 1 ? "s" : ""}`} sx={{ height: 24, bgcolor: "rgba(37,99,235,0.1)", color: "rgb(29,78,216)", fontSize: 11 }} />
            </Box>
            <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)", mb: 2 }}>
              Earnings held in escrow while orders are active. Released to your available balance when the order is completed.
            </Typography>
            {escrowEarnings.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {escrowEarnings.map(t => (
                  <Box key={t.id} sx={{ p: 2, bgcolor: "rgba(37,99,235,0.05)", borderRadius: 3, border: "1px solid rgba(37,99,235,0.2)" }}>
                    <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 1 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: "black" }}>{getTransactionDescription(t)}</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#3b82f6" }}>${parseFloat(t.amount_raw).toLocaleString()}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 10, color: "rgba(0,0,0,0.4)" }}>Order placed on {formatDate(t.created_at)}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>No earnings in escrow</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Pending Withdrawals Details */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Pending Withdrawals</Typography>
              <Chip label={`${pendingWithdrawals.length} pending`} sx={{ height: 24, bgcolor: "rgba(245,158,11,0.1)", color: "rgb(180,83,9)", fontSize: 11 }} />
            </Box>
            <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)", mb: 2 }}>
              Withdrawal requests awaiting admin approval. Funds are reserved from your available balance until processed.
            </Typography>
            {pendingWithdrawals.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {pendingWithdrawals.map(t => (
                  <Box key={t.id} sx={{ p: 2, bgcolor: "rgba(245,158,11,0.05)", borderRadius: 3, border: "1px solid rgba(245,158,11,0.2)" }}>
                    <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 1 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: "black" }}>Withdrawal Request</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#f59e0b" }}>-${parseFloat(t.amount_raw).toLocaleString()}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 10, color: "rgba(0,0,0,0.4)" }}>Requested on {formatDate(t.created_at)}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>No pending withdrawals</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Completed Earnings */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Recent Completed</Typography>
              <Chip label={`${completedPayments.length} order${completedPayments.length !== 1 ? "s" : ""}`} sx={{ height: 24, bgcolor: "rgba(34,197,94,0.1)", color: "rgb(21,128,61)", fontSize: 11 }} />
            </Box>
            <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)", mb: 2 }}>
              Payments cleared and added to your available balance.
            </Typography>
            {completedPayments.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {completedPayments.slice(0, 5).map(t => (
                  <Box key={t.id} sx={{ p: 2, bgcolor: "rgba(34,197,94,0.05)", borderRadius: 3, border: "1px solid rgba(34,197,94,0.2)" }}>
                    <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 1 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: "black" }}>{getTransactionDescription(t)}</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#16a34a" }}>+${parseFloat(t.amount_raw).toLocaleString()}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 10, color: "rgba(0,0,0,0.4)" }}>Completed on {formatDate(t.created_at)}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>No completed earnings yet</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Transaction History */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Transaction History</Typography>
        </Box>
        {transactions.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.4)" }}>No transactions yet</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                  {["Date", "Activity", "Description", "Amount", "Status"].map(h => (
                    <TableCell key={h} align={h === "Amount" || h === "Status" ? "right" : "left"} sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)", fontWeight: 500, border: "none", pb: 2 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map(t => (
                  <TableRow key={t.id} sx={{ borderBottom: "1px solid rgba(0,0,0,0.05)", "&:hover": { bgcolor: "rgba(0,0,0,0.02)" }, transition: "background-color 0.2s" }}>
                    <TableCell sx={{ fontSize: 12, color: "rgba(0,0,0,0.6)", border: "none", py: 2 }}>{formatDate(t.created_at)}</TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 500, color: "black", border: "none", py: 2 }}>{getTransactionActivity(t)}</TableCell>
                    <TableCell sx={{ fontSize: 12, color: "rgba(0,0,0,0.8)", border: "none", py: 2 }}>{getTransactionDescription(t)}</TableCell>
                    <TableCell align="right" sx={{ fontSize: 14, fontWeight: 600, color: getAmountColor(t), border: "none", py: 2 }}>
                      {t.type === "withdrawal" ? "-" : "+"}${parseFloat(t.amount_raw).toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ border: "none", py: 2 }}>
                      <Chip label={t.status.charAt(0).toUpperCase() + t.status.slice(1)} sx={{ height: 22, fontSize: 10, ...getStatusColor(t.status) }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Withdraw Modal */}
      <Dialog open={showWithdrawModal} onClose={() => !withdrawLoading && setShowWithdrawModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontSize: 20, fontWeight: 600, color: "black" }}>Withdraw Funds</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.6)", mb: 3 }}>
            Available balance: <strong>${availableBalance.toLocaleString()}</strong>
          </Typography>
          {withdrawError && <Alert severity="error" sx={{ mb: 2 }}>{withdrawError}</Alert>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.6)", mb: 1 }}>Amount (USD)</Typography>
              <TextField
                fullWidth
                type="number"
                value={withdrawAmount}
                onChange={e => { setWithdrawAmount(e.target.value); setWithdrawError(null); }}
                placeholder="0.00"
                disabled={withdrawLoading}
                slotProps={{ htmlInput: { min: 1, max: availableBalance, step: "0.01" } }}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                sx={{ "& .MuiOutlinedInput-root": { height: 44, borderRadius: 3, fontSize: 14, "& fieldset": { borderColor: "rgba(0,0,0,0.1)" } } }}
              />
            </Box>
            <Box sx={{ p: 2, bgcolor: "rgba(37,99,235,0.05)", borderRadius: 3 }}>
              <Typography sx={{ fontSize: 11, color: "rgb(29,78,216)" }}>
                <strong>Note:</strong> Withdrawal requests are reviewed by our team and typically processed within 1-3 business days.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => { setShowWithdrawModal(false); setWithdrawError(null); }}
            disabled={withdrawLoading}
            sx={{ flex: 1, height: 44, fontSize: 13, color: "black", bgcolor: "rgba(0,0,0,0.05)", borderRadius: 10, textTransform: "none", "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            disabled={withdrawLoading}
            sx={{ flex: 1, height: 44, fontSize: 13, color: "white", bgcolor: "black", borderRadius: 10, textTransform: "none", "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>
            {withdrawLoading ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Confirm Withdrawal"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
