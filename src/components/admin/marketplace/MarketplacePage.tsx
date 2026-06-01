"use client";

import { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Stack, Tabs, Tab, TextField, Select, MenuItem,
  InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, CircularProgress, Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Service } from "@/types/service";
import DisputeReviewSection from "../trust/DisputeReviewSection";

function EmptyState({ label }: { label: string }) {
  return (
    <Box sx={{ py: 10, textAlign: "center" }}>
      <Typography variant="body2" color="text.disabled">{label}</Typography>
    </Box>
  );
}

export default function MarketplacePage() {
  const [tab, setTab] = useState(0);
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");

  useEffect(() => {
    if (tab !== 0) return;
    setServicesLoading(true);
    setServicesError(null);
    api.get("/api/services")
      .then((res) => setServices(res.data ?? []))
      .catch(() => setServicesError("Failed to load services."))
      .finally(() => setServicesLoading(false));
  }, [tab]);

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    (s.freelancer_profile?.user?.name ?? "").toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const lowestPrice = (s: Service) => {
    const prices = s.pricing_options?.map(p => Number(p.price_raw)).filter(p => p > 0) ?? [];
    return prices.length ? Math.min(...prices) : null;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Marketplace Operations</Typography>
        <Typography color="text.secondary">Manage all KickAir marketplace activities</Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: "1px solid", borderColor: "grey.200", px: 2 }}
        >
          <Tab icon={<WorkIcon fontSize="small" />} iconPosition="start" label="Freelancer Services" />
          <Tab icon={<PeopleIcon fontSize="small" />} iconPosition="start" label="Client Gigs" />
          <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Freelancer Hiring" />
          <Tab icon={<WarningAmberIcon fontSize="small" />} iconPosition="start" label="Disputes" />
          <Tab icon={<ThumbUpIcon fontSize="small" />} iconPosition="start" label="Reviews" />
        </Tabs>

        {/* ── Freelancer Services (real API) ── */}
        {tab === 0 && (
          <Box>
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={17} mb={0.5}>Freelancer Services</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>Services posted by freelancers on the platform</Typography>
              <TextField
                size="small"
                placeholder="Search by title or freelancer…"
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
                sx={{ width: 320 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Box>

            {servicesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : servicesError ? (
              <Box sx={{ p: 3 }}><Alert severity="error">{servicesError}</Alert></Box>
            ) : filteredServices.length === 0 ? (
              <EmptyState label="No services found." />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      {["Service", "Freelancer", "Category", "Price from", "Rating", "Orders", "Actions"].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredServices.map(s => {
                      const price = lowestPrice(s);
                      return (
                        <TableRow key={s.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>{s.title}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {s.freelancer_profile?.user?.name ?? "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {s.category ? (
                              <Chip label={s.category.category_name} size="small" color="secondary" variant="outlined" />
                            ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {price != null ? `$${price}` : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {s.rating_count > 0 ? (
                              <Typography variant="body2">{parseFloat(s.rating_average ?? "0").toFixed(1)} ★ ({s.rating_count})</Typography>
                            ) : (
                              <Typography variant="caption" color="text.disabled">No reviews</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>{s.orders_count}</Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => router.push(`/explore-services/${s.id}`)}>
                              <VisibilityIcon fontSize="small" color="primary" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* ── Client Gigs ── */}
        {tab === 1 && (
          <Box>
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={17} mb={0.5}>Client Gigs</Typography>
              <Typography variant="body2" color="text.secondary">Job listings posted by clients</Typography>
            </Box>
            <EmptyState label="Client gig management coming soon." />
          </Box>
        )}

        {/* ── Hiring ── */}
        {tab === 2 && (
          <Box>
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={17} mb={0.5}>Freelancer Hiring</Typography>
              <Typography variant="body2" color="text.secondary">Freelancers available for direct hire</Typography>
            </Box>
            <EmptyState label="Hiring management coming soon." />
          </Box>
        )}

        {/* ── Disputes (real API via shared component) ── */}
        {tab === 3 && (
          <Box sx={{ p: 3 }}>
            <DisputeReviewSection />
          </Box>
        )}

        {/* ── Reviews ── */}
        {tab === 4 && (
          <Box>
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={17} mb={0.5}>Reviews & Ratings</Typography>
              <Typography variant="body2" color="text.secondary">Review moderation coming soon.</Typography>
            </Box>
            <EmptyState label="Review moderation coming soon." />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
