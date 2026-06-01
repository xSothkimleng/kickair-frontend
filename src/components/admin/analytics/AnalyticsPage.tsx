"use client";

import { useState } from "react";
import { Box, Paper, Typography, Stack, Tabs, Tab } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RepeatIcon from "@mui/icons-material/Repeat";

function EmptyState({ label }: { label: string }) {
  return (
    <Box sx={{ py: 12, textAlign: "center" }}>
      <Typography variant="body2" color="text.disabled">{label}</Typography>
    </Box>
  );
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Analytics & Growth</Typography>
        <Typography color="text.secondary">Understand user behavior and grow your marketplace</Typography>
      </Box>

      {/* Summary Metrics */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }} flexWrap="wrap">
        {[
          { label: "Weekly Active Users",    icon: PeopleIcon },
          { label: "User Retention (30d)",   icon: BarChartIcon },
          { label: "Avg Order Value",        icon: AttachMoneyIcon },
          { label: "Repeat Buyers",          icon: RepeatIcon },
        ].map(({ label, icon: Icon }) => (
          <Paper key={label} variant="outlined" sx={{ p: 3, borderRadius: 2, flex: "1 1 180px", minWidth: 160 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">{label}</Typography>
              <Icon sx={{ color: "text.disabled", fontSize: 20 }} />
            </Stack>
            <Typography variant="h5" fontWeight={700} color="text.disabled">—</Typography>
          </Paper>
        ))}
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid", borderColor: "grey.200", px: 2 }}>
          <Tab label="Conversion Funnels" />
          <Tab label="Cohorts & Retention" />
          <Tab label="Campaigns" />
        </Tabs>

        {tab === 0 && <EmptyState label="Conversion funnel data not yet available." />}
        {tab === 1 && <EmptyState label="Cohort and retention data not yet available." />}
        {tab === 2 && <EmptyState label="Campaign data not yet available." />}
      </Paper>
    </Box>
  );
}
