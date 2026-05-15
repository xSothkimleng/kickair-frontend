"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
  Box,
  Typography,
  Button,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Avatar,
  Stack,
  Paper,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Skeleton,
} from "@mui/material";
import {
  Upload as UploadIcon,
  LocationOn as MapPinIcon,
  Language as GlobeIcon,
  Shield as ShieldIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useAuth } from "@/components/context/AuthContext";
import { api } from "@/lib/api";
import { Industry, ClientProfileRequest } from "@/types/user";

const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "500+", label: "500+ employees" },
] as const;

export default function ProfileContent() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    company_name: "",
    industry_id: "" as number | "",
    company_size: "" as ClientProfileRequest["company_size"] | "",
    location: "",
    website: "",
    about: "",
  });

  // UI state
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Load industries on mount
  useEffect(() => {
    const loadIndustries = async () => {
      try {
        const data = await api.getIndustries();
        setIndustries(data);
      } catch (error) {
        console.error("Failed to load industries:", error);
      } finally {
        setLoadingIndustries(false);
      }
    };
    loadIndustries();
  }, []);

  // Populate form with existing profile data
  useEffect(() => {
    if (user?.client_profile) {
      const profile = user.client_profile;
      setFormData({
        company_name: profile.company_name || "",
        industry_id: profile.industry_id || "",
        company_size: profile.company_size || "",
        location: profile.location || "",
        website: profile.website || "",
        about: profile.about || "",
      });
    }
  }, [user?.client_profile]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!user?.client_profile) return;

    setSaving(true);
    try {
      const requestData: ClientProfileRequest = {
        company_name: formData.company_name || undefined,
        industry_id: formData.industry_id ? Number(formData.industry_id) : undefined,
        company_size: formData.company_size || undefined,
        location: formData.location || undefined,
        website: formData.website || undefined,
        about: formData.about || undefined,
      };

      await api.updateClientProfile(user.client_profile.id, requestData);
      await refreshUser();
      setHasUnsavedChanges(false);
      setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setSnackbar({ open: true, message: "Invalid file type. Please upload JPG, PNG, GIF, or WebP.", severity: "error" });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: "File size must be less than 5MB.", severity: "error" });
      return;
    }

    setUploadingImage(true);
    try {
      await api.uploadProfileImage(file);
      await refreshUser();
      setSnackbar({ open: true, message: "Profile picture updated!", severity: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!user?.avatar_url) return;

    setUploadingImage(true);
    try {
      await api.deleteProfileImage();
      await refreshUser();
      setSnackbar({ open: true, message: "Profile picture removed.", severity: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove image";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setUploadingImage(false);
    }
  };

  if (authLoading) {
    return (
      <Box>
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Skeleton variant='text' width={200} height={40} sx={{ mb: 2 }} />
            <Stack direction='row' spacing={3} alignItems='center' mb={4}>
              <Skeleton variant='circular' width={100} height={100} />
              <Skeleton variant='rectangular' width={120} height={36} sx={{ borderRadius: 2 }} />
            </Stack>
            <Stack spacing={3}>
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} variant='rectangular' height={56} sx={{ borderRadius: 2 }} />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box maxWidth={800} mx='auto'>
        <Alert severity='warning'>Please log in to view your profile.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(0,0,0,0.08)",
          mb: 3,
        }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='flex-start' mb={4}>
            <Box>
              <Typography variant='h5' fontWeight={600} mb={0.5}>
                Client Profile
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Build trust with freelancers by completing your profile
              </Typography>
            </Box>
            {hasUnsavedChanges && (
              <Button
                variant='contained'
                onClick={handleSaveChanges}
                disabled={saving}
                sx={{
                  bgcolor: "#0071e3",
                  color: "white",
                  fontSize: 13,
                  textTransform: "none",
                  borderRadius: 10,
                  px: 3,
                  "&:hover": {
                    bgcolor: "#0077ED",
                  },
                }}>
                {saving ? <CircularProgress size={20} color='inherit' /> : "Save Changes"}
              </Button>
            )}
          </Stack>

          {/* Profile Picture */}
          <Box mb={4}>
            <Typography variant='body2' fontWeight={500} mb={1.5}>
              Profile Picture
            </Typography>
            <Stack direction='row' spacing={3} alignItems='center'>
              <Box position='relative'>
                <Avatar src={user.avatar_url || undefined} alt={user.name} sx={{ width: 100, height: 100 }}>
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                {uploadingImage && (
                  <Box
                    position='absolute'
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    bgcolor='rgba(0,0,0,0.5)'
                    borderRadius='50%'>
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  </Box>
                )}
              </Box>
              <Stack direction='row' spacing={1}>
                <input
                  type='file'
                  ref={fileInputRef}
                  accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
                <Button
                  variant='contained'
                  startIcon={<UploadIcon sx={{ fontSize: 14 }} />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  sx={{
                    bgcolor: "rgba(0,0,0,0.05)",
                    color: "black",
                    fontSize: 12,
                    textTransform: "none",
                    borderRadius: 10,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.1)",
                      boxShadow: "none",
                    },
                  }}>
                  Change Photo
                </Button>
                {user.avatar_url && (
                  <Button
                    variant='contained'
                    startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                    onClick={handleDeleteImage}
                    disabled={uploadingImage}
                    sx={{
                      bgcolor: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                      fontSize: 12,
                      textTransform: "none",
                      borderRadius: 10,
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: "rgba(239,68,68,0.2)",
                        boxShadow: "none",
                      },
                    }}>
                    Remove
                  </Button>
                )}
              </Stack>
            </Stack>
            <Typography variant='caption' color='text.secondary' display='block' mt={1}>
              A professional photo helps build trust with freelancers. Max 5MB (JPG, PNG, GIF, WebP)
            </Typography>
          </Box>

          {/* Basic Information */}
          <Stack spacing={3}>
            <TextField
              label='Full Name'
              value={user.name}
              disabled
              fullWidth
              helperText='Name is managed in account settings'
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                },
              }}
            />

            <TextField
              label='Company Name'
              value={formData.company_name}
              onChange={e => handleInputChange("company_name", e.target.value)}
              placeholder='Your company name'
              fullWidth
              inputProps={{ maxLength: 255 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: 13 }}>Industry</InputLabel>
              <Select
                value={formData.industry_id}
                onChange={e => handleInputChange("industry_id", e.target.value)}
                label='Industry'
                disabled={loadingIndustries}
                sx={{
                  borderRadius: 2,
                  fontSize: 13,
                }}>
                <MenuItem value=''>
                  <em>Select an industry</em>
                </MenuItem>
                {industries.map(industry => (
                  <MenuItem key={industry.id} value={industry.id}>
                    {industry.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: 13 }}>Company Size</InputLabel>
              <Select
                value={formData.company_size}
                onChange={e => handleInputChange("company_size", e.target.value)}
                label='Company Size'
                sx={{
                  borderRadius: 2,
                  fontSize: 13,
                }}>
                <MenuItem value=''>
                  <em>Select company size</em>
                </MenuItem>
                {COMPANY_SIZES.map(size => (
                  <MenuItem key={size.value} value={size.value}>
                    {size.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label='Location'
              value={formData.location}
              onChange={e => handleInputChange("location", e.target.value)}
              placeholder='City, Country'
              fullWidth
              inputProps={{ maxLength: 255 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <MapPinIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                },
              }}
            />

            <TextField
              label='Website'
              value={formData.website}
              onChange={e => handleInputChange("website", e.target.value)}
              placeholder='https://yourwebsite.com'
              fullWidth
              inputProps={{ maxLength: 255 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <GlobeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                },
              }}
            />

            <Box>
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>About</Typography>
              <RichTextEditor
                value={formData.about}
                onChange={html => handleInputChange("about", html)}
                placeholder='Tell freelancers about your company and what kind of projects you work on...'
                minHeight={120}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Verification Section */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", p: 3 }}>
        <Typography variant='body1' fontWeight={600} mb={0.5}>
          Verification
        </Typography>
        <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 3 }}>
          Verification is required to accept service requests from freelancers
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "start",
              justifyContent: "space-between",
              p: 2,
              bgcolor: user.is_verified_id ? "rgba(34, 197, 94, 0.05)" : "rgba(0, 0, 0, 0.02)",
              borderRadius: 3,
            }}>
            <Box sx={{ display: "flex", alignItems: "start", gap: 1.5 }}>
              <ShieldIcon sx={{ fontSize: 20, color: user.is_verified_id ? "#16a34a" : "rgba(0,0,0,0.3)", mt: 0.25 }} />
              <Box>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: user.is_verified_id ? "rgb(21, 128, 61)" : "rgba(0,0,0,0.6)",
                    mb: 0.5,
                  }}>
                  Identity Verification
                </Typography>
                <Typography sx={{ fontSize: 11, color: user.is_verified_id ? "#16a34a" : "rgba(0,0,0,0.4)" }}>
                  {user.is_verified_id ? "Your ID has been verified" : "Verify your identity to post jobs"}
                </Typography>
              </Box>
            </Box>
            {user.is_verified_id ? (
              <Chip label='VERIFIED' sx={{ height: 24, bgcolor: "#16a34a", color: "white", fontSize: 10, fontWeight: 500 }} />
            ) : (
              <Button
                size='small'
                onClick={() => router.push("/dashboard/kyc")}
                sx={{
                  fontSize: 11,
                  textTransform: "none",
                  bgcolor: "#0071e3",
                  color: "white",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#0077ED" },
                }}>
                Verify Now
              </Button>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "start",
              justifyContent: "space-between",
              p: 2,
              bgcolor: user.is_verified_phone ? "rgba(34, 197, 94, 0.05)" : "rgba(0, 0, 0, 0.02)",
              borderRadius: 3,
            }}>
            <Box sx={{ display: "flex", alignItems: "start", gap: 1.5 }}>
              <ShieldIcon sx={{ fontSize: 20, color: user.is_verified_phone ? "#16a34a" : "rgba(0,0,0,0.3)", mt: 0.25 }} />
              <Box>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: user.is_verified_phone ? "rgb(21, 128, 61)" : "rgba(0,0,0,0.6)",
                    mb: 0.5,
                  }}>
                  Phone Verification
                </Typography>
                <Typography sx={{ fontSize: 11, color: user.is_verified_phone ? "#16a34a" : "rgba(0,0,0,0.4)" }}>
                  {user.is_verified_phone ? user.telephone || "Phone verified" : "Verify your phone number"}
                </Typography>
              </Box>
            </Box>
            {user.is_verified_phone ? (
              <Chip label='VERIFIED' sx={{ height: 24, bgcolor: "#16a34a", color: "white", fontSize: 10, fontWeight: 500 }} />
            ) : (
              <Button
                size='small'
                onClick={() => router.push("/settings")}
                sx={{
                  fontSize: 11,
                  textTransform: "none",
                  bgcolor: "#0071e3",
                  color: "white",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#0077ED" },
                }}>
                Verify Now
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
