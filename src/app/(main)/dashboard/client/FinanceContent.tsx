"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Download as DownloadIcon,
  AttachMoney as DollarSignIcon,
  CreditCard as CreditCardIcon,
  Receipt as FileTextIcon,
  CheckCircle as CheckCircle2Icon,
  Cancel as XCircleIcon,
  AccessTime as ClockIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { Wallet, Transaction } from "@/types/wallet";

export default function FinanceContent() {
  const [activeFilter, setActiveFilter] = useState<"all" | "completed" | "pending" | "failed">("all");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: 1,
      type: "card",
      name: "Visa ending in 4242",
      isDefault: true,
    },
    {
      id: 2,
      type: "card",
      name: "Mastercard ending in 8888",
      isDefault: false,
    },
  ];

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!topUpAmount || isNaN(amount) || amount <= 0) {
      setTopUpError("Please enter a valid amount.");
      return;
    }
    try {
      setTopUpLoading(true);
      setTopUpError(null);
      await api.post("/api/wallet/deposit", { amount });
      setTopUpOpen(false);
      setTopUpAmount("");
      await fetchFinanceData();
    } catch (err) {
      setTopUpError(err instanceof Error ? err.message : "Deposit failed. Please try again.");
    } finally {
      setTopUpLoading(false);
    }
  };

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [walletResponse, transactionsResponse] = await Promise.all([
        api.get("/api/wallet"),
        api.get("/api/wallet/transactions"),
      ]);

      setWallet(walletResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch finance data");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (activeFilter === "all") return true;
    return transaction.status === activeFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2Icon sx={{ fontSize: 16, color: "#16a34a" }} />;
      case "pending":
        return <ClockIcon sx={{ fontSize: 16, color: "#ea580c" }} />;
      case "failed":
        return <XCircleIcon sx={{ fontSize: 16, color: "#dc2626" }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return { bgcolor: "rgba(22, 163, 74, 0.1)", color: "#15803d" };
      case "pending":
        return { bgcolor: "rgba(234, 88, 12, 0.1)", color: "#b45309" };
      case "failed":
        return { bgcolor: "rgba(220, 38, 38, 0.1)", color: "#b91c1c" };
      default:
        return { bgcolor: "rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.6)" };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTransactionAmount = (transaction: Transaction) => {
    const amount = parseFloat(transaction.amount_raw);
    // Deposits and refunds are positive (money in), payments and withdrawals are negative (money out)
    const isPositive = transaction.type === "deposit" || transaction.type === "refund";
    return { amount, isPositive };
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.metadata?.service_title) {
      return transaction.metadata.service_title;
    }
    if (transaction.order?.service?.title) {
      return transaction.order.service.title;
    }
    return transaction.description;
  };

  const getTransactionProject = (transaction: Transaction) => {
    if (transaction.metadata?.pricing_option_title) {
      return transaction.metadata.pricing_option_title;
    }
    if (transaction.order?.pricing_option?.title) {
      return transaction.order.pricing_option.title;
    }
    return transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
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
        <Button onClick={fetchFinanceData} sx={{ fontSize: 12, textTransform: "none" }}>
          Try again
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction='row' justifyContent='space-between' alignItems='flex-start' mb={3}>
        <Box>
          <Typography variant='h5' fontWeight={600} mb={0.5}>
            Finance
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Manage your finances and transactions
          </Typography>
        </Box>
        <Stack direction='row' spacing={1}>
          <Button
            variant='contained'
            startIcon={<AddIcon sx={{ fontSize: 14 }} />}
            onClick={() => {
              setTopUpOpen(true);
              setTopUpError(null);
              setTopUpAmount("");
            }}
            sx={{
              fontSize: 12,
              textTransform: "none",
              borderRadius: 10,
              bgcolor: "black",
              color: "white",
              boxShadow: "none",
              "&:hover": { bgcolor: "rgba(0,0,0,0.8)", boxShadow: "none" },
            }}>
            Top Up
          </Button>
          <Button
            variant='contained'
            startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: 12,
              textTransform: "none",
              borderRadius: 10,
              bgcolor: "rgba(0,0,0,0.05)",
              color: "black",
              boxShadow: "none",
              "&:hover": { bgcolor: "rgba(0,0,0,0.1)", boxShadow: "none" },
            }}>
            Export Report
          </Button>
        </Stack>
      </Stack>

      {/* Financial Overview Cards */}
      <Grid container spacing={2} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.08)",
            }}>
            <CardContent>
              <Stack spacing={1}>
                <DollarSignIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                <Typography variant='h5' fontWeight={600}>
                  ${wallet ? parseFloat(wallet.available_balance_raw).toLocaleString() : "0"}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Available Balance
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.08)",
            }}>
            <CardContent>
              <Stack spacing={1}>
                <DollarSignIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                <Typography variant='h5' fontWeight={600}>
                  ${wallet ? parseFloat(wallet.total_spent_raw).toLocaleString() : "0"}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Total Spent
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.08)",
            }}>
            <CardContent>
              <Stack spacing={1}>
                <ClockIcon sx={{ fontSize: 20, color: "#ea580c" }} />
                <Typography variant='h5' fontWeight={600}>
                  ${wallet ? parseFloat(wallet.pending_balance_raw).toLocaleString() : "0"}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  In Escrow
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.08)",
            }}>
            <CardContent>
              <Stack spacing={1}>
                <CreditCardIcon sx={{ fontSize: 20, color: "#16a34a" }} />
                <Typography variant='h5' fontWeight={600}>
                  ${wallet ? wallet.total_balance_raw.toLocaleString() : "0"}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Total Balance
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Transaction History */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.08)",
            }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction='row' justifyContent='space-between' alignItems='center' mb={3}>
                <Typography variant='h6' fontWeight={600}>
                  Transaction History
                </Typography>
                <Stack direction='row' spacing={1}>
                  {(["all", "completed", "pending", "failed"] as const).map(filter => (
                    <Button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      sx={{
                        fontSize: 11,
                        textTransform: "capitalize",
                        borderRadius: 10,
                        px: 2,
                        minWidth: "auto",
                        ...(activeFilter === filter
                          ? {
                              bgcolor: "black",
                              color: "white",
                              "&:hover": { bgcolor: "black" },
                            }
                          : {
                              bgcolor: "rgba(0,0,0,0.05)",
                              color: "rgba(0,0,0,0.6)",
                              "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
                            }),
                      }}>
                      {filter}
                    </Button>
                  ))}
                </Stack>
              </Stack>

              {filteredTransactions.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <FileTextIcon sx={{ fontSize: 48, color: "rgba(0, 0, 0, 0.2)", mb: 2 }} />
                  <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)" }}>No transactions found</Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {filteredTransactions.map((transaction, index) => {
                    const { amount, isPositive } = getTransactionAmount(transaction);
                    return (
                      <Box key={transaction.id}>
                        <Stack
                          direction='row'
                          justifyContent='space-between'
                          alignItems='center'
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            transition: "all 0.2s",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                          }}>
                          <Stack direction='row' spacing={2} flex={1}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: "rgba(0,0,0,0.05)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}>
                              <FileTextIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                            </Box>
                            <Box flex={1}>
                              <Typography variant='body2' fontWeight={500} mb={0.25}>
                                {getTransactionDescription(transaction)}
                              </Typography>
                              <Typography variant='caption' color='text.secondary' display='block' mb={0.5}>
                                {getTransactionProject(transaction)}
                              </Typography>
                              <Stack direction='row' spacing={1} alignItems='center'>
                                {getStatusIcon(transaction.status)}
                                <Chip
                                  label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                  size='small'
                                  sx={{
                                    height: 20,
                                    fontSize: 10,
                                    ...getStatusColor(transaction.status),
                                  }}
                                />
                                <Typography variant='caption' color='text.disabled'>
                                  {formatDate(transaction.created_at)}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                          <Typography
                            variant='body1'
                            fontWeight={600}
                            sx={{
                              color: isPositive ? "#16a34a" : "black",
                            }}>
                            {isPositive ? "+" : "-"}${amount.toLocaleString()}
                          </Typography>
                        </Stack>
                        {index < filteredTransactions.length - 1 && <Divider />}
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Methods */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.08)",
              mb: 3,
            }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction='row' justifyContent='space-between' alignItems='center' mb={3}>
                <Typography variant='h6' fontWeight={600}>
                  Payment Methods
                </Typography>
                <Button
                  sx={{
                    fontSize: 11,
                    color: "#0071e3",
                    textTransform: "none",
                    minWidth: "auto",
                    p: 0,
                    "&:hover": {
                      textDecoration: "underline",
                      bgcolor: "transparent",
                    },
                  }}>
                  Add New
                </Button>
              </Stack>

              <Stack spacing={2}>
                {paymentMethods.map(method => (
                  <Paper
                    elevation={0}
                    key={method.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: method.isDefault ? "#0071e3" : "rgba(0,0,0,0.08)",
                      bgcolor: method.isDefault ? "rgba(0, 113, 227, 0.05)" : "white",
                    }}>
                    <Stack direction='row' spacing={2} alignItems='center'>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: "rgba(0,0,0,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                        <CreditCardIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                      </Box>
                      <Box flex={1}>
                        <Typography variant='body2' fontWeight={500} mb={0.25}>
                          {method.name}
                        </Typography>
                        {method.isDefault && (
                          <Chip
                            label='Default'
                            size='small'
                            sx={{
                              height: 18,
                              fontSize: 10,
                              bgcolor: "rgba(0, 113, 227, 0.1)",
                              color: "#0071e3",
                            }}
                          />
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={topUpOpen}
        onClose={() => !topUpLoading && setTopUpOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: 3, width: 360, p: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 16, pb: 1 }}>Top Up Balance</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            type='number'
            label='Amount'
            value={topUpAmount}
            onChange={e => {
              setTopUpAmount(e.target.value);
              setTopUpError(null);
            }}
            slotProps={{ htmlInput: { min: 1, step: "0.01" } }}
            error={!!topUpError}
            helperText={topUpError ?? " "}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ pt: 0 }}>
          <Button
            onClick={() => setTopUpOpen(false)}
            disabled={topUpLoading}
            sx={{ fontSize: 12, textTransform: "none", color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleTopUp}
            disabled={topUpLoading}
            sx={{
              fontSize: 12,
              textTransform: "none",
              borderRadius: 10,
              bgcolor: "black",
              color: "white",
              boxShadow: "none",
              "&:hover": { bgcolor: "rgba(0,0,0,0.8)", boxShadow: "none" },
            }}>
            {topUpLoading ? <CircularProgress size={16} sx={{ color: "white" }} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
