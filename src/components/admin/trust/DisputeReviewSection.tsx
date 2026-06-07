"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { api } from "@/lib/api";
import { AdminDispute } from "@/types/order";
import { registerAdminRefresh } from "@/components/layout/GlobalNotificationToast";

type StatusFilter = "open" | "resolved" | "all";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusChipColor(status: string) {
  return status === "open" ? "warning" : "success";
}

function outcomeLabel(outcome: string | null) {
  if (!outcome) return "—";
  const labels: Record<string, string> = {
    full_freelancer: "Full payment to Freelancer",
    partial: "Partial split",
    full_client: "Full refund to Client",
  };
  return labels[outcome] ?? outcome;
}

export default function DisputeReviewSection() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdminDisputes(1, statusFilter === "all" ? undefined : statusFilter);
      setDisputes(res.data);
    } catch {
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  // Live: a newly opened dispute pushes an admin alert — refetch the queue.
  useEffect(() => registerAdminRefresh((type) => {
    if (type === "admin_dispute_opened") fetchDisputes();
  }), [fetchDisputes]);

  return (
    <Box mb={4}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
        <GavelIcon sx={{ color: "#ef4444" }} />
        <Typography variant="h6" fontWeight={600}>
          Dispute Review
        </Typography>
      </Stack>

      <ToggleButtonGroup
        value={statusFilter}
        exclusive
        onChange={(_, val) => { if (val) setStatusFilter(val); }}
        size="small"
        sx={{ mb: 2 }}>
        <ToggleButton value="open">Open</ToggleButton>
        <ToggleButton value="resolved">Resolved</ToggleButton>
        <ToggleButton value="all">All</ToggleButton>
      </ToggleButtonGroup>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : disputes.length === 0 ? (
        <Typography color="text.secondary" py={2}>
          No disputes found.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Order</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Parties</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {disputes.map(dispute => (
                <TableRow key={dispute.id} hover>
                  <TableCell>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>#{dispute.order.id}</Typography>
                    <Typography sx={{ fontSize: 11, color: "text.secondary", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {dispute.order.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>${dispute.order.price}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Avatar src={dispute.client.avatar_url ?? undefined} sx={{ width: 22, height: 22, fontSize: 10 }}>{dispute.client.name.charAt(0)}</Avatar>
                      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>vs</Typography>
                      <Avatar src={dispute.freelancer.avatar_url ?? undefined} sx={{ width: 22, height: 22, fontSize: 10 }}>{dispute.freelancer.name.charAt(0)}</Avatar>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 180 }}>
                    <Typography sx={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {dispute.reason}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 12 }}>{formatDate(dispute.opened_at)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={dispute.status}
                      color={statusChipColor(dispute.status)}
                      size="small"
                      sx={{ fontSize: 11, textTransform: "capitalize" }}
                    />
                    {dispute.outcome && (
                      <Typography sx={{ fontSize: 10, color: "text.secondary", mt: 0.5 }}>
                        {outcomeLabel(dispute.outcome)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant={dispute.status === "open" ? "contained" : "outlined"}
                      startIcon={<VisibilityIcon sx={{ fontSize: 15 }} />}
                      onClick={() => router.push(`/admin/disputes/${dispute.id}`)}
                      sx={{
                        fontSize: 11,
                        textTransform: "none",
                        borderRadius: 10,
                        boxShadow: "none",
                        ...(dispute.status === "open"
                          ? { bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626", boxShadow: "none" } }
                          : {}),
                      }}>
                      View Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
