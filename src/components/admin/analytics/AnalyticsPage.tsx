"use client";

import { useState } from "react";
import {
  Box, Grid, Paper, Typography, Stack, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Button, LinearProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RepeatIcon from "@mui/icons-material/Repeat";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddIcon from "@mui/icons-material/Add";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";

const BUYER_FUNNEL = [
  { stage: "Visits", count: 12450, pct: 100 },
  { stage: "Signups", count: 2847, pct: 22.9 },
  { stage: "Profile Complete", count: 1823, pct: 14.6 },
  { stage: "First Search", count: 1456, pct: 11.7 },
  { stage: "First Order", count: 892, pct: 7.2 },
  { stage: "Completed Order", count: 734, pct: 5.9 },
];

const SELLER_FUNNEL = [
  { stage: "Visits", count: 8920, pct: 100 },
  { stage: "Signups", count: 1234, pct: 13.8 },
  { stage: "Profile Complete", count: 892, pct: 10.0 },
  { stage: "First Gig Posted", count: 567, pct: 6.4 },
  { stage: "Gig Approved", count: 489, pct: 5.5 },
  { stage: "First Order", count: 234, pct: 2.6 },
];

const COHORT_DATA = {
  weeks: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
  active: [450, 312, 234, 189, 167, 156],
  retention: [100, 69.3, 52.0, 42.0, 37.1, 34.7],
};

const CATEGORY_PERF = {
  categories: ["Design", "Translation", "Marketing", "Web Dev", "Writing"],
  orders: [1240, 892, 1567, 734, 445],
  gmv: [89450, 45230, 124890, 167820, 28940],
};

const PROVINCE_DATA = [
  { id: 0, value: 45.2, label: "Phnom Penh" },
  { id: 1, value: 18.5, label: "Siem Reap" },
  { id: 2, value: 12.3, label: "Battambang" },
  { id: 3, value: 8.7, label: "Kampot" },
  { id: 4, value: 15.3, label: "Others" },
];

const CAMPAIGNS = [
  { id: 1, name: "New Year 2025 Promo", type: "Promo Code", code: "NY2025", uses: 342, revenue: "$12,840", status: "Active", start: "2025-01-01", end: "2025-01-31" },
  { id: 2, name: "Referral Program", type: "Referral", code: "REF-*", uses: 1847, revenue: "$48,920", status: "Active", start: "2024-12-01", end: "Ongoing" },
  { id: 3, name: "Featured Gigs - Design", type: "Featured", code: "N/A", uses: 89, revenue: "$6,780", status: "Active", start: "2025-01-15", end: "2025-01-30" },
  { id: 4, name: "Holiday Discount", type: "Promo Code", code: "HOLIDAY20", uses: 567, revenue: "$18,450", status: "Ended", start: "2024-12-15", end: "2024-12-31" },
];

export default function AnalyticsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Analytics & Growth</Typography>
        <Typography color="text.secondary">Understand user behavior and grow your marketplace</Typography>
      </Box>

      {/* Summary Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: "Weekly Active Users", value: "8,947", change: "+15.2% from last week", icon: PeopleIcon, color: "primary" },
          { label: "User Retention (30d)", value: "34.7%", change: "+3.1% from last month", icon: BarChartIcon, color: "secondary" },
          { label: "Avg Order Value", value: "$247", change: "+8.4% from last month", icon: AttachMoneyIcon, color: "success" },
          { label: "Repeat Buyers", value: "42.3%", change: "+5.8% from last month", icon: RepeatIcon, color: "warning" },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary">{m.label}</Typography>
                  <Icon sx={{ color: `${m.color}.main`, fontSize: 20 }} />
                </Stack>
                <Typography variant="h5" fontWeight={700}>{m.value}</Typography>
                <Stack direction="row" alignItems="center" gap={0.5} mt={0.5}>
                  <TrendingUpIcon sx={{ fontSize: 14, color: "success.main" }} />
                  <Typography variant="caption" color="success.main">{m.change}</Typography>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid", borderColor: "grey.200", px: 2 }}>
          <Tab label="Conversion Funnels" />
          <Tab label="Cohorts & Retention" />
          <Tab label="Campaigns" />
        </Tabs>

        {/* Funnels */}
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <Typography fontWeight={700} fontSize={17} mb={3}>Buyer Conversion Funnel</Typography>
                <Stack gap={2}>
                  {BUYER_FUNNEL.map((s, i) => (
                    <Box key={i}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" fontWeight={500}>{s.stage}</Typography>
                        <Typography variant="body2" color="text.secondary">{s.count.toLocaleString()} ({s.pct}%)</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={s.pct} sx={{ height: 28, borderRadius: 1, bgcolor: "grey.200", "& .MuiLinearProgress-bar": { bgcolor: "primary.main", borderRadius: 1 } }} />
                    </Box>
                  ))}
                </Stack>
                <Box sx={{ mt: 3, p: 2, bgcolor: "primary.50", borderRadius: 2 }}>
                  <Typography fontWeight={600} variant="body2" mb={1}>Key Insights</Typography>
                  <Typography variant="caption" display="block">• Drop-off at profile completion: <b>36%</b></Typography>
                  <Typography variant="caption" display="block">• Search to order conversion: <b>61.3%</b></Typography>
                  <Typography variant="caption" display="block">• Overall visit to purchase: <b>5.9%</b></Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <Typography fontWeight={700} fontSize={17} mb={3}>Seller Conversion Funnel</Typography>
                <Stack gap={2}>
                  {SELLER_FUNNEL.map((s, i) => (
                    <Box key={i}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" fontWeight={500}>{s.stage}</Typography>
                        <Typography variant="body2" color="text.secondary">{s.count.toLocaleString()} ({s.pct}%)</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={s.pct} sx={{ height: 28, borderRadius: 1, bgcolor: "grey.200", "& .MuiLinearProgress-bar": { bgcolor: "secondary.main", borderRadius: 1 } }} />
                    </Box>
                  ))}
                </Stack>
                <Box sx={{ mt: 3, p: 2, bgcolor: "secondary.50", borderRadius: 2 }}>
                  <Typography fontWeight={600} variant="body2" mb={1}>Key Insights</Typography>
                  <Typography variant="caption" display="block">• Gig posting rate: <b>63.6%</b> of complete profiles</Typography>
                  <Typography variant="caption" display="block">• Approval rate: <b>86.3%</b> of posted gigs</Typography>
                  <Typography variant="caption" display="block">• First order conversion: <b>47.9%</b> of approved</Typography>
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <Typography fontWeight={700} mb={2}>Category Performance</Typography>
                <BarChart
                  xAxis={[{ data: CATEGORY_PERF.categories, scaleType: "band" }]}
                  series={[
                    { data: CATEGORY_PERF.orders, label: "Orders", color: "#3b82f6" },
                  ]}
                  height={280}
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 5 }}>
                <Typography fontWeight={700} mb={2}>Users by Province</Typography>
                <PieChart
                  series={[{ data: PROVINCE_DATA, innerRadius: 40 }]}
                  height={280}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Cohorts */}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography fontWeight={700} fontSize={17} mb={3}>User Retention — January 2025 Cohort</Typography>
            <LineChart
              xAxis={[{ data: COHORT_DATA.weeks, scaleType: "band" }]}
              series={[
                { data: COHORT_DATA.active, label: "Active Users", color: "#3b82f6" },
                { data: COHORT_DATA.retention, label: "Retention %", color: "#10b981" },
              ]}
              height={320}
            />
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {[
                { label: "Week 1 Retention", value: "100%", sub: "450 users", color: "primary.50" },
                { label: "Week 4 Retention", value: "42.0%", sub: "189 users", color: "secondary.50" },
                { label: "Week 6 Retention", value: "34.7%", sub: "156 users", color: "success.50" },
              ].map((r, i) => (
                <Grid key={i} size={{ xs: 12, md: 4 }}>
                  <Box sx={{ p: 2.5, bgcolor: r.color, borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>{r.label}</Typography>
                    <Typography variant="h5" fontWeight={700}>{r.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{r.sub}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              {[
                { title: "Repeat Buyers", rows: [["1 order", "57.7%"], ["2-3 orders", "28.4%"], ["4-5 orders", "9.2%"], ["6+ orders", "4.7%"]] },
                { title: "Repeat Sellers", rows: [["1 gig", "48.9%"], ["2-3 gigs", "32.1%"], ["4-5 gigs", "12.8%"], ["6+ gigs", "6.2%"]] },
                { title: "Best Performing Regions", rows: [["Phnom Penh", "$187K GMV"], ["Siem Reap", "$89K GMV"], ["Battambang", "$54K GMV"], ["Kampot", "$32K GMV"]] },
              ].map((card, i) => (
                <Grid key={i} size={{ xs: 12, md: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography fontWeight={700} mb={2}>{card.title}</Typography>
                    <Stack gap={1}>
                      {card.rows.map(([label, val]) => (
                        <Stack key={label} direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">{label}</Typography>
                          <Typography variant="body2" fontWeight={600}>{val}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Campaigns */}
        {tab === 2 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={17}>Campaign Management</Typography>
              <Button variant="contained" size="small" startIcon={<AddIcon />}>Create New Campaign</Button>
            </Stack>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    {["Campaign", "Type", "Code", "Uses", "Revenue", "Duration", "Status", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {CAMPAIGNS.map(c => (
                    <TableRow key={c.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={500}>{c.name}</Typography></TableCell>
                      <TableCell><Chip label={c.type} size="small" color="secondary" variant="outlined" /></TableCell>
                      <TableCell><Typography variant="body2" sx={{ fontFamily: "monospace" }}>{c.code}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600}>{c.uses}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={700} color="success.main">{c.revenue}</Typography></TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">{c.start}</Typography>
                        <Typography variant="caption" color="text.secondary">to {c.end}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={c.status} size="small" color={c.status === "Active" ? "success" : "default"} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" gap={1}>
                          <Button size="small" variant="text" color="primary">View</Button>
                          <Button size="small" variant="text" color="inherit">Edit</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Grid container spacing={3} sx={{ p: 3 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography fontWeight={700} mb={2}>Campaign Summary</Typography>
                  <Stack gap={1}>
                    {[["Total Campaigns", "4"], ["Active Campaigns", "3"], ["Total Uses", "2,845"]].map(([k, v]) => (
                      <Stack key={k} direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">{k}</Typography>
                        <Typography variant="body2" fontWeight={700}>{v}</Typography>
                      </Stack>
                    ))}
                    <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: "1px solid", borderColor: "grey.200" }}>
                      <Typography variant="body2" fontWeight={600}>Total Revenue</Typography>
                      <Typography variant="body2" fontWeight={700} color="success.main">$86,990</Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography fontWeight={700} mb={2}>Best Performing</Typography>
                  <Box sx={{ p: 2, bgcolor: "primary.50", borderRadius: 2 }}>
                    <Typography fontWeight={700} mb={1}>Referral Program</Typography>
                    {[["Uses:", "1,847"], ["Revenue:", "$48,920"], ["ROI:", "387%"]].map(([k, v]) => (
                      <Stack key={k} direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">{k}</Typography>
                        <Typography variant="caption" fontWeight={600}>{v}</Typography>
                      </Stack>
                    ))}
                  </Box>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography fontWeight={700} mb={2}>Quick Actions</Typography>
                  <Stack gap={1}>
                    <Button variant="contained" fullWidth size="small">Create Promo Code</Button>
                    <Button variant="contained" color="secondary" fullWidth size="small">Feature Gigs</Button>
                    <Button variant="contained" color="success" fullWidth size="small">Set Homepage Banner</Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
