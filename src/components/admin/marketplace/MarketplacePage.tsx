"use client";

import { useState } from "react";
import {
  Box, Paper, Typography, Stack, Tabs, Tab, TextField, Select, MenuItem,
  InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, Button, Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

const FREELANCER_SERVICES = [
  { id: 1, title: "Professional Khmer Translation Services", freelancer: "Sophea Chan", category: "Translation", price: "$50-$200", status: "Live", featured: true, views: 1284, orders: 47, adSpend: "$120" },
  { id: 2, title: "Logo Design - Modern & Professional", freelancer: "Vibol Sok", category: "Design", price: "$100-$500", status: "Pending Approval", featured: false, views: 0, orders: 0, adSpend: "$0" },
  { id: 3, title: "Facebook Ads Management for Cambodia Market", freelancer: "Chenda Rath", category: "Marketing", price: "$300-$1000", status: "Live", featured: true, views: 2847, orders: 124, adSpend: "$450" },
  { id: 4, title: "WordPress Website Development", freelancer: "David Kim", category: "Web Dev", price: "$500-$2000", status: "Live", featured: false, views: 892, orders: 34, adSpend: "$0" },
];

const CLIENT_GIGS = [
  { id: 1, title: "E-commerce Website Development", client: "Sarah Johnson", category: "Web Dev", budget: "$2000-$5000", type: "One-off", status: "Open", bids: 12, featured: true, posted: "2 days ago", adSpend: "$80" },
  { id: 2, title: "Translate 50 Product Descriptions to Khmer", client: "TechStore KH", category: "Translation", budget: "$200-$400", type: "One-off", status: "In Progress", bids: 8, featured: false, posted: "5 days ago", adSpend: "$0" },
  { id: 3, title: "Social Media Manager - Part Time", client: "Local Restaurant", category: "Marketing", budget: "$400/month", type: "Part-time", status: "Open", bids: 23, featured: true, posted: "1 day ago", adSpend: "$150" },
  { id: 4, title: "Ongoing SEO Specialist", client: "StartupXYZ", category: "Marketing", budget: "$800/month", type: "Full-time", status: "Closed", bids: 34, featured: false, posted: "1 week ago", adSpend: "$0" },
];

const HIRING = [
  { id: 1, freelancer: "Sophea Chan", title: "Senior Khmer Translator", category: "Translation", rate: "$25/hour", availability: "Full-time", status: "Available", featured: true, hires: 3, adSpend: "$200" },
  { id: 2, freelancer: "David Kim", title: "Full Stack Developer", category: "Web Dev", rate: "$50/hour", availability: "Part-time", status: "Available", featured: true, hires: 8, adSpend: "$350" },
  { id: 3, freelancer: "Designer Pro", title: "UI/UX Designer", category: "Design", rate: "$40/hour", availability: "Full-time", status: "Hired", featured: false, hires: 12, adSpend: "$0" },
];

const DISPUTES = [
  { id: 1, order: "Social Media Graphics", buyer: "Michael Chen", seller: "Vibol Sok", type: "Client Gig", reason: "Quality not as promised", opened: "2 days ago", value: "$200", status: "Open" },
  { id: 2, order: "Logo Design Project", buyer: "CafeKH", seller: "Creative Studio", type: "Freelancer Service", reason: "Missed deadline", opened: "1 week ago", value: "$350", status: "Under Review" },
  { id: 3, order: "Content Writing", buyer: "BlogSite", seller: "Writer99", type: "Client Gig", reason: "Plagiarized content", opened: "3 days ago", value: "$120", status: "Open" },
];

const REVIEWS = [
  { id: 1, listing: "WordPress Development", reviewer: "Sarah Johnson", type: "Freelancer Service", rating: 5, comment: "Excellent work! Very professional and delivered on time.", date: "2 hours ago", status: "Approved" },
  { id: 2, listing: "Translation Services", reviewer: "TechStore", type: "Freelancer Service", rating: 4, comment: "Good quality translation, minor errors.", date: "5 hours ago", status: "Approved" },
  { id: 3, listing: "Logo Design", reviewer: "Startup123", type: "Client Gig", rating: 1, comment: "Terrible! This seller is a scammer!!! DO NOT USE!!!", date: "1 day ago", status: "Flagged" },
  { id: 4, listing: "Social Media Management", reviewer: "BizOwner", type: "Hiring", rating: 5, comment: "Amazing results! My engagement increased by 300%!", date: "2 days ago", status: "Pending" },
];

const serviceStatusColor = (s: string) => s === "Live" ? "success" : s === "Pending Approval" ? "warning" : "error";
const gigStatusColor = (s: string) => s === "Open" ? "success" : s === "In Progress" ? "primary" : "default";
const disputeStatusColor = (s: string) => s === "Open" ? "error" : "warning";
const reviewStatusColor = (s: string) => s === "Approved" ? "success" : s === "Flagged" ? "error" : "warning";

export default function MarketplacePage() {
  const [tab, setTab] = useState(0);

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

        {/* Freelancer Services */}
        {tab === 0 && (
          <Box>
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={17} mb={0.5}>Freelancer Services</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>One-off services posted and advertised by freelancers</Typography>
              <Stack direction="row" gap={2}>
                <TextField size="small" placeholder="Search services..." sx={{ flex: 1 }}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: "text.disabled" }} /></InputAdornment> } }} />
                <Select size="small" defaultValue="all" sx={{ minWidth: 130 }}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Live">Live</MenuItem>
                  <MenuItem value="Pending">Pending Approval</MenuItem>
                </Select>
                <Select size="small" defaultValue="all" sx={{ minWidth: 140 }}>
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="Design">Design</MenuItem>
                  <MenuItem value="Translation">Translation</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Web Dev">Web Dev</MenuItem>
                </Select>
              </Stack>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    {["Service", "Freelancer", "Category", "Price", "Status", "Performance", "Ad Spend", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {FREELANCER_SERVICES.map(s => (
                    <TableRow key={s.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{s.title}</Typography>
                        {s.featured && <Chip label="Featured Ad" size="small" color="warning" variant="outlined" sx={{ mt: 0.5, height: 18, fontSize: 10 }} />}
                      </TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{s.freelancer}</Typography></TableCell>
                      <TableCell><Chip label={s.category} size="small" color="secondary" variant="outlined" /></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500}>{s.price}</Typography></TableCell>
                      <TableCell><Chip label={s.status} size="small" color={serviceStatusColor(s.status) as any} /></TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">{s.views} views</Typography>
                        <Typography variant="caption" color="text.secondary">{s.orders} orders</Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500} color="success.main">{s.adSpend}</Typography></TableCell>
                      <TableCell>
                        <Stack direction="row" gap={0.5}>
                          <IconButton size="small"><VisibilityIcon fontSize="small" color="primary" /></IconButton>
                          <IconButton size="small"><CheckCircleIcon fontSize="small" color="success" /></IconButton>
                          <IconButton size="small"><CancelIcon fontSize="small" color="error" /></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Client Gigs */}
        {tab === 1 && (
          <Box>
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={17} mb={0.5}>Client Gigs</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>Job listings posted by clients where freelancers bid</Typography>
              <Stack direction="row" gap={2}>
                <TextField size="small" placeholder="Search client gigs..." sx={{ flex: 1 }}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: "text.disabled" }} /></InputAdornment> } }} />
                <Select size="small" defaultValue="all" sx={{ minWidth: 130 }}>
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="One-off">One-off</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Full-time">Full-time</MenuItem>
                </Select>
                <Select size="small" defaultValue="all" sx={{ minWidth: 130 }}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </Stack>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    {["Gig", "Client", "Category", "Budget", "Type", "Status", "Bids", "Ad Spend", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {CLIENT_GIGS.map(g => (
                    <TableRow key={g.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{g.title}</Typography>
                        {g.featured && <Chip label="Featured Ad" size="small" color="warning" variant="outlined" sx={{ mt: 0.5, height: 18, fontSize: 10 }} />}
                        <Typography variant="caption" color="text.disabled" display="block">Posted {g.posted}</Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{g.client}</Typography></TableCell>
                      <TableCell><Chip label={g.category} size="small" color="primary" variant="outlined" /></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500}>{g.budget}</Typography></TableCell>
                      <TableCell><Chip label={g.type} size="small" color={g.type === "Full-time" ? "secondary" : g.type === "Part-time" ? "primary" : "success"} variant="outlined" /></TableCell>
                      <TableCell><Chip label={g.status} size="small" color={gigStatusColor(g.status) as any} /></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500}>{g.bids}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500} color="success.main">{g.adSpend}</Typography></TableCell>
                      <TableCell><IconButton size="small"><VisibilityIcon fontSize="small" color="primary" /></IconButton></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Hiring */}
        {tab === 2 && (
          <Box>
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={17} mb={0.5}>Freelancer Hiring</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>Freelancers available for clients to hire as part-time/full-time employees</Typography>
              <Stack direction="row" gap={2}>
                <TextField size="small" placeholder="Search freelancers..." sx={{ flex: 1 }}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: "text.disabled" }} /></InputAdornment> } }} />
                <Select size="small" defaultValue="all" sx={{ minWidth: 150 }}>
                  <MenuItem value="all">All Availability</MenuItem>
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                </Select>
              </Stack>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    {["Freelancer", "Title", "Category", "Rate", "Availability", "Status", "Hires", "Ad Spend", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {HIRING.map(h => (
                    <TableRow key={h.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{h.freelancer}</Typography>
                        {h.featured && <Chip label="Featured Ad" size="small" color="warning" variant="outlined" sx={{ mt: 0.5, height: 18, fontSize: 10 }} />}
                      </TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{h.title}</Typography></TableCell>
                      <TableCell><Chip label={h.category} size="small" color="secondary" variant="outlined" /></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500}>{h.rate}</Typography></TableCell>
                      <TableCell><Chip label={h.availability} size="small" color={h.availability === "Full-time" ? "secondary" : "primary"} variant="outlined" /></TableCell>
                      <TableCell><Chip label={h.status} size="small" color={h.status === "Available" ? "success" : "default"} /></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500}>{h.hires}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500} color="success.main">{h.adSpend}</Typography></TableCell>
                      <TableCell><IconButton size="small"><VisibilityIcon fontSize="small" color="primary" /></IconButton></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Disputes */}
        {tab === 3 && (
          <Box>
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={17} mb={0.5}>Active Disputes & Reports</Typography>
              <Typography variant="body2" color="text.secondary">Across all marketplace features</Typography>
            </Box>
            <Stack divider={<Divider />}>
              {DISPUTES.map(d => (
                <Box key={d.id} sx={{ p: 3, "&:hover": { bgcolor: "grey.50" } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                        <Typography fontWeight={600} variant="body1">Dispute #{d.id}: {d.order}</Typography>
                        <Chip label={d.type} size="small" color="secondary" variant="outlined" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        <b>{d.buyer}</b> vs <b>{d.seller}</b>
                      </Typography>
                      <Typography variant="body2">Reason: {d.reason}</Typography>
                      <Typography variant="caption" color="text.disabled">Opened {d.opened} · Value: {d.value}</Typography>
                    </Box>
                    <Chip label={d.status} size="small" color={disputeStatusColor(d.status) as any} />
                  </Stack>
                  <Stack direction="row" gap={1}>
                    <Button size="small" variant="contained">View Details</Button>
                    <Button size="small" variant="contained" color="success">Refund Buyer</Button>
                    <Button size="small" variant="contained" color="secondary">Pay Seller</Button>
                    <Button size="small" variant="contained" color="warning">Partial Refund</Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Reviews */}
        {tab === 4 && (
          <Box>
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={17} mb={0.5}>Reviews & Ratings Moderation</Typography>
              <Typography variant="body2" color="text.secondary">Across all marketplace features</Typography>
            </Box>
            <Stack divider={<Divider />}>
              {REVIEWS.map(r => (
                <Box key={r.id} sx={{ p: 3, "&:hover": { bgcolor: "grey.50" } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Box>
                      <Stack direction="row" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
                        <Typography fontWeight={600} variant="body2">{r.reviewer}</Typography>
                        <Typography variant="caption" color="text.disabled">·</Typography>
                        <Typography variant="body2" color="text.secondary">{r.listing}</Typography>
                        <Chip label={r.type} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                        <Typography variant="caption" color="text.disabled">{r.date}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" gap={0.5} mb={1}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Typography key={i} variant="caption" color={i < r.rating ? "warning.main" : "text.disabled"}>★</Typography>
                        ))}
                        <Typography variant="caption" fontWeight={600} ml={0.5}>{r.rating}.0</Typography>
                      </Stack>
                      <Typography variant="body2">{r.comment}</Typography>
                    </Box>
                    <Chip label={r.status} size="small" color={reviewStatusColor(r.status) as any} />
                  </Stack>
                  <Stack direction="row" gap={1}>
                    <Button size="small" variant="contained" color="success" startIcon={<ThumbUpIcon />}>Approve</Button>
                    <Button size="small" variant="contained" color="warning" startIcon={<VisibilityIcon />}>Hide</Button>
                    <Button size="small" variant="contained" color="error" startIcon={<ThumbDownIcon />}>Remove</Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
