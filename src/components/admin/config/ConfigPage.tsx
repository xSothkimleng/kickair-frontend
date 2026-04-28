"use client";

import { useEffect, useState } from "react";
import {
  Box, Grid, Paper, Typography, Stack, Tabs, Tab,
  Switch, Button, Chip, MenuItem, CircularProgress,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CategoryIcon from "@mui/icons-material/Category";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ArticleIcon from "@mui/icons-material/Article";
import LanguageIcon from "@mui/icons-material/Language";
import AddIcon from "@mui/icons-material/Add";
import ImageIcon from "@mui/icons-material/Image";
import UploadIcon from "@mui/icons-material/Upload";
import CloseIcon from "@mui/icons-material/Close";
import AdminInput from "@/components/admin/ui/AdminInput";
import { api, AdminCategory, AdminSkill } from "@/lib/api";

const PAGES = [
  { title: "Terms & Conditions", url: "/terms", lastUpdated: "2025-01-10", status: "Published" },
  { title: "Privacy Policy", url: "/privacy", lastUpdated: "2025-01-10", status: "Published" },
  { title: "How It Works", url: "/how-it-works", lastUpdated: "2024-12-15", status: "Published" },
  { title: "FAQ - Buyers", url: "/faq-buyers", lastUpdated: "2024-12-20", status: "Published" },
  { title: "FAQ - Sellers", url: "/faq-sellers", lastUpdated: "2024-12-20", status: "Published" },
  { title: "About Kickair", url: "/about", lastUpdated: "2024-11-30", status: "Draft" },
];

export default function ConfigPage() {
  const [tab, setTab] = useState(0);
  const [features, setFeatures] = useState({
    disputes: true,
    tips: true,
    subscriptions: false,
    kycSellers: true,
    gigApproval: true,
    multiLanguage: true,
  });

  // Categories
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  // Skills
  const [skills, setSkills] = useState<AdminSkill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [newSkillName, setNewSkillName] = useState("");
  const [addingSkill, setAddingSkill] = useState(false);

  useEffect(() => {
    api.getAdminCategories()
      .then(setCategories)
      .finally(() => setCategoriesLoading(false));

    api.getAdminSkills()
      .then(setSkills)
      .finally(() => setSkillsLoading(false));
  }, []);

  const toggleFeature = (key: keyof typeof features) =>
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleCategory = async (id: number, currentValue: boolean) => {
    setCategories((prev) =>
      prev.map((c) => c.id === id ? { ...c, is_active: !currentValue } : c)
    );
    try {
      await api.updateAdminCategory(id, { is_active: !currentValue });
    } catch {
      setCategories((prev) =>
        prev.map((c) => c.id === id ? { ...c, is_active: currentValue } : c)
      );
    }
  };

  const deleteCategory = async (id: number) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await api.deleteAdminCategory(id);
    } catch {
      const res = await api.getAdminCategories();
      setCategories(res);
    }
  };

  const addCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || addingCategory) return;
    setAddingCategory(true);
    try {
      const created = await api.createAdminCategory(trimmed);
      setCategories((prev) => [...prev, created]);
      setNewCategoryName("");
    } finally {
      setAddingCategory(false);
    }
  };

  const deleteSkill = async (id: number) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
    try {
      await api.deleteAdminSkill(id);
    } catch {
      const res = await api.getAdminSkills();
      setSkills(res);
    }
  };

  const addSkill = async () => {
    const trimmed = newSkillName.trim();
    if (!trimmed || addingSkill) return;
    setAddingSkill(true);
    try {
      const created = await api.createAdminSkill(trimmed);
      setSkills((prev) => [...prev, created]);
      setNewSkillName("");
    } finally {
      setAddingSkill(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="grey.900" gutterBottom>
          Configuration & Settings
        </Typography>
        <Typography color="text.secondary">Manage platform settings and content</Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: "1px solid", borderColor: "grey.200", px: 2 }}
        >
          <Tab icon={<SettingsIcon fontSize="small" />} iconPosition="start" label="General Settings" />
          <Tab icon={<CategoryIcon fontSize="small" />} iconPosition="start" label="Categories & Skills" />
          <Tab icon={<AttachMoneyIcon fontSize="small" />} iconPosition="start" label="Pricing Rules" />
          <Tab icon={<ArticleIcon fontSize="small" />} iconPosition="start" label="CMS & Pages" />
          <Tab icon={<LanguageIcon fontSize="small" />} iconPosition="start" label="Localization" />
        </Tabs>

        {/* ── General Settings ── */}
        {tab === 0 && (
          <Box sx={{ p: 3, maxWidth: 896 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography fontWeight={700} fontSize={20} mb={3}>Platform Information</Typography>
              <Stack gap={3}>
                <AdminInput label="Marketplace Name" defaultValue="Kickair" fullWidth />
                <AdminInput label="Tagline" defaultValue="Cambodia's Premier Freelancing Platform" fullWidth />
                <Stack direction="row" gap={2}>
                  <AdminInput label="Contact Email" type="email" defaultValue="support@kickair.com" fullWidth />
                  <AdminInput label="Support Phone" type="tel" defaultValue="+855 12 345 678" fullWidth />
                </Stack>
                <Box>
                  <Typography variant="body2" fontWeight={500} color="grey.700" mb={1.5}>
                    Logo Upload
                  </Typography>
                  <Stack direction="row" alignItems="center" gap={2}>
                    <Box sx={{
                      width: 80, height: 80, bgcolor: "#dbeafe", borderRadius: 2,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <ImageIcon sx={{ color: "#2563eb", fontSize: 32 }} />
                    </Box>
                    <Button variant="contained" startIcon={<UploadIcon />}>
                      Upload New Logo
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography fontWeight={700} fontSize={20} mb={3}>Platform Features</Typography>
              <Stack gap={1.5}>
                {([
                  { key: "disputes",      label: "Enable Disputes",          desc: "Allow users to open disputes for orders" },
                  { key: "tips",          label: "Enable Tips",               desc: "Allow buyers to tip freelancers" },
                  { key: "subscriptions", label: "Enable Subscriptions",      desc: "Allow freelancers to offer subscription plans" },
                  { key: "kycSellers",    label: "Require KYC for Sellers",   desc: "Mandate identity verification for all sellers" },
                  { key: "gigApproval",   label: "Enable Gig Approval Queue", desc: "Review all gigs before going live" },
                  { key: "multiLanguage", label: "Enable Multiple Languages", desc: "Support Khmer and English interfaces" },
                ] as { key: keyof typeof features; label: string; desc: string }[]).map((f) => (
                  <Stack
                    key={f.key}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}
                  >
                    <Box>
                      <Typography fontWeight={500} color="grey.900">{f.label}</Typography>
                      <Typography variant="body2" color="grey.600">{f.desc}</Typography>
                    </Box>
                    <Switch
                      checked={features[f.key]}
                      onChange={() => toggleFeature(f.key)}
                    />
                  </Stack>
                ))}
              </Stack>
              <Button variant="contained" fullWidth sx={{ mt: 3, py: 1.5 }}>
                Save General Settings
              </Button>
            </Paper>
          </Box>
        )}

        {/* ── Categories & Skills ── */}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            {/* Service Categories */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography fontWeight={700} fontSize={20}>Service Categories</Typography>
              </Stack>

              {/* Add new category inline */}
              <Stack direction="row" gap={1} mb={3}>
                <AdminInput
                  placeholder="New category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  startIcon={addingCategory ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
                  onClick={addCategory}
                  disabled={addingCategory || !newCategoryName.trim()}
                  sx={{ px: 3 }}
                >
                  Add
                </Button>
              </Stack>

              {categoriesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                <Stack gap={1.5}>
                  {categories.map((cat) => (
                    <Stack
                      key={cat.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ px: 2, py: 1.5, bgcolor: "grey.50", borderRadius: 2 }}
                    >
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Switch
                          checked={cat.is_active}
                          onChange={() => toggleCategory(cat.id, cat.is_active)}
                          size="small"
                        />
                        <Typography
                          fontWeight={600}
                          color={cat.is_active ? "grey.900" : "grey.400"}
                          sx={{ textDecoration: cat.is_active ? "none" : "line-through" }}
                        >
                          {cat.category_name}
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        sx={{ color: "error.main" }}
                        onClick={() => deleteCategory(cat.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  ))}
                  {categories.length === 0 && (
                    <Typography variant="body2" color="grey.500" sx={{ py: 2, textAlign: "center" }}>
                      No categories yet. Add one above.
                    </Typography>
                  )}
                </Stack>
              )}
            </Paper>

            {/* Popular Skills & Tags */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography fontWeight={700} fontSize={20} mb={3}>Popular Skills & Tags</Typography>
              <Box mb={2.5}>
                <Typography variant="body2" fontWeight={500} color="grey.700" mb={1}>
                  Add Skills (Cambodia-specific)
                </Typography>
                <Stack direction="row" gap={1}>
                  <AdminInput
                    placeholder="Enter skill name..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={addingSkill ? <CircularProgress size={14} color="inherit" /> : null}
                    onClick={addSkill}
                    disabled={addingSkill || !newSkillName.trim()}
                    sx={{ px: 3 }}
                  >
                    Add
                  </Button>
                </Stack>
              </Box>

              {skillsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {skills.map((skill) => (
                    <Chip
                      key={skill.id}
                      label={skill.expertise_name}
                      size="small"
                      onDelete={() => deleteSkill(skill.id)}
                      deleteIcon={<CloseIcon sx={{ fontSize: "14px !important" }} />}
                      sx={{
                        bgcolor: "#f3e8ff", color: "#6b21a8",
                        "& .MuiChip-deleteIcon": { color: "#9333ea" },
                      }}
                    />
                  ))}
                  {skills.length === 0 && !skillsLoading && (
                    <Typography variant="body2" color="grey.500">
                      No skills yet. Add one above.
                    </Typography>
                  )}
                </Stack>
              )}
            </Paper>
          </Box>
        )}

        {/* ── Pricing Rules ── */}
        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ maxWidth: 896 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                  <Typography fontWeight={700} fontSize={20} mb={3}>Price Limits</Typography>
                  <Stack gap={2.5}>
                    <AdminInput label="Minimum Gig Price (USD)" type="number" defaultValue="5" fullWidth />
                    <AdminInput label="Maximum Gig Price (USD)" type="number" defaultValue="10000" fullWidth />
                    <AdminInput label="Price Step Size (USD)" type="number" defaultValue="5" fullWidth helperText="Minimum increment for pricing" />
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                  <Typography fontWeight={700} fontSize={20} mb={3}>Currency Settings</Typography>
                  <Stack gap={2.5}>
                    <AdminInput label="Primary Currency" select fullWidth defaultValue="usd">
                      <MenuItem value="usd">USD - US Dollar</MenuItem>
                      <MenuItem value="khr">KHR - Cambodian Riel</MenuItem>
                    </AdminInput>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <Switch defaultChecked size="small" />
                      <Typography variant="body2" color="grey.600">Allow both USD and KHR</Typography>
                    </Stack>
                    <AdminInput label="Exchange Rate (1 USD = KHR)" type="number" defaultValue="4100" fullWidth helperText="Updated automatically daily" />
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Typography fontWeight={700} fontSize={20} mb={3}>Promotional Credit Rules</Typography>
                  <Stack gap={2.5}>
                    <AdminInput label="New User Welcome Credit (USD)" type="number" defaultValue="10" fullWidth />
                    <AdminInput label="Referral Bonus – Referrer (USD)" type="number" defaultValue="20" fullWidth />
                    <AdminInput label="Referral Bonus – New User (USD)" type="number" defaultValue="10" fullWidth />
                  </Stack>
                  <Button variant="contained" fullWidth sx={{ mt: 3, py: 1.5 }}>
                    Save Pricing Settings
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ── CMS & Pages ── */}
        {tab === 3 && (
          <Box sx={{ p: 3 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography fontWeight={700} fontSize={20}>Static Pages</Typography>
                <Button variant="contained">Create New Page</Button>
              </Stack>
              <Stack gap={1.5}>
                {PAGES.map((page, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      p: 2, border: "1px solid", borderColor: "grey.200", borderRadius: 2,
                      "&:hover": { bgcolor: "grey.50" },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={500} color="grey.900">{page.title}</Typography>
                      <Typography variant="body2" color="grey.600">{page.url}</Typography>
                      <Typography variant="caption" color="grey.500">Last updated: {page.lastUpdated}</Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <Chip
                        label={page.status}
                        size="small"
                        sx={page.status === "Published"
                          ? { bgcolor: "#dcfce7", color: "#166534" }
                          : { bgcolor: "grey.100", color: "grey.700" }
                        }
                      />
                      <Button size="small" sx={{ color: "primary.main" }}>Edit</Button>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography fontWeight={700} fontSize={20} mb={3}>Homepage Banners & Promotions</Typography>
              <Stack gap={2}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Box>
                      <Typography fontWeight={500} color="grey.900">New Year Promotion 2025</Typography>
                      <Typography variant="body2" color="grey.600">20% off for all first-time buyers</Typography>
                    </Box>
                    <Switch defaultChecked size="small" />
                  </Stack>
                  <Box sx={{
                    width: "100%", height: 128,
                    background: "linear-gradient(to right, #3b82f6, #9333ea)",
                    borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Typography color="white" fontWeight={700} fontSize={20}>Banner Preview</Typography>
                  </Box>
                </Paper>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    py: 1.5, borderStyle: "dashed", borderWidth: 2, borderColor: "grey.300",
                    color: "grey.600",
                    "&:hover": { borderColor: "primary.main", color: "primary.main", bgcolor: "#eff6ff", borderStyle: "dashed" },
                  }}
                >
                  + Add New Banner
                </Button>
              </Stack>
            </Paper>
          </Box>
        )}

        {/* ── Localization ── */}
        {tab === 4 && (
          <Box sx={{ p: 3, maxWidth: 896 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography fontWeight={700} fontSize={20} mb={3}>Language Settings</Typography>
              <Stack gap={3}>
                <AdminInput label="Default Language" select fullWidth defaultValue="en">
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="km">ខ្មែរ (Khmer)</MenuItem>
                </AdminInput>
                <Box>
                  <Typography variant="body2" fontWeight={500} color="grey.700" mb={1.5}>
                    Supported Languages
                  </Typography>
                  <Stack gap={1.5}>
                    {[
                      { lang: "English", code: "en", completion: 100 },
                      { lang: "ខ្មែរ (Khmer)", code: "km", completion: 87 },
                    ].map((language) => (
                      <Stack
                        key={language.code}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}
                      >
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Switch defaultChecked size="small" />
                          <Box>
                            <Typography fontWeight={500} color="grey.900">{language.lang}</Typography>
                            <Typography variant="caption" color="grey.600">Code: {language.code}</Typography>
                          </Box>
                        </Stack>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="body2" fontWeight={500} color="grey.900">
                            {language.completion}%
                          </Typography>
                          <Typography variant="caption" color="grey.500">Translation complete</Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography fontWeight={700} fontSize={20} mb={3}>Regional Settings</Typography>
              <Stack gap={2.5}>
                <AdminInput label="Timezone" select fullWidth defaultValue="phnom_penh">
                  <MenuItem value="phnom_penh">Asia/Phnom_Penh (UTC+7)</MenuItem>
                  <MenuItem value="bangkok">Asia/Bangkok (UTC+7)</MenuItem>
                </AdminInput>
                <AdminInput label="Date Format" select fullWidth defaultValue="dd_mm_yyyy">
                  <MenuItem value="dd_mm_yyyy">DD/MM/YYYY</MenuItem>
                  <MenuItem value="mm_dd_yyyy">MM/DD/YYYY</MenuItem>
                  <MenuItem value="yyyy_mm_dd">YYYY-MM-DD</MenuItem>
                </AdminInput>
                <AdminInput label="Time Format" select fullWidth defaultValue="24">
                  <MenuItem value="24">24-hour</MenuItem>
                  <MenuItem value="12">12-hour (AM/PM)</MenuItem>
                </AdminInput>
              </Stack>
              <Button variant="contained" fullWidth sx={{ mt: 3, py: 1.5 }}>
                Save Localization Settings
              </Button>
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
