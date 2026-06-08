"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Box, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import { api } from "@/lib/api";
import { AdminDispute } from "@/types/order";
import { registerAdminRefresh } from "@/components/layout/GlobalNotificationToast";
import { tokens } from "@/theme";
import { StatusPill } from "@/components/dashboard/ManagementCard";
import { SectionHead, FilterPills, AdminEmpty, adminCardSx, adminTableSx } from "@/components/admin/adminKit";

type StatusFilter = "open" | "resolved" | "all";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function outcomeLabel(outcome: string | null) {
  if (!outcome) return null;
  const labels: Record<string, string> = {
    full_freelancer: "Full payment to freelancer",
    partial: "Partial split",
    full_client: "Full refund to client",
  };
  return labels[outcome] ?? outcome;
}

function PartyVs({ a, b }: { a: { name: string; avatar_url?: string | null }; b: { name: string; avatar_url?: string | null } }) {
  const chip = (p: { name: string; avatar_url?: string | null }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.875, minWidth: 0 }}>
      <Avatar src={p.avatar_url ?? undefined} sx={{ width: 26, height: 26, fontSize: 11 }}>{p.name.charAt(0)}</Avatar>
      <Typography sx={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>{p.name}</Typography>
    </Box>
  );
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
      {chip(a)}
      <Typography sx={{ fontSize: 11, color: tokens.text3 }}>vs</Typography>
      {chip(b)}
    </Box>
  );
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

  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

  // Live: a newly opened dispute pushes an admin alert — refetch the queue.
  useEffect(() => registerAdminRefresh(type => { if (type === "admin_dispute_opened") fetchDisputes(); }), [fetchDisputes]);

  const openCount = disputes.filter(d => d.status === "open").length;

  return (
    <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <SectionHead
        icon={<BalanceOutlinedIcon sx={{ fontSize: 21 }} />}
        title="Dispute review"
        count={loading ? null : statusFilter === "resolved" ? null : openCount}
        desc="Orders where a client and freelancer disagree. Review both sides and the evidence, then decide how escrowed funds are released."
      />

      <FilterPills
        options={[{ id: "open", label: "Open" }, { id: "resolved", label: "Resolved" }, { id: "all", label: "All" }]}
        value={statusFilter}
        onChange={v => setStatusFilter(v as StatusFilter)}
      />

      <Box sx={adminCardSx}>
        {loading ? (
          <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
            {[0, 1, 2].map(i => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Skeleton variant="text" width="28%" /><Skeleton variant="text" width="30%" /><Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: "999px" }} /><Skeleton variant="text" width={80} />
              </Box>
            ))}
          </Box>
        ) : disputes.length === 0 ? (
          <AdminEmpty icon={<BalanceOutlinedIcon sx={{ fontSize: 28 }} />} title="No disputes here" body="Every dispute in this filter has been handled. New disputes raised on orders will appear here for review." />
        ) : (
          <TableContainer>
            <Table sx={adminTableSx}>
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Parties</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Opened</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {disputes.map(d => {
                  const open = d.status === "open";
                  const outcome = outcomeLabel(d.outcome);
                  return (
                    <TableRow key={d.id}>
                      <TableCell>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260 }}>
                          #{d.order.id} · {d.order.title}
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, fontFamily: tokens.mono, color: tokens.text3 }}>${Number(d.order.price).toLocaleString()} in escrow</Typography>
                      </TableCell>
                      <TableCell><PartyVs a={d.client} b={d.freelancer} /></TableCell>
                      <TableCell>
                        <StatusPill tone={open ? "pending" : "success"} label={open ? "Open" : "Resolved"} />
                        {outcome && <Typography sx={{ fontSize: 10.5, color: tokens.text3, mt: 0.5 }}>{outcome}</Typography>}
                      </TableCell>
                      <TableCell><Typography sx={{ fontSize: 12.5, color: tokens.text2 }}>{formatDate(d.opened_at)}</Typography></TableCell>
                      <TableCell align="right">
                        <Box
                          component="button"
                          onClick={() => router.push(`/admin/disputes/${d.id}`)}
                          sx={{
                            height: 32, px: 1.75, borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                            border: open ? `1px solid ${tokens.borderStrong}` : "1px solid transparent",
                            bgcolor: open ? tokens.surface : "transparent", color: open ? tokens.text : tokens.text2,
                            transition: "background .12s",
                            "&:hover": { bgcolor: open ? tokens.surface2 : "rgba(0,0,0,0.04)" },
                          }}>
                          {open ? "Review" : "View"}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}
