"use client";

import { useState } from "react";
import {
  Box, Grid, Paper, Typography, Stack, Tabs, Tab, TextField, Switch,
  FormControlLabel, Button, Select, MenuItem, Chip, IconButton, Divider,
  InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CategoryIcon from "@mui/icons-material/Category";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ArticleIcon from "@mui/icons-material/Article";
import LanguageIcon from "@mui/icons-material/Language";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";

const CATEGORIES = [
  { id: 1, name: "Design & Graphics", subcategories: ["Logo Design", "UI/UX Design", "Illustration", "Social Media Graphics"], active: true },
  { id: 2, name: "Translation & Languages", subcategories: ["Khmer Translation", "English Translation", "Proofreading", "Transcription"], active: true },
  { id: 3, name: "Digital Marketing", subcategories: ["Facebook Ads", "SEO", "Social Media Management", "Content Marketing"], active: true },
  { id: 4, name: "Web Development", subcategories: ["WordPress", "E-commerce", "Landing Pages", "Web Apps"], active: true },
  { id: 5, name: "Writing & Content", subcategories: ["Blog Posts", "Product Descriptions", "Copywriting", "Technical Writing"], active: true },
];

export default function ConfigPage() {
  const [tab, setTab] = useState(0);
  const [commission, setCommission] = useState("20");
  const [maintenance, setMaintenance] = useState(false);
  const [newUserVerification, setNewUserVerification] = useState(true);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Configuration & Settings</Typography>
        <Typography color="text.secondary">Manage platform settings and content</Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid", borderColor: "grey.200", px: 2 }}>
          <Tab icon={<SettingsIcon fontSize="small" />} iconPosition="start" label="General" />
          <Tab icon={<CategoryIcon fontSize="small" />} iconPosition="start" label="Categories & Skills" />
          <Tab icon={<AttachMoneyIcon fontSize="small" />} iconPosition="start" label="Pricing Rules" />
          <Tab icon={<ArticleIcon fontSize="small" />} iconPosition="start" label="CMS & Pages" />
          <Tab icon={<LanguageIcon fontSize="small" />} iconPosition="start" label="Localization" />
        </Tabs>

        {/* General Settings */}
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography fontWeight={700} mb={2.5}>Platform Settings</Typography>
                <Stack gap={3}>
                  <TextField label="Platform Name" defaultValue="KickAir" size="small" fullWidth />
                  <TextField label="Platform URL" defaultValue="https://kickair.com" size="small" fullWidth />
                  <TextField label="Support Email" defaultValue="support@kickair.com" size="small" fullWidth />
                  <TextField
                    label="Commission Rate (%)"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    size="small"
                    fullWidth
                    type="number"
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                  />
                  <TextField label="Minimum Order Value ($)" defaultValue="5" size="small" fullWidth type="number"
                    slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} />
                  <TextField label="Minimum Withdrawal ($)" defaultValue="50" size="small" fullWidth type="number"
                    slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography fontWeight={700} mb={2.5}>Feature Flags</Typography>
                <Stack gap={1}>
                  {[
                    { label: "Maintenance Mode", value: maintenance, set: setMaintenance, desc: "Take the platform offline for maintenance", danger: true },
                    { label: "New User Verification Required", value: newUserVerification, set: setNewUserVerification, desc: "Require email verification on signup" },
                    { label: "KYC Required for Freelancers", value: true, set: () => {}, desc: "Require KYC before posting gigs" },
                    { label: "Escrow Payments Enabled", value: true, set: () => {}, desc: "Hold payments in escrow until job completion" },
                    { label: "Featured Ads Enabled", value: true, set: () => {}, desc: "Allow freelancers to promote listings" },
                    { label: "Referral Program Active", value: true, set: () => {}, desc: "Enable referral bonuses for new sign-ups" },
                  ].map((f, i) => (
                    <Box key={i} sx={{ p: 2, border: "1px solid", borderColor: f.danger && f.value ? "error.200" : "grey.200", borderRadius: 2, bgcolor: f.danger && f.value ? "error.50" : "transparent" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight={600} color={f.danger && f.value ? "error.main" : "text.primary"}>{f.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{f.desc}</Typography>
                        </Box>
                        <Switch checked={f.value} onChange={(e) => f.set(e.target.checked)} color={f.danger ? "error" : "primary"} />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" startIcon={<SaveIcon />}>Save Changes</Button>
            </Stack>
          </Box>
        )}

        {/* Categories */}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography fontWeight={700} fontSize={17}>Service Categories</Typography>
              <Button variant="contained" size="small" startIcon={<AddIcon />}>Add Category</Button>
            </Stack>
            <Stack gap={2}>
              {CATEGORIES.map((cat) => (
                <Paper key={cat.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
                        <Typography fontWeight={700}>{cat.name}</Typography>
                        <Chip label={cat.active ? "Active" : "Inactive"} size="small" color={cat.active ? "success" : "default"} />
                      </Stack>
                      <Stack direction="row" gap={1} flexWrap="wrap">
                        {cat.subcategories.map((sub) => (
                          <Chip key={sub} label={sub} size="small" variant="outlined" />
                        ))}
                        <Chip icon={<AddIcon />} label="Add subcategory" size="small" variant="outlined" color="primary" sx={{ cursor: "pointer" }} />
                      </Stack>
                    </Box>
                    <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {/* Pricing Rules */}
        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography fontWeight={700} fontSize={17} mb={3}>Commission & Pricing Rules</Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography fontWeight={700} mb={2.5}>Commission Rates</Typography>
                  <Stack gap={2}>
                    {[
                      { label: "Standard Commission", value: "20%" },
                      { label: "Pro Seller Commission", value: "15%" },
                      { label: "Top Rated Commission", value: "10%" },
                      { label: "Featured Ad Commission", value: "5%" },
                    ].map((r) => (
                      <Stack key={r.label} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">{r.label}</Typography>
                        <TextField size="small" defaultValue={r.value} sx={{ width: 90 }} />
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography fontWeight={700} mb={2.5}>Featured Ad Pricing</Typography>
                  <Stack gap={2}>
                    {[
                      { label: "Basic Boost (7 days)", value: "$10" },
                      { label: "Standard Boost (14 days)", value: "$18" },
                      { label: "Premium Boost (30 days)", value: "$35" },
                      { label: "Homepage Banner (7 days)", value: "$50" },
                    ].map((r) => (
                      <Stack key={r.label} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">{r.label}</Typography>
                        <TextField size="small" defaultValue={r.value} sx={{ width: 90 }} />
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" startIcon={<SaveIcon />}>Save Pricing Rules</Button>
            </Stack>
          </Box>
        )}

        {/* CMS */}
        {tab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography fontWeight={700} fontSize={17} mb={3}>CMS & Static Pages</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    {["Page", "Slug", "Last Updated", "Status", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { page: "Homepage Hero", slug: "/", updated: "2 days ago", status: "Published" },
                    { page: "About Us", slug: "/about", updated: "1 week ago", status: "Published" },
                    { page: "Terms of Service", slug: "/terms", updated: "1 month ago", status: "Published" },
                    { page: "Privacy Policy", slug: "/privacy", updated: "1 month ago", status: "Published" },
                    { page: "FAQ", slug: "/faq", updated: "3 days ago", status: "Published" },
                    { page: "Maintenance Page", slug: "/maintenance", updated: "Never", status: "Draft" },
                  ].map((p, i) => (
                    <TableRow key={i} hover>
                      <TableCell><Typography variant="body2" fontWeight={500}>{p.page}</Typography></TableCell>
                      <TableCell><Typography variant="caption" sx={{ fontFamily: "monospace" }} color="text.secondary">{p.slug}</Typography></TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{p.updated}</Typography></TableCell>
                      <TableCell><Chip label={p.status} size="small" color={p.status === "Published" ? "success" : "default"} /></TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" startIcon={<EditIcon />}>Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Localization */}
        {tab === 4 && (
          <Box sx={{ p: 3 }}>
            <Typography fontWeight={700} fontSize={17} mb={3}>Localization Settings</Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack gap={3}>
                  <Box>
                    <Typography variant="body2" fontWeight={600} mb={1}>Default Language</Typography>
                    <Select size="small" defaultValue="en" fullWidth>
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="km">ខ្មែរ (Khmer)</MenuItem>
                    </Select>
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} mb={1}>Default Currency</Typography>
                    <Select size="small" defaultValue="usd" fullWidth>
                      <MenuItem value="usd">USD ($)</MenuItem>
                      <MenuItem value="khr">KHR (៛)</MenuItem>
                    </Select>
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} mb={1}>Timezone</Typography>
                    <Select size="small" defaultValue="asia_phnom_penh" fullWidth>
                      <MenuItem value="asia_phnom_penh">Asia/Phnom_Penh (UTC+7)</MenuItem>
                      <MenuItem value="utc">UTC</MenuItem>
                    </Select>
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} mb={1}>Date Format</Typography>
                    <Select size="small" defaultValue="dd_mm_yyyy" fullWidth>
                      <MenuItem value="dd_mm_yyyy">DD/MM/YYYY</MenuItem>
                      <MenuItem value="mm_dd_yyyy">MM/DD/YYYY</MenuItem>
                      <MenuItem value="yyyy_mm_dd">YYYY-MM-DD</MenuItem>
                    </Select>
                  </Box>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" fontWeight={600} mb={1.5}>Enabled Languages</Typography>
                <Stack gap={1}>
                  {[
                    { lang: "English", code: "EN", enabled: true },
                    { lang: "ខ្មែរ (Khmer)", code: "KM", enabled: true },
                    { lang: "中文 (Chinese)", code: "ZH", enabled: false },
                    { lang: "한국어 (Korean)", code: "KO", enabled: false },
                  ].map((l) => (
                    <Stack key={l.code} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}>
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Chip label={l.code} size="small" />
                        <Typography variant="body2">{l.lang}</Typography>
                      </Stack>
                      <Switch defaultChecked={l.enabled} size="small" />
                    </Stack>
                  ))}
                </Stack>
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" startIcon={<SaveIcon />}>Save Localization</Button>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
