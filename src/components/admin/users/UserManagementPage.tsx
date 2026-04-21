"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import ShieldIcon from "@mui/icons-material/Shield";
import EmailIcon from "@mui/icons-material/Email";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import BlockIcon from "@mui/icons-material/Block";
import BadgeIcon from "@mui/icons-material/Badge";
import { api, AdminUser } from "@/lib/api";

const ROLES = [
  { name: "Super Admin", permissions: "Full system access", users: 1, color: "error" },
  { name: "Finance", permissions: "Payments, withdrawals, financial reports", users: 0, color: "success" },
  { name: "Support", permissions: "User support, disputes, reviews", users: 0, color: "primary" },
  { name: "Moderator", permissions: "Content moderation, gig approval", users: 0, color: "secondary" },
  { name: "Tech Support", permissions: "Technical monitoring", users: 0, color: "warning" },
] as const;

function roleLabel(user: AdminUser): string {
  if (user.is_freelancer && user.is_client) return "Both";
  if (user.is_freelancer) return "Freelancer";
  if (user.is_client) return "Client";
  return "—";
}

function kycColor(status: string | null) {
  if (status === "approved") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected") return "error";
  return "default";
}

function kycLabel(user: AdminUser): string {
  if (user.is_verified_id) return "Approved";
  if (!user.kyc_status) return "None";
  return user.kyc_status.charAt(0).toUpperCase() + user.kyc_status.slice(1);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = useCallback(async (p: number, s: string, r: string, k: string) => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers({
        page: p,
        search: s || undefined,
        role: r !== "all" ? r : undefined,
        kyc: k !== "all" ? k : undefined,
      });
      setUsers(res.data);
      setTotalPages(res.meta.last_page);
      setTotal(res.meta.total);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search, reset page on filter change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, search, roleFilter, kycFilter);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, roleFilter, kycFilter, fetchUsers]);

  // Re-fetch on page change
  useEffect(() => {
    fetchUsers(page, search, roleFilter, kycFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>User & Role Management</Typography>
        <Typography color="text.secondary">Manage all users, roles, and permissions</Typography>
      </Box>

      {/* RBAC Roles (static for now) */}
      <Typography fontWeight={700} fontSize={18} mb={2}>Internal Roles & Permissions</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {ROLES.map((role, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, "&:hover": { boxShadow: 3 }, transition: "box-shadow 0.2s" }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${role.color}.50`, display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5 }}>
                <ShieldIcon sx={{ color: `${role.color}.main`, fontSize: 22 }} />
              </Box>
              <Typography fontWeight={700} fontSize={14} mb={0.5}>{role.name}</Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>{role.permissions}</Typography>
              <Typography variant="caption" color="text.secondary">{role.users} users</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* User Directory */}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
          <Typography fontWeight={700} fontSize={18} mb={2.5}>User Directory</Typography>
          <Stack direction={{ xs: "column", md: "row" }} gap={2}>
            <TextField
              size="small"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ flex: 1 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Select size="small" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="freelancer">Freelancer</MenuItem>
              <MenuItem value="client">Client</MenuItem>
              <MenuItem value="both">Both</MenuItem>
            </Select>
            <Select size="small" value={kycFilter} onChange={e => setKycFilter(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="all">All KYC</MenuItem>
              <MenuItem value="pending">KYC Pending</MenuItem>
              <MenuItem value="approved">KYC Approved</MenuItem>
              <MenuItem value="rejected">KYC Rejected</MenuItem>
              <MenuItem value="none">No KYC</MenuItem>
            </Select>
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography color="text.secondary">No users found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  {["User", "Role", "KYC", "Rating", "Joined", "Actions"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <>
                    <TableRow
                      key={user.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Avatar src={user.avatar_url ?? undefined} sx={{ width: 38, height: 38, bgcolor: "primary.main", fontSize: 14, fontWeight: 700 }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{user.name}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">{user.email ?? user.telephone}</Typography>
                            {user.email && user.telephone && (
                              <Typography variant="caption" color="text.disabled" display="block">{user.telephone}</Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={roleLabel(user)} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={0.5}>
                          <Chip
                            label={kycLabel(user)}
                            size="small"
                            color={kycColor(user.is_verified_id ? "approved" : user.kyc_status) as any}
                            variant="outlined"
                          />
                          {user.is_verified_id && <BadgeIcon sx={{ fontSize: 14, color: "success.main" }} />}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {user.freelancer_rating ? (
                          <Stack direction="row" alignItems="center" gap={0.5}>
                            <Typography variant="body2" fontWeight={600}>{parseFloat(user.freelancer_rating).toFixed(1)}</Typography>
                            <Typography variant="caption" color="warning.main">★</Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.disabled">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{formatDate(user.created_at)}</Typography>
                      </TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <Stack direction="row" gap={0.5}>
                          <Tooltip title="Edit user">
                            <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>

                    {/* Expandable detail panel */}
                    <TableRow key={`detail-${user.id}`}>
                      <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                        <Collapse in={selectedUser === user.id} unmountOnExit>
                          <Box sx={{ p: 3, bgcolor: "grey.50", borderTop: "1px solid", borderColor: "grey.200" }}>
                            <Typography fontWeight={700} mb={2}>User Details: {user.name}</Typography>
                            <Grid container spacing={3}>
                              <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase">Profile</Typography>
                                <Stack gap={0.5} mt={1}>
                                  {[
                                    ["Email", user.email ?? "—"],
                                    ["Phone", user.telephone ?? "—"],
                                    ["Role", roleLabel(user)],
                                    ["Joined", formatDate(user.created_at)],
                                    ["Email verified", user.email_verified_at ? formatDate(user.email_verified_at) : "No"],
                                  ].map(([k, v]) => (
                                    <Typography key={k} variant="body2">
                                      <Box component="span" color="text.secondary">{k}: </Box>{v}
                                    </Typography>
                                  ))}
                                </Stack>
                              </Grid>
                              <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase">Activity</Typography>
                                <Stack gap={0.5} mt={1}>
                                  <Typography variant="body2"><Box component="span" color="text.secondary">KYC: </Box>{kycLabel(user)}</Typography>
                                  <Typography variant="body2"><Box component="span" color="text.secondary">Rating: </Box>{user.freelancer_rating ? `${parseFloat(user.freelancer_rating).toFixed(1)} ★` : "—"}</Typography>
                                  <Typography variant="body2"><Box component="span" color="text.secondary">Completed orders: </Box>{user.completed_orders ?? 0}</Typography>
                                </Stack>
                              </Grid>
                              <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase">Quick Actions</Typography>
                                <Stack gap={1} mt={1}>
                                  <Button size="small" variant="contained" color="inherit" startIcon={<EmailIcon />} fullWidth disabled>Send Email</Button>
                                  <Button size="small" variant="contained" color="warning" startIcon={<PersonOffIcon />} fullWidth disabled>Suspend User</Button>
                                  <Button size="small" variant="contained" color="error" startIcon={<BlockIcon />} fullWidth disabled>Ban User</Button>
                                </Stack>
                                <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: "block" }}>
                                  Suspend/Ban coming soon
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderTop: "1px solid", borderColor: "grey.200" }}>
          <Typography variant="body2" color="text.secondary">
            {total} user{total !== 1 ? "s" : ""} found
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            size="small"
            color="primary"
          />
        </Stack>
      </Paper>
    </Box>
  );
}
