"use client";

import * as React from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { useAuth } from "@/components/context/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

// ─── Style tokens ──────────────────────────────────────────────────────────────

const sectionSx = {
  backgroundColor: "#FFFFFF",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  borderRadius: "14px",
  p: { xs: 3, sm: "28px 32px" },
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    height: 40,
    fontSize: 14,
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: "#0F172A", borderWidth: "1px" },
    "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(15, 23, 42, 0.06)" },
  },
  "& .MuiOutlinedInput-input": {
    p: "0 12px",
    color: "#0F172A",
    "&::placeholder": { color: "#94A3B8", opacity: 1 },
  },
};

const fieldLabelSx = {
  fontSize: 12,
  fontWeight: 500,
  color: "#334155",
  mb: 0.75,
  display: "block",
} as const;

const primaryBtnSx = {
  textTransform: "none",
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "-0.005em",
  borderRadius: "8px",
  height: 38,
  px: 2,
  boxShadow: "none",
  backgroundColor: "#0F172A",
  color: "#FFFFFF",
  "&:hover": { backgroundColor: "#1E293B", boxShadow: "none" },
} as const;

const secondaryBtnSx = {
  textTransform: "none",
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "-0.005em",
  borderRadius: "8px",
  height: 38,
  px: 2,
  backgroundColor: "#FFFFFF",
  color: "#0F172A",
  borderColor: "#E2E8F0",
  "&:hover": { backgroundColor: "#F1F5F9", borderColor: "#CBD5E1" },
} as const;

const ghostBtnSx = {
  textTransform: "none",
  fontSize: 13,
  fontWeight: 500,
  color: "text.secondary",
  borderRadius: "8px",
  px: 1.5,
  "&:hover": { backgroundColor: "#F1F5F9", color: "text.primary" },
} as const;

// ─── Sub-components ────────────────────────────────────────────────────────────

type StatusChipVariant = "success" | "warn" | "info" | "neutral" | "danger";

function StatusChip({ label, variant }: { label: string; variant: StatusChipVariant }) {
  const palette: Record<StatusChipVariant, { bg: string; color: string }> = {
    success: { bg: "#ECFDF5", color: "#047857" },
    warn: { bg: "#FFFBEB", color: "#B45309" },
    info: { bg: "#EFF6FF", color: "#1D4ED8" },
    neutral: { bg: "#F1F5F9", color: "#334155" },
    danger: { bg: "#FEF2F2", color: "#DC2626" },
  };
  const c = palette[variant];
  return (
    <Chip
      label={label}
      icon={
        <Box
          component="span"
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "currentColor",
            ml: "8px !important",
          }}
        />
      }
      sx={{
        height: 22,
        backgroundColor: c.bg,
        color: c.color,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.01em",
        borderRadius: "999px",
        "& .MuiChip-label": { px: 0.75 },
        "& .MuiChip-icon": { color: "currentColor" },
      }}
    />
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Box component="section" sx={sectionSx}>
      <Box sx={{ mb: 2.5 }}>
        <Typography
          component="h2"
          sx={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", mb: 0.5 }}
        >
          {title}
        </Typography>
        {description && (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{description}</Typography>
        )}
      </Box>
      {children}
    </Box>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <Box>
      <Typography component="label" sx={fieldLabelSx}>
        {label}
      </Typography>
      <TextField
        fullWidth
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        sx={inputSx}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShow((v) => !v)}
                edge="end"
                disableRipple
                sx={{
                  color: "text.disabled",
                  "&:hover": { color: "text.primary", backgroundColor: "#F1F5F9" },
                }}
              >
                {show ? (
                  <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

type KycStatus = "not_submitted" | "pending" | "verified" | "rejected";

function KycCard({ status, onSubmit }: { status: KycStatus; onSubmit: () => void }) {
  const config: Record<
    KycStatus,
    { label: string; variant: StatusChipVariant; cta: string; ctaVariant: "primary" | "secondary" | "done" }
  > = {
    not_submitted: { label: "Not submitted", variant: "neutral", cta: "Submit documents", ctaVariant: "primary" },
    pending: { label: "Pending review", variant: "info", cta: "View submission", ctaVariant: "secondary" },
    rejected: { label: "Rejected", variant: "danger", cta: "Resubmit documents", ctaVariant: "primary" },
    verified: { label: "Verified", variant: "success", cta: "Verified", ctaVariant: "done" },
  };
  const c = config[status];

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ p: 2.5, backgroundColor: "#F1F5F9", borderRadius: "10px", alignItems: "flex-start" }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          color: "text.primary",
          flexShrink: 0,
        }}
      >
        <VerifiedUserOutlinedIcon sx={{ fontSize: 20 }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Identity verification</Typography>
          <StatusChip label={c.label} variant={c.variant} />
        </Stack>
        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1.75, maxWidth: 480 }}>
          Verified identity builds trust with clients and unlocks higher earning limits and faster payouts.
        </Typography>

        {c.ctaVariant === "done" ? (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "#047857" }}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Your identity is verified</Typography>
          </Stack>
        ) : (
          <Button
            variant={c.ctaVariant === "primary" ? "contained" : "outlined"}
            size="small"
            endIcon={c.ctaVariant === "primary" ? <ArrowForwardIcon sx={{ fontSize: 14 }} /> : undefined}
            onClick={onSubmit}
            sx={c.ctaVariant === "primary" ? primaryBtnSx : secondaryBtnSx}
          >
            {c.cta}
          </Button>
        )}
      </Box>
    </Stack>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

type Session = {
  id: number;
  name: string;
  last_used_at: string | null;
  created_at: string;
  current: boolean;
};

export default function SettingsPage() {
  const { user, setUser, refreshUser } = useAuth();
  const router = useRouter();
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  // Personal info
  const [name, setName] = React.useState(user?.name ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [profileMsg, setProfileMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Avatar
  const [avatarUploading, setAvatarUploading] = React.useState(false);

  // Phone
  const phone = user?.telephone ?? "";
  const phoneVerified = user?.is_verified_phone ?? false;
  const [phoneDialogOpen, setPhoneDialogOpen] = React.useState(false);
  const [newPhone, setNewPhone] = React.useState("");
  const [phoneOtpSent, setPhoneOtpSent] = React.useState(false);
  const [phoneCode, setPhoneCode] = React.useState("");
  const [sendingPhoneOtp, setSendingPhoneOtp] = React.useState(false);
  const [savingPhone, setSavingPhone] = React.useState(false);
  const [phoneMsg, setPhoneMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [passwordMsg, setPasswordMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sessions
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = React.useState(true);
  const [revokingOther, setRevokingOther] = React.useState(false);

  // Deactivate dialog
  const [deactivateOpen, setDeactivateOpen] = React.useState(false);

  // Sync form fields when user loads
  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email ?? "");
    }
  }, [user?.id]);

  // Load sessions
  React.useEffect(() => {
    api.getSessions()
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
  }, []);

  const emailVerified = !!user?.email_verified_at;
  const emailChanged = email !== (user?.email ?? "");

  const kycStatus: KycStatus = (() => {
    if (user?.is_verified_id) return "verified";
    if (user?.kyc_status === "pending") return "pending";
    if (user?.kyc_status === "rejected") return "rejected";
    return "not_submitted";
  })();

  // ── Handlers ──

  const handleSendPhoneOtp = async () => {
    if (!newPhone) return;
    setSendingPhoneOtp(true);
    setPhoneMsg(null);
    try {
      await api.sendPhoneOtp(newPhone);
      setPhoneOtpSent(true);
    } catch (err) {
      setPhoneMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to send code." });
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  const handleUpdatePhone = async () => {
    setSavingPhone(true);
    setPhoneMsg(null);
    try {
      const updatedUser = await api.updatePhone(newPhone, phoneCode);
      setUser(updatedUser);
      setPhoneDialogOpen(false);
      setNewPhone("");
      setPhoneCode("");
      setPhoneOtpSent(false);
      setPhoneMsg({ type: "success", text: "Phone number updated successfully." });
    } catch (err) {
      setPhoneMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to update phone." });
    } finally {
      setSavingPhone(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true);
    try {
      await api.uploadProfileImage(file);
      await refreshUser();
    } catch {
      // silently fail — user will see no change
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarUploading(true);
    try {
      await api.deleteProfileImage();
      await refreshUser();
    } catch {
      // silently fail
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const updatedUser = await api.updateUserProfile({ name, email });
      setUser(updatedUser);
      setProfileMsg({
        type: "success",
        text: emailChanged
          ? "Profile saved. A verification link has been sent to your new email."
          : "Profile saved successfully.",
      });
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    setSavingPassword(true);
    try {
      await api.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordMsg({ type: "success", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to change password.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRevokeSession = async (id: number) => {
    try {
      await api.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // silently fail
    }
  };

  const handleRevokeOther = async () => {
    setRevokingOther(true);
    try {
      await api.revokeOtherSessions();
      setSessions((prev) => prev.filter((s) => s.current));
    } catch {
      // silently fail
    } finally {
      setRevokingOther(false);
    }
  };

  const formatSessionTime = (isoString: string | null) => {
    if (!isoString) return "Never";
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 2) return "Active now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  const guessDevice = (tokenName: string): "desktop" | "mobile" => {
    const lower = tokenName.toLowerCase();
    if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) return "mobile";
    return "desktop";
  };

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const avatarInitials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, sm: 7 }, pb: 12 }}>
      {/* Page header */}
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 500, mb: 0.75 }}>
          Account
        </Typography>
        <Typography
          component="h1"
          sx={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em", mb: 0.75 }}
        >
          Settings
        </Typography>
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          Manage your profile, security, and account preferences.
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        {/* 1. Profile photo */}
        <Section title="Profile photo" description="This is how clients will see you across Kickair.">
          <Stack direction="row" alignItems="center" spacing={2.5} flexWrap="wrap" useFlexGap>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={user.avatar_url ?? undefined}
                sx={{
                  width: 80,
                  height: 80,
                  background: "linear-gradient(135deg, #1E293B, #0F172A)",
                  color: "#FFF",
                  fontSize: 28,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                }}
              >
                {avatarInitials}
              </Avatar>
              {avatarUploading && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                </Box>
              )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 0.75 }}>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpg,image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileUploadOutlinedIcon sx={{ fontSize: 16 }} />}
                  disabled={avatarUploading}
                  onClick={() => avatarInputRef.current?.click()}
                  sx={secondaryBtnSx}
                >
                  Upload photo
                </Button>
                {user.avatar_url && (
                  <Button
                    variant="text"
                    size="small"
                    disabled={avatarUploading}
                    onClick={handleAvatarRemove}
                    sx={ghostBtnSx}
                  >
                    Remove
                  </Button>
                )}
              </Stack>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                JPG or PNG, max 5&nbsp;MB.
              </Typography>
            </Box>
          </Stack>
        </Section>

        {/* 2. Personal information */}
        <Section title="Personal information" description="Your name and contact email.">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Box>
              <Typography component="label" sx={fieldLabelSx}>
                Full name
              </Typography>
              <TextField
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={inputSx}
              />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                <Typography component="label" sx={{ ...fieldLabelSx, mb: 0 }}>
                  Email
                </Typography>
                <StatusChip
                  label={emailVerified ? "Verified" : "Unverified"}
                  variant={emailVerified ? "success" : "warn"}
                />
              </Stack>
              <TextField
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={inputSx}
              />
            </Box>
          </Box>

          {emailChanged && (
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 1.5 }}>
              <InfoOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", mt: "2px" }} />
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                A verification link will be sent to your new email.
              </Typography>
            </Stack>
          )}

          {profileMsg && (
            <Alert severity={profileMsg.type} sx={{ mt: 1.5, borderRadius: "8px", py: 0.5 }}>
              {profileMsg.text}
            </Alert>
          )}

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2.5 }}>
            <Button
              variant="contained"
              disabled={savingProfile}
              onClick={handleSaveProfile}
              sx={primaryBtnSx}
            >
              {savingProfile ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Save changes"}
            </Button>
          </Stack>
        </Section>

        {/* 3. Phone number */}
        <Section
          title="Phone number"
          description="Used for two-factor authentication and order alerts."
        >
          {phoneMsg && (
            <Alert
              severity={phoneMsg.type}
              onClose={() => setPhoneMsg(null)}
              sx={{ mb: 2, borderRadius: "8px", fontSize: 13 }}
            >
              {phoneMsg.text}
            </Alert>
          )}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              fullWidth
              type="tel"
              value={phone || ""}
              placeholder="No phone number added"
              disabled
              sx={inputSx}
            />
            {phone && (
              <StatusChip
                label={phoneVerified ? "Verified" : "Unverified"}
                variant={phoneVerified ? "success" : "warn"}
              />
            )}
            <Button
              variant="outlined"
              onClick={() => {
                setNewPhone("");
                setPhoneCode("");
                setPhoneOtpSent(false);
                setPhoneMsg(null);
                setPhoneDialogOpen(true);
              }}
              sx={{ ...secondaryBtnSx, whiteSpace: "nowrap" }}
            >
              {phone ? (phoneVerified ? "Change" : "Verify") : "Add phone"}
            </Button>
          </Stack>

          {phone && !phoneVerified && (
            <Alert
              icon={<WarningAmberOutlinedIcon sx={{ fontSize: 18 }} />}
              severity="warning"
              sx={{
                mt: 2,
                backgroundColor: "#FFFBEB",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                color: "#92400E",
                borderRadius: "8px",
                py: 1,
                "& .MuiAlert-icon": { color: "#F59E0B", py: 0.25 },
                "& .MuiAlert-message": { fontSize: 13, py: 0.5 },
              }}
            >
              Verify your phone to increase trust with clients and unlock 2FA.
            </Alert>
          )}
        </Section>

        {/* Phone OTP dialog */}
        <Dialog
          open={phoneDialogOpen}
          onClose={() => !savingPhone && setPhoneDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "14px", p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, fontSize: 16, pb: 0.5 }}>
            {phone ? (phoneVerified ? "Change phone number" : "Verify phone number") : "Add phone number"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
              {phone && !phoneVerified
                ? `Send a code to ${phone} to verify it, or enter a new number below.`
                : "Enter your phone number in international format. We'll send you a verification code."}
            </DialogContentText>

            <Stack spacing={1.5}>
              {/* Phone input + send code */}
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  type="tel"
                  placeholder={phone || "+855 12 345 678"}
                  value={newPhone}
                  onChange={e => {
                    setNewPhone(e.target.value);
                    setPhoneOtpSent(false);
                    setPhoneCode("");
                  }}
                  disabled={savingPhone}
                  size="small"
                  sx={inputSx}
                />
                <Button
                  variant="outlined"
                  onClick={handleSendPhoneOtp}
                  disabled={sendingPhoneOtp || !newPhone || savingPhone}
                  sx={{ ...secondaryBtnSx, minWidth: 100, flexShrink: 0 }}
                >
                  {sendingPhoneOtp
                    ? <CircularProgress size={14} />
                    : phoneOtpSent ? "Resend" : "Send code"}
                </Button>
              </Stack>

              <Typography variant="caption" color="text.secondary">
                Include country code, e.g. +855 for Cambodia
              </Typography>

              {/* Code input — shown after OTP sent */}
              {phoneOtpSent && (
                <TextField
                  fullWidth
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={phoneCode}
                  onChange={e => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={savingPhone}
                  size="small"
                  inputProps={{ maxLength: 6, style: { letterSpacing: "0.3em", textAlign: "center" } }}
                  sx={inputSx}
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              onClick={() => setPhoneDialogOpen(false)}
              disabled={savingPhone}
              sx={{ ...secondaryBtnSx, flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdatePhone}
              disabled={!phoneOtpSent || phoneCode.length < 6 || savingPhone}
              sx={{ ...primaryBtnSx, flex: 1 }}
            >
              {savingPhone
                ? <CircularProgress size={16} sx={{ color: "#fff" }} />
                : "Confirm"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 4. Password */}
        <Section
          title="Password"
          description="Use at least 8 characters with a mix of letters, numbers, and symbols."
        >
          <Stack spacing={2}>
            <PasswordField
              label="Current password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={setCurrentPassword}
            />
            <PasswordField
              label="New password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={setNewPassword}
            />
            <PasswordField
              label="Confirm new password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </Stack>

          {passwordMsg && (
            <Alert severity={passwordMsg.type} sx={{ mt: 1.5, borderRadius: "8px", py: 0.5 }}>
              {passwordMsg.text}
            </Alert>
          )}

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2.5 }}>
            <Button
              variant="contained"
              disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
              onClick={handleChangePassword}
              sx={primaryBtnSx}
            >
              {savingPassword ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Update password"}
            </Button>
          </Stack>
        </Section>

        {/* 5. Identity verification (KYC) */}
        <Section
          title="Identity verification"
          description="Confirm your identity to unlock all marketplace features."
        >
          <KycCard status={kycStatus} onSubmit={() => router.push("/dashboard/kyc")} />
        </Section>

        {/* 6. Active sessions */}
        <Section
          title="Active sessions"
          description="Devices currently signed in to your account."
        >
          {sessionsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : sessions.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>No active sessions found.</Typography>
          ) : (
            <Stack divider={<Box sx={{ height: "1px", backgroundColor: "#F1F5F9" }} />}>
              {sessions.map((s) => (
                <Stack
                  key={s.id}
                  direction="row"
                  alignItems="center"
                  spacing={1.75}
                  sx={{
                    py: 1.75,
                    "&:first-of-type": { pt: 0 },
                    "&:last-of-type": { pb: 0 },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      display: "grid",
                      placeItems: "center",
                      color: "text.primary",
                      flexShrink: 0,
                    }}
                  >
                    {guessDevice(s.name) === "desktop" ? (
                      <DesktopWindowsOutlinedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <SmartphoneOutlinedIcon sx={{ fontSize: 18 }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{s.name}</Typography>
                      {s.current && <StatusChip label="This device" variant="success" />}
                    </Stack>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {formatSessionTime(s.last_used_at || s.created_at)}
                    </Typography>
                  </Box>
                  {!s.current && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleRevokeSession(s.id)}
                      sx={secondaryBtnSx}
                    >
                      Revoke
                    </Button>
                  )}
                </Stack>
              ))}
            </Stack>
          )}

          {sessions.length > 1 && (
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button
                variant="text"
                size="small"
                disabled={revokingOther}
                onClick={handleRevokeOther}
                sx={{
                  ...ghostBtnSx,
                  color: "#DC2626",
                  "&:hover": { backgroundColor: "#FEF2F2", color: "#DC2626" },
                }}
              >
                {revokingOther ? (
                  <CircularProgress size={14} sx={{ color: "#DC2626" }} />
                ) : (
                  "Sign out of all other sessions"
                )}
              </Button>
            </Stack>
          )}
        </Section>

        {/* 7. Danger zone */}
        <Box
          sx={{
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(220, 38, 38, 0.2)",
            borderRadius: "14px",
            p: { xs: 3, sm: "24px 28px" },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "flex-start" },
            justifyContent: "space-between",
            gap: 2,
            mt: 1,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#DC2626", mb: 0.5 }}>
              Deactivate account
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary", maxWidth: 460 }}>
              Your profile will be hidden and all active orders must be completed first. This action
              can be reversed within 30 days.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => setDeactivateOpen(true)}
            sx={{
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: "8px",
              height: 38,
              px: 2,
              color: "#DC2626",
              borderColor: "rgba(220, 38, 38, 0.3)",
              "&:hover": { backgroundColor: "#FEF2F2", borderColor: "#DC2626" },
            }}
          >
            Deactivate account
          </Button>
        </Box>
      </Stack>

      {/* Deactivate confirmation dialog */}
      <Dialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        PaperProps={{ sx: { borderRadius: "14px", p: 1, maxWidth: 420 } }}
      >
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600, pb: 1 }}>
          Deactivate your account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 13, color: "text.secondary" }}>
            Your profile will be hidden from clients and you&apos;ll be signed out everywhere. You
            can reactivate within 30 days by signing back in.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeactivateOpen(false)} sx={ghostBtnSx}>
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              ...primaryBtnSx,
              backgroundColor: "#DC2626",
              "&:hover": { backgroundColor: "#B91C1C" },
            }}
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
