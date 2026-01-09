"use client";

import { useState } from "react";
import { Box, Typography, Button, Card, CardContent, Stack, Chip, Grid, Paper, Divider } from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  AttachMoney as DollarSignIcon,
  CreditCard as CreditCardIcon,
  Receipt as FileTextIcon,
  CheckCircle as CheckCircle2Icon,
  Cancel as XCircleIcon,
  AccessTime as ClockIcon,
} from "@mui/icons-material";

export default function FinanceContent() {
  const [activeFilter, setActiveFilter] = useState<"all" | "completed" | "pending" | "cancelled">("all");

  const financialOverview = {
    totalSpent: 24500,
    inEscrow: 2450,
    monthlySpending: 3200,
    availableBalance: 5000,
  };

  const transactions = [
    {
      id: 1,
      type: "payment",
      description: "Payment to Sopheak Chan",
      project: "E-commerce Website Development",
      amount: -1200,
      status: "Completed",
      date: "Jan 5, 2026",
    },
    {
      id: 2,
      type: "escrow",
      description: "Funds held in escrow",
      project: "Logo Design - Premium Package",
      amount: -350,
      status: "Pending",
      date: "Jan 3, 2026",
    },
    {
      id: 3,
      type: "refund",
      description: "Refund from David Lim",
      project: "Content Writing Project",
      amount: 200,
      status: "Completed",
      date: "Dec 28, 2025",
    },
    {
      id: 4,
      type: "payment",
      description: "Payment to Sarah Kim",
      project: "Social Media Graphics",
      amount: -450,
      status: "Completed",
      date: "Dec 20, 2025",
    },
    {
      id: 5,
      type: "deposit",
      description: "Account balance top-up",
      project: "Wallet Deposit",
      amount: 5000,
      status: "Completed",
      date: "Dec 15, 2025",
    },
  ];

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2Icon sx={{ fontSize: 16, color: "#16a34a" }} />;
      case "Pending":
        return <ClockIcon sx={{ fontSize: 16, color: "#ea580c" }} />;
      case "Cancelled":
        return <XCircleIcon sx={{ fontSize: 16, color: "#dc2626" }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return { bgcolor: "rgba(22, 163, 74, 0.1)", color: "#15803d" };
      case "Pending":
        return { bgcolor: "rgba(234, 88, 12, 0.1)", color: "#b45309" };
      case "Cancelled":
        return { bgcolor: "rgba(220, 38, 38, 0.1)", color: "#b91c1c" };
      default:
        return { bgcolor: "rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.6)" };
    }
  };

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
            "&:hover": {
              bgcolor: "rgba(0,0,0,0.1)",
              boxShadow: "none",
            },
          }}>
          Export Report
        </Button>
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
                  ${financialOverview.totalSpent.toLocaleString()}
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
                  ${financialOverview.inEscrow.toLocaleString()}
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
                <TrendingUpIcon sx={{ fontSize: 20, color: "#9333ea" }} />
                <Typography variant='h5' fontWeight={600}>
                  ${financialOverview.monthlySpending.toLocaleString()}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Monthly Spending
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
                  ${financialOverview.availableBalance.toLocaleString()}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Available Balance
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
                  {(["all", "completed", "pending", "cancelled"] as const).map(filter => (
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

              <Stack spacing={1.5}>
                {transactions.map((transaction, index) => (
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
                            {transaction.description}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' display='block' mb={0.5}>
                            {transaction.project}
                          </Typography>
                          <Stack direction='row' spacing={1} alignItems='center'>
                            {getStatusIcon(transaction.status)}
                            <Chip
                              label={transaction.status}
                              size='small'
                              sx={{
                                height: 20,
                                fontSize: 10,
                                ...getStatusColor(transaction.status),
                              }}
                            />
                            <Typography variant='caption' color='text.disabled'>
                              {transaction.date}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                      <Typography
                        variant='body1'
                        fontWeight={600}
                        sx={{
                          color: transaction.amount > 0 ? "#16a34a" : "black",
                        }}>
                        {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount)}
                      </Typography>
                    </Stack>
                    {index < transactions.length - 1 && <Divider />}
                  </Box>
                ))}
              </Stack>
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

          {/* Quick Actions */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.08)",
            }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant='h6' fontWeight={600} mb={2}>
                Quick Actions
              </Typography>
              <Stack spacing={1.5}>
                <Button
                  fullWidth
                  variant='contained'
                  sx={{
                    fontSize: 12,
                    textTransform: "none",
                    borderRadius: 10,
                    bgcolor: "#0071e3",
                    color: "white",
                    justifyContent: "flex-start",
                    "&:hover": {
                      bgcolor: "#0077ED",
                    },
                  }}>
                  Add Funds to Wallet
                </Button>
                <Button
                  fullWidth
                  variant='outlined'
                  sx={{
                    fontSize: 12,
                    textTransform: "none",
                    borderRadius: 10,
                    borderColor: "rgba(0,0,0,0.2)",
                    color: "black",
                    justifyContent: "flex-start",
                    "&:hover": {
                      borderColor: "rgba(0,0,0,0.4)",
                      bgcolor: "transparent",
                    },
                  }}>
                  Request Invoice
                </Button>
                <Button
                  fullWidth
                  variant='outlined'
                  sx={{
                    fontSize: 12,
                    textTransform: "none",
                    borderRadius: 10,
                    borderColor: "rgba(0,0,0,0.2)",
                    color: "black",
                    justifyContent: "flex-start",
                    "&:hover": {
                      borderColor: "rgba(0,0,0,0.4)",
                      bgcolor: "transparent",
                    },
                  }}>
                  View Tax Documents
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
