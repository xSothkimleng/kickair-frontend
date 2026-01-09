import { useState } from "react";
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
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
} from "@mui/material";

interface Transaction {
  id: number;
  date: string;
  activity: string;
  description: string;
  client: string | null;
  amount: number;
  status: "pending" | "completed" | "potential";
  type: "credit" | "debit";
}

export default function FinanceContent() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("ABA Bank - ***1234");

  const mockTransactions: Transaction[] = [
    {
      id: 1,
      date: "2025-01-05",
      activity: "Service Completed",
      description: "Modern Logo Design - Basic Package",
      client: "Sokha Restaurant",
      amount: 50,
      status: "pending",
      type: "credit",
    },
    {
      id: 2,
      date: "2025-01-04",
      activity: "Payment Released",
      description: "Website Development - Premium Package",
      client: "TechStart Co.",
      amount: 1200,
      status: "completed",
      type: "credit",
    },
    {
      id: 3,
      date: "2025-01-03",
      activity: "Withdrawal",
      description: "Transferred to ABA Bank - ***1234",
      client: null,
      amount: 500,
      status: "completed",
      type: "debit",
    },
    {
      id: 4,
      date: "2025-01-02",
      activity: "Service In Progress",
      description: "Social Media Graphics - Standard Package",
      client: "Fashion Boutique",
      amount: 150,
      status: "potential",
      type: "credit",
    },
    {
      id: 5,
      date: "2024-12-28",
      activity: "Payment Released",
      description: "Brand Identity Design - Premium Package",
      client: "Coffee Shop Ltd.",
      amount: 800,
      status: "completed",
      type: "credit",
    },
  ];

  const potentialPayments = mockTransactions.filter(t => t.status === "potential");
  const pendingPayments = mockTransactions.filter(t => t.status === "pending");
  const completedPayments = mockTransactions.filter(t => t.status === "completed" && t.type === "credit");

  const potentialTotal = potentialPayments.reduce((sum, t) => sum + t.amount, 0);
  const pendingTotal = pendingPayments.reduce((sum, t) => sum + t.amount, 0);
  const availableBalance = 2450;
  const earningsToDate = completedPayments.reduce((sum, t) => sum + t.amount, 0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleWithdraw = () => {
    alert("Withdrawal request submitted!");
    setShowWithdrawModal(false);
    setWithdrawAmount("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return { bgcolor: "rgba(34, 197, 94, 0.1)", color: "rgb(21, 128, 61)" };
      case "pending":
        return { bgcolor: "rgba(37, 99, 235, 0.1)", color: "rgb(29, 78, 216)" };
      case "potential":
        return { bgcolor: "rgba(234, 179, 8, 0.1)", color: "rgb(161, 98, 7)" };
      default:
        return { bgcolor: "rgba(0, 0, 0, 0.1)", color: "black" };
    }
  };

  const getAmountColor = (transaction: Transaction) => {
    if (transaction.type === "debit") return "#ef4444";
    if (transaction.status === "potential") return "#f59e0b";
    if (transaction.status === "pending") return "#3b82f6";
    return "#16a34a";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Financial Overview Cards */}
      <Grid container spacing={2}>
        {/* Available Balance */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #000000 0%, rgba(0, 0, 0, 0.8) 100%)",
              borderRadius: 4,
              p: 3,
              color: "white",
            }}>
            <Typography sx={{ fontSize: 11, color: "rgba(255, 255, 255, 0.6)", mb: 1 }}>Available Balance</Typography>
            <Typography sx={{ fontSize: 32, fontWeight: 600, mb: 2 }}>${availableBalance.toLocaleString()}</Typography>
            <Button
              onClick={() => setShowWithdrawModal(true)}
              sx={{
                width: "100%",
                height: 36,
                bgcolor: "white",
                color: "black",
                fontSize: 12,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                },
              }}>
              Withdraw
            </Button>
          </Paper>
        </Grid>

        {/* Pending Payments */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Pending Payments</Typography>
              <Box sx={{ width: 8, height: 8, bgcolor: "#3b82f6", borderRadius: "50%" }} />
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>
              ${pendingTotal.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)" }}>Clearing in 3-5 days</Typography>
          </Paper>
        </Grid>

        {/* Potential Payments */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Potential Payments</Typography>
              <Box sx={{ width: 8, height: 8, bgcolor: "#f59e0b", borderRadius: "50%" }} />
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>
              ${potentialTotal.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)" }}>Services in progress</Typography>
          </Paper>
        </Grid>

        {/* Earnings to Date */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 3 }}>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Earnings to Date</Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>
              ${earningsToDate.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#16a34a" }}>+12% from last month</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Status Breakdown */}
      <Grid container spacing={3}>
        {/* Pending Payments Details */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Pending Payments</Typography>
              <Chip
                label={`${pendingPayments.length} orders`}
                sx={{
                  height: 24,
                  bgcolor: "rgba(37, 99, 235, 0.1)",
                  color: "rgb(29, 78, 216)",
                  fontSize: 11,
                }}
              />
            </Box>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 2 }}>
              Services completed, awaiting clearance by KickAir (typically 3-5 business days)
            </Typography>

            {pendingPayments.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {pendingPayments.map(payment => (
                  <Box
                    key={payment.id}
                    sx={{
                      p: 2,
                      bgcolor: "rgba(37, 99, 235, 0.05)",
                      borderRadius: 3,
                      border: "1px solid rgba(37, 99, 235, 0.2)",
                    }}>
                    <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "black", mb: 0.5 }}>
                          {payment.description}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{payment.client}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#3b82f6" }}>${payment.amount}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.4)" }}>
                      Completed on {formatDate(payment.date)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.4)" }}>No pending payments</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Potential Payments Details */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Potential Payments</Typography>
              <Chip
                label={`${potentialPayments.length} orders`}
                sx={{
                  height: 24,
                  bgcolor: "rgba(234, 179, 8, 0.1)",
                  color: "rgb(161, 98, 7)",
                  fontSize: 11,
                }}
              />
            </Box>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 2 }}>
              Orders you&apos;ve accepted and are currently working on. Payment will move to pending once services are completed.
            </Typography>

            {potentialPayments.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {potentialPayments.map(payment => (
                  <Box
                    key={payment.id}
                    sx={{
                      p: 2,
                      bgcolor: "rgba(234, 179, 8, 0.05)",
                      borderRadius: 3,
                      border: "1px solid rgba(234, 179, 8, 0.2)",
                    }}>
                    <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "black", mb: 0.5 }}>
                          {payment.description}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{payment.client}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#f59e0b" }}>${payment.amount}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.4)" }}>
                      Started on {formatDate(payment.date)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.4)" }}>No services in progress</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Transaction History */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Transaction History</Typography>
          <Button
            sx={{
              fontSize: 12,
              color: "rgba(0, 0, 0, 0.6)",
              textTransform: "none",
              "&:hover": {
                color: "black",
                bgcolor: "transparent",
              },
            }}>
            Export CSV
          </Button>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}>
                <TableCell sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", fontWeight: 500, border: "none", pb: 2 }}>
                  Date
                </TableCell>
                <TableCell sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", fontWeight: 500, border: "none", pb: 2 }}>
                  Activity
                </TableCell>
                <TableCell sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", fontWeight: 500, border: "none", pb: 2 }}>
                  Description
                </TableCell>
                <TableCell sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", fontWeight: 500, border: "none", pb: 2 }}>
                  Client
                </TableCell>
                <TableCell
                  align='right'
                  sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", fontWeight: 500, border: "none", pb: 2 }}>
                  Amount
                </TableCell>
                <TableCell
                  align='right'
                  sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", fontWeight: 500, border: "none", pb: 2 }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockTransactions.map(transaction => (
                <TableRow
                  key={transaction.id}
                  sx={{
                    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.02)",
                    },
                    transition: "background-color 0.2s",
                  }}>
                  <TableCell sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", border: "none", py: 2 }}>
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 500, color: "black", border: "none", py: 2 }}>
                    {transaction.activity}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.8)", border: "none", py: 2 }}>
                    {transaction.description}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", border: "none", py: 2 }}>
                    {transaction.client || "-"}
                  </TableCell>
                  <TableCell
                    align='right'
                    sx={{ fontSize: 14, fontWeight: 600, color: getAmountColor(transaction), border: "none", py: 2 }}>
                    {transaction.type === "credit" ? "+" : "-"}${transaction.amount}
                  </TableCell>
                  <TableCell align='right' sx={{ border: "none", py: 2 }}>
                    <Chip
                      label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      sx={{
                        height: 22,
                        fontSize: 10,
                        ...getStatusColor(transaction.status),
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Withdraw Modal */}
      <Dialog
        open={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
          },
        }}>
        <DialogTitle sx={{ fontSize: 20, fontWeight: 600, color: "black" }}>Withdraw Funds</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 3 }}>
            Available balance: <strong>${availableBalance.toLocaleString()}</strong>
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Amount (USD)</Typography>
              <TextField
                fullWidth
                type='number'
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                placeholder='0.00'
                inputProps={{ max: availableBalance }}
                InputProps={{
                  startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 44,
                    borderRadius: 3,
                    fontSize: 14,
                    "& fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.1)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.2)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.2)",
                      borderWidth: 1,
                    },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Withdrawal Method</Typography>
              <Select
                fullWidth
                value={withdrawMethod}
                onChange={e => setWithdrawMethod(e.target.value)}
                sx={{
                  height: 44,
                  borderRadius: 3,
                  fontSize: 13,
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.2)",
                    borderWidth: 1,
                  },
                }}>
                <MenuItem value='ABA Bank - ***1234'>ABA Bank - ***1234</MenuItem>
                <MenuItem value='Wing - ***5678'>Wing - ***5678</MenuItem>
                <MenuItem value='Pi Pay - ***9012'>Pi Pay - ***9012</MenuItem>
              </Select>
            </Box>

            <Box sx={{ p: 2, bgcolor: "rgba(37, 99, 235, 0.05)", borderRadius: 3 }}>
              <Typography sx={{ fontSize: 11, color: "rgb(29, 78, 216)" }}>
                <strong>Processing Time:</strong> Withdrawals typically arrive within 1-3 business days. A 2% processing fee
                applies to all withdrawals.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setShowWithdrawModal(false)}
            sx={{
              flex: 1,
              height: 44,
              fontSize: 13,
              color: "black",
              bgcolor: "rgba(0, 0, 0, 0.05)",
              borderRadius: 10,
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.1)",
              },
            }}>
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            sx={{
              flex: 1,
              height: 44,
              fontSize: 13,
              color: "white",
              bgcolor: "black",
              borderRadius: 10,
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.8)",
              },
            }}>
            Confirm Withdrawal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
