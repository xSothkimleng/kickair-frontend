"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Pagination,
  Card,
  CardActionArea,
  CardContent,
  Avatar,
} from "@mui/material";
import { DescriptionOutlined, NewReleasesOutlined } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Proposal, ProposalStatus } from "@/types/job";

type Filter = "all" | ProposalStatus;

function statusColor(status: ProposalStatus) {
  switch (status) {
    case "pending":
      return { bgcolor: "rgba(234,88,12,0.1)", color: "#b45309" };
    case "accepted":
      return { bgcolor: "rgba(22,163,74,0.1)", color: "#15803d" };
    case "rejected":
      return { bgcolor: "rgba(239,68,68,0.1)", color: "#b91c1c" };
    case "withdrawn":
      return { bgcolor: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)" };
    default:
      return { bgcolor: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)" };
  }
}

function statusLabel(status: ProposalStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

export default function ProposalsContent() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const fetchProposals = async (p: number) => {
    try {
      setLoading(true);
      setError(null);
      const resp = await api.getFreelancerProposals(p);
      setProposals(resp.data);
      setLastPage(resp.meta?.last_page ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch proposals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals(page);
  }, [page]);

  const filtered =
    activeFilter === "all" ? proposals : proposals.filter(p => p.status === activeFilter);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>My Proposals</Typography>
        <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)" }}>
          Track all your submitted proposals
        </Typography>
      </Box>

      {/* Filter pills */}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {FILTERS.map(f => (
          <Button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            sx={{
              fontSize: 12,
              textTransform: "none",
              borderRadius: 10,
              px: 2,
              height: 32,
              ...(activeFilter === f.value
                ? { bgcolor: "black", color: "white", "&:hover": { bgcolor: "black" } }
                : { bgcolor: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.6)", "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }),
            }}>
            {f.label}
          </Button>
        ))}
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
        {loading ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress size={32} sx={{ color: "rgba(0,0,0,0.4)" }} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography sx={{ fontSize: 13, color: "rgba(239,68,68,0.8)", mb: 2 }}>{error}</Typography>
            <Button onClick={() => fetchProposals(page)} sx={{ fontSize: 12, textTransform: "none" }}>
              Try again
            </Button>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <DescriptionOutlined sx={{ fontSize: 48, color: "rgba(0,0,0,0.2)", mb: 2 }} />
            <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)" }}>
              {activeFilter === "all" ? "No proposals yet" : `No ${activeFilter} proposals`}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {filtered.map(proposal => (
              <Card
                elevation={0}
                key={proposal.id}
                sx={{
                  borderRadius: 3,
                  border: "1px solid rgba(0,0,0,0.07)",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: "rgba(0,0,0,0.2)", boxShadow: 1 },
                }}>
                <CardActionArea onClick={() => router.push(`/proposals/${proposal.id}`)} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack direction="row" spacing={1.5} alignItems="flex-start" flex={1}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: "rgba(0,113,227,0.1)", mt: 0.25 }}>
                          <DescriptionOutlined sx={{ fontSize: 18, color: "#0071e3" }} />
                        </Avatar>
                        <Box flex={1} minWidth={0}>
                          <Stack direction="row" alignItems="center" spacing={1} mb={0.25}>
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }} noWrap>
                              {proposal.job_post?.title ?? "Job Post"}
                            </Typography>
                            {proposal.is_updated && (
                              <Chip
                                icon={<NewReleasesOutlined sx={{ fontSize: 12 }} />}
                                label="Updated"
                                size="small"
                                sx={{ fontSize: 10, height: 20, bgcolor: "rgba(37,99,235,0.1)", color: "#1e40af" }}
                              />
                            )}
                          </Stack>
                          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                            Submitted {formatDate(proposal.created_at)}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack alignItems="flex-end" spacing={0.5} flexShrink={0}>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#15803d" }}>
                          {formatCurrency(proposal.price)}
                        </Typography>
                        <Chip
                          label={statusLabel(proposal.status)}
                          size="small"
                          sx={{ fontSize: 11, height: 22, ...statusColor(proposal.status) }}
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        )}

        {lastPage > 1 && !loading && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={lastPage}
              page={page}
              onChange={(_, p) => setPage(p)}
              size="small"
              shape="rounded"
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
