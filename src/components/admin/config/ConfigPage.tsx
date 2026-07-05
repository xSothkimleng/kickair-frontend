"use client";

import { useEffect, useState } from "react";
import {
  Box, Grid, Paper, Typography, Stack, Tabs, Tab,
  Switch, Button, Chip, CircularProgress,
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
import { TextInput, SelectInput } from "@/components/ui/inputs";
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
  const [newCategoryParent, setNewCategoryParent] = useState("top"); // "top" = new main category
  const [addingCategory, setAddingCategory] = useState(false);

  // Skills
  const [skills, setSkills] = useState<AdminSkill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [newSkillName, setNewSkillName] = useState("");
  const [addingSkill, setAddingSkill] = useState(false);

  // Platform information
  const [marketplaceName, setMarketplaceName] = useState("Kickair");
  const [tagline, setTagline] = useState("Cambodia's Premier Freelancing Platform");
  const [contactEmail, setContactEmail] = useState("support@kickair.com");
  const [supportPhone, setSupportPhone] = useState("+855 12 345 678");

  // Pricing rules
  const [minGigPrice, setMinGigPrice] = useState("5");
  const [maxGigPrice, setMaxGigPrice] = useState("10000");
  const [priceStep, setPriceStep] = useState("5");
  const [primaryCurrency, setPrimaryCurrency] = useState("usd");
  const [exchangeRate, setExchangeRate] = useState("4100");
  const [welcomeCredit, setWelcomeCredit] = useState("10");
  const [referralReferrer, setReferralReferrer] = useState("20");
  const [referralNewUser, setReferralNewUser] = useState("10");

  // Localization
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [timezone, setTimezone] = useState("phnom_penh");
  const [dateFormat, setDateFormat] = useState("dd_mm_yyyy");
  const [timeFormat, setTimeFormat] = useState("24");

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
      const parentId = newCategoryParent === "top" ? null : Number(newCategoryParent);
      const created = await api.createAdminCategory(trimmed, parentId);
      setCategories((prev) => [...prev, created]);
      setNewCategoryName("");
      // Keep the chosen parent so adding several subcategories in a row is quick.
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

  // Group the flat list into aisles → their subcategories for a readable tree view.
  const aisleList = categories.filter((c) => c.parent_id == null);
  const aisleIds = new Set(aisleList.map((a) => a.id));
  const shelvesByParent: Record<number, AdminCategory[]> = {};
  categories.forEach((c) => {
    if (c.parent_id == null) return;
    if (!shelvesByParent[c.parent_id]) shelvesByParent[c.parent_id] = [];
    shelvesByParent[c.parent_id].push(c);
  });
  // Defensive: subcategories whose parent is missing (e.g. after a deleted aisle) mustn't vanish.
  const orphanShelves = categories.filter((c) => c.parent_id != null && !aisleIds.has(c.parent_id));

  const renderCategoryRow = (cat: AdminCategory, isChild: boolean) => (
    <Stack
      key={cat.id}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ px: 2, py: 1.25, ml: isChild ? 3.5 : 0, bgcolor: isChild ? "grey.50" : "grey.100", borderRadius: 2, borderLeft: isChild ? "2px solid" : undefined, borderColor: "grey.300" }}
    >
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Switch checked={cat.is_active} onChange={() => toggleCategory(cat.id, cat.is_active)} size="small" />
        <Typography
          fontWeight={isChild ? 500 : 700}
          fontSize={isChild ? 14 : 15}
          color={cat.is_active ? "grey.900" : "grey.400"}
          sx={{ textDecoration: cat.is_active ? "none" : "line-through" }}
        >
          {cat.category_name}
        </Typography>
      </Stack>
      <Button size="small" sx={{ color: "error.main" }} onClick={() => deleteCategory(cat.id)}>Delete</Button>
    </Stack>
  );

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
                <TextInput label="Marketplace Name" value={marketplaceName} onChange={setMarketplaceName} />
                <TextInput label="Tagline" value={tagline} onChange={setTagline} />
                <Stack direction="row" gap={2}>
                  <TextInput label="Contact Email" type="email" value={contactEmail} onChange={setContactEmail} />
                  <TextInput label="Support Phone" type="tel" value={supportPhone} onChange={setSupportPhone} />
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

              {/* Add a new main category or a subcategory under a chosen parent */}
              <Stack direction={{ xs: "column", sm: "row" }} gap={1} mb={1} alignItems={{ sm: "center" }}>
                <Box sx={{ width: { xs: "100%", sm: 260 }, flexShrink: 0 }}>
                  <SelectInput
                    value={newCategoryParent}
                    onChange={(v) => setNewCategoryParent(String(v))}
                    options={[
                      { value: "top", label: "Top-level (main category)" },
                      ...aisleList.map((a) => ({ value: String(a.id), label: `↳ under ${a.category_name}` })),
                    ]}
                  />
                </Box>
                <Box sx={{ flex: 1, width: { xs: "100%", sm: "auto" } }}>
                  <TextInput
                    placeholder={newCategoryParent === "top" ? "New main category name..." : "New subcategory name..."}
                    value={newCategoryName}
                    onChange={setNewCategoryName}
                    onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  />
                </Box>
                <Button
                  variant="contained"
                  startIcon={addingCategory ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
                  onClick={addCategory}
                  disabled={addingCategory || !newCategoryName.trim()}
                  sx={{ px: 3, height: 44, flexShrink: 0 }}
                >
                  Add
                </Button>
              </Stack>
              <Typography variant="body2" color="grey.500" sx={{ mb: 3, fontSize: 12.5 }}>
                Listings are filed under subcategories — add a main category first, then subcategories under it.
              </Typography>

              {categoriesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : categories.length === 0 ? (
                <Typography variant="body2" color="grey.500" sx={{ py: 2, textAlign: "center" }}>
                  No categories yet. Add one above.
                </Typography>
              ) : (
                <Stack gap={2}>
                  {aisleList.map((aisle) => {
                    const shelves = shelvesByParent[aisle.id] ?? [];
                    return (
                      <Box key={aisle.id}>
                        {renderCategoryRow(aisle, false)}
                        <Stack gap={1} mt={1}>
                          {shelves.map((shelf) => renderCategoryRow(shelf, true))}
                          {shelves.length === 0 && (
                            <Typography variant="body2" color="grey.400" sx={{ ml: 3.5, py: 0.5, fontStyle: "italic" }}>
                              No subcategories yet — listings can&apos;t be filed here until you add one.
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    );
                  })}
                  {orphanShelves.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="grey.500" fontWeight={600} sx={{ mb: 1 }}>
                        Ungrouped (parent removed)
                      </Typography>
                      <Stack gap={1}>{orphanShelves.map((s) => renderCategoryRow(s, true))}</Stack>
                    </Box>
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
                <Stack direction="row" gap={1} alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <TextInput
                      placeholder="Enter skill name..."
                      value={newSkillName}
                      onChange={setNewSkillName}
                      onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    />
                  </Box>
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
                    <TextInput label="Minimum Gig Price (USD)" type="number" inputMode="numeric" value={minGigPrice} onChange={setMinGigPrice} />
                    <TextInput label="Maximum Gig Price (USD)" type="number" inputMode="numeric" value={maxGigPrice} onChange={setMaxGigPrice} />
                    <TextInput label="Price Step Size (USD)" type="number" inputMode="numeric" value={priceStep} onChange={setPriceStep} helper="Minimum increment for pricing" />
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                  <Typography fontWeight={700} fontSize={20} mb={3}>Currency Settings</Typography>
                  <Stack gap={2.5}>
                    <SelectInput
                      label="Primary Currency"
                      value={primaryCurrency}
                      onChange={(v) => setPrimaryCurrency(String(v))}
                      options={[
                        { value: "usd", label: "USD - US Dollar" },
                        { value: "khr", label: "KHR - Cambodian Riel" },
                      ]}
                    />
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <Switch defaultChecked size="small" />
                      <Typography variant="body2" color="grey.600">Allow both USD and KHR</Typography>
                    </Stack>
                    <TextInput label="Exchange Rate (1 USD = KHR)" type="number" inputMode="numeric" value={exchangeRate} onChange={setExchangeRate} helper="Updated automatically daily" />
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Typography fontWeight={700} fontSize={20} mb={3}>Promotional Credit Rules</Typography>
                  <Stack gap={2.5}>
                    <TextInput label="New User Welcome Credit (USD)" type="number" inputMode="numeric" value={welcomeCredit} onChange={setWelcomeCredit} />
                    <TextInput label="Referral Bonus – Referrer (USD)" type="number" inputMode="numeric" value={referralReferrer} onChange={setReferralReferrer} />
                    <TextInput label="Referral Bonus – New User (USD)" type="number" inputMode="numeric" value={referralNewUser} onChange={setReferralNewUser} />
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
                <SelectInput
                  label="Default Language"
                  value={defaultLanguage}
                  onChange={(v) => setDefaultLanguage(String(v))}
                  options={[
                    { value: "en", label: "English" },
                    { value: "km", label: "ខ្មែរ (Khmer)" },
                  ]}
                />
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
                <SelectInput
                  label="Timezone"
                  value={timezone}
                  onChange={(v) => setTimezone(String(v))}
                  options={[
                    { value: "phnom_penh", label: "Asia/Phnom_Penh (UTC+7)" },
                    { value: "bangkok", label: "Asia/Bangkok (UTC+7)" },
                  ]}
                />
                <SelectInput
                  label="Date Format"
                  value={dateFormat}
                  onChange={(v) => setDateFormat(String(v))}
                  options={[
                    { value: "dd_mm_yyyy", label: "DD/MM/YYYY" },
                    { value: "mm_dd_yyyy", label: "MM/DD/YYYY" },
                    { value: "yyyy_mm_dd", label: "YYYY-MM-DD" },
                  ]}
                />
                <SelectInput
                  label="Time Format"
                  value={timeFormat}
                  onChange={(v) => setTimeFormat(String(v))}
                  options={[
                    { value: "24", label: "24-hour" },
                    { value: "12", label: "12-hour (AM/PM)" },
                  ]}
                />
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
