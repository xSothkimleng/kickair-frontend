"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  Monitor,
  ShieldCheck,
  Smartphone,
  Upload,
} from "lucide-react";
import { css, cva } from "styled-system/css";
import { Alert, Avatar, Spinner, alert } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import { useAuth } from "@/components/context/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { TextInput, PasswordInput, PhoneInput, OtpInput } from "@/components/ui/inputs";

// ─── Style tokens ──────────────────────────────────────────────────────────────

const sectionCss = css({
  backgroundColor: "#FFFFFF",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(15, 23, 42, 0.08)",
  borderRadius: "14px",
  p: { base: "24px", sm: "28px 32px" },
  boxSizing: "border-box",
});

const fieldLabelCss = css({
  textStyle: "meta",
  fontWeight: 500,
  color: "#334155",
  display: "block",
});

/**
 * The three Button looks this page used (`primaryBtnSx`, `secondaryBtnSx`,
 * `ghostBtnSx`) plus the danger flavours, on the old base metrics
 * (min-width 64px) and disabled palette.
 */
const btn = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    minW: "64px",
    cursor: "pointer",
    userSelect: "none",
    textDecoration: "none",
    transition: "background-color .15s, border-color .15s, color .15s",
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
    "& svg": { display: "block" },
  },
  variants: {
    tone: {
      primary: {
        textStyle: "ui",
        fontWeight: 600,
        borderRadius: "8px",
        h: "38px",
        px: "16px",
        border: "none",
        boxShadow: "none",
        backgroundColor: "#0F172A",
        color: "#FFFFFF",
        _hover: { backgroundColor: "#1E293B", boxShadow: "none" },
        _disabled: {
          backgroundColor: "rgba(0, 0, 0, 0.12)",
          color: "rgba(0, 0, 0, 0.26)",
          cursor: "default",
          pointerEvents: "none",
        },
      },
      secondary: {
        textStyle: "ui",
        fontWeight: 600,
        borderRadius: "8px",
        h: "38px",
        px: "16px",
        backgroundColor: "#FFFFFF",
        color: "#0F172A",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#E2E8F0",
        _hover: { backgroundColor: "#F1F5F9", borderColor: "#CBD5E1" },
        _disabled: {
          color: "rgba(0, 0, 0, 0.26)",
          borderColor: "rgba(0, 0, 0, 0.12)",
          backgroundColor: "#FFFFFF",
          cursor: "default",
          pointerEvents: "none",
        },
      },
      // Same look, but it rendered as a *text* button (no `variant="outlined"`),
      // so the borderColor from the sx never drew a border.
      secondaryFlat: {
        textStyle: "ui",
        fontWeight: 600,
        borderRadius: "8px",
        h: "38px",
        px: "16px",
        backgroundColor: "#FFFFFF",
        color: "#0F172A",
        border: "none",
        _hover: { backgroundColor: "#F1F5F9" },
        _disabled: { color: "rgba(0, 0, 0, 0.26)", cursor: "default", pointerEvents: "none" },
      },
      ghost: {
        textStyle: "ui",
        fontWeight: 500,
        color: "ink2",
        borderRadius: "8px",
        px: "12px",
        py: "4px",
        border: "none",
        backgroundColor: "transparent",
        _hover: { backgroundColor: "#F1F5F9", color: "ink" },
        _disabled: { color: "rgba(0, 0, 0, 0.26)", cursor: "default", pointerEvents: "none" },
      },
      ghostDanger: {
        textStyle: "ui",
        fontWeight: 500,
        color: "#DC2626",
        borderRadius: "8px",
        px: "12px",
        py: "4px",
        border: "none",
        backgroundColor: "transparent",
        _hover: { backgroundColor: "#FEF2F2", color: "#DC2626" },
        _disabled: { color: "rgba(0, 0, 0, 0.26)", cursor: "default", pointerEvents: "none" },
      },
      dangerOutline: {
        textStyle: "ui",
        fontWeight: 600,
        borderRadius: "8px",
        h: "38px",
        px: "16px",
        color: "#DC2626",
        backgroundColor: "transparent",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgba(220, 38, 38, 0.3)",
        _hover: { backgroundColor: "#FEF2F2", borderColor: "#DC2626" },
      },
      dangerSolid: {
        textStyle: "ui",
        fontWeight: 600,
        borderRadius: "8px",
        h: "38px",
        px: "16px",
        border: "none",
        boxShadow: "none",
        backgroundColor: "#DC2626",
        color: "#FFFFFF",
        _hover: { backgroundColor: "#B91C1C", boxShadow: "none" },
      },
    },
    grow: { true: { flex: 1 } },
    wide: { true: { minW: "100px", flexShrink: 0 } },
    nowrap: { true: { whiteSpace: "nowrap" } },
  },
  defaultVariants: { tone: "primary" },
});

// Button start-icon metrics for a small button.
const btnStartIcon = css({ ml: "-2px", mr: "8px", flexShrink: 0 });
const btnEndIcon = css({ ml: "8px", mr: "-2px", flexShrink: 0 });
const spinnerWhite = css({ color: "#FFFFFF" });
// The spinner colour is the accent.
const spinnerPrimary = css({ color: "#1976d2" });
const spinnerDanger = css({ color: "#DC2626" });

// ─── Sub-components ────────────────────────────────────────────────────────────

type StatusChipVariant = "success" | "warn" | "info" | "neutral" | "danger";

// Chip icon: the 6px dot sits 8px in and its -6px margin-right is cancelled
// by the label's 6px padding-left, so the dot touches the text.
const statusChip = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    boxSizing: "border-box",
    h: "22px",
    pl: "8px",
    pr: "6px",
    borderRadius: "999px",
    textStyle: "micro",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  variants: {
    variant: {
      success: { backgroundColor: "#ECFDF5", color: "#047857" },
      warn: { backgroundColor: "#FFFBEB", color: "#B45309" },
      info: { backgroundColor: "#EFF6FF", color: "#1D4ED8" },
      neutral: { backgroundColor: "#F1F5F9", color: "#334155" },
      danger: { backgroundColor: "#FEF2F2", color: "#DC2626" },
    },
  },
  defaultVariants: { variant: "neutral" },
});
const statusDot = css({
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: "currentColor",
  flexShrink: 0,
});

function StatusChip({ label, variant }: { label: string; variant: StatusChipVariant }) {
  return (
    <span className={statusChip({ variant })}>
      <span className={statusDot} />
      {label}
    </span>
  );
}

const sectionHead = css({ mb: "20px" });
// `mb` on the <h2> / <p> never applied (globals.css zeroes those margins unlayered).
const sectionTitleCss = css({
  textStyle: "body",
  fontWeight: 600,
  color: "ink",
});
const sectionDescCss = css({ textStyle: "ui", color: "ink2" });

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
    <section className={sectionCss}>
      <div className={sectionHead}>
        <h2 className={sectionTitleCss}>{title}</h2>
        {description && <p className={sectionDescCss}>{description}</p>}
      </div>
      {children}
    </section>
  );
}

type KycStatus = "not_submitted" | "pending" | "verified" | "rejected";

const kycCard = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "16px",
  p: "20px",
  backgroundColor: "#F1F5F9",
  borderRadius: "10px",
});
const kycTile = css({
  width: "40px",
  height: "40px",
  boxSizing: "border-box",
  backgroundColor: "#FFFFFF",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(15, 23, 42, 0.08)",
  borderRadius: "10px",
  display: "grid",
  placeItems: "center",
  color: "ink",
  flexShrink: 0,
});
const kycBody = css({ flex: 1, minW: 0 });
const kycTitleRow = css({ display: "flex", alignItems: "center", gap: "8px", mb: "6px" });
const kycTitle = css({ textStyle: "body", fontWeight: 600 });
const kycText = css({ textStyle: "ui", color: "ink2", maxW: "480px", mb: "14px" });
// The old stack spacing was a margin-left on the <p>, which globals.css already killed.
const kycDoneRow = css({ display: "flex", alignItems: "center", color: "#047857" });
const kycDoneText = css({ textStyle: "ui", fontWeight: 600 });

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
    <div className={kycCard}>
      <div className={kycTile}>
        <ShieldCheck size={20} />
      </div>
      <div className={kycBody}>
        <div className={kycTitleRow}>
          <p className={kycTitle}>Identity verification</p>
          <StatusChip label={c.label} variant={c.variant} />
        </div>
        <p className={kycText}>
          Verified identity builds trust with clients and unlocks higher earning limits and faster payouts.
        </p>

        {c.ctaVariant === "done" ? (
          <div className={kycDoneRow}>
            <CheckCircle2 size={18} />
            <p className={kycDoneText}>Your identity is verified</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            className={btn({ tone: c.ctaVariant === "primary" ? "primary" : "secondary" })}
          >
            {c.cta}
            {c.ctaVariant === "primary" && <ArrowRight size={14} className={btnEndIcon} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page chrome ───────────────────────────────────────────────────────────────

const pageContainer = css({
  maxW: "900px",
  mx: "auto",
  w: "100%",
  px: { base: "16px", sm: "24px" },
  // `pb: 12` lost to `py` in the original sx — the rendered padding is symmetric.
  py: { base: "32px", sm: "56px" },
  boxSizing: "border-box",
});
const pageHeader = css({ mb: "40px" });
const pageKicker = css({ textStyle: "meta", fontWeight: 500, color: "ink2" });
const pageTitle = css({ textStyle: "stat", fontWeight: 700, color: "ink" });
const pageSub = css({ textStyle: "body", color: "ink2" });
const sectionsStack = css({ display: "flex", flexDirection: "column", gap: "20px" });
const fieldStack = css({ display: "flex", flexDirection: "column", gap: "16px" });

const bootLoading = css({ display: "flex", justifyContent: "center", alignItems: "center", minH: "60vh" });

const photoRow = css({ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" });
const avatarWrap = css({ position: "relative" });
const avatarStyle = {
  background: "linear-gradient(135deg, #1E293B, #0F172A)",
  color: "#FFF",
  textStyle: "stat",
  fontWeight: 600,
} as const;
const avatarBusy = css({
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "grid",
  placeItems: "center",
});
const photoSide = css({ flex: 1, minW: "200px" });
// The hidden <input> was a Stack child, so the stack spacing indented the first button by 8px.
const photoButtons = css({ display: "flex", gap: "8px", pl: "8px", mb: "6px" });
const hiddenInput = css({ display: "none" });
const photoHint = css({ textStyle: "meta", color: "ink2" });

const infoGrid = cva({
  base: { display: "grid", gap: "16px" },
  variants: { twoUp: { true: { gridTemplateColumns: { base: "1fr", sm: "1fr 1fr" } }, false: { gridTemplateColumns: "1fr" } } },
});
const labelRow = css({ display: "flex", alignItems: "center", gap: "8px", mb: "6px" });
const requiredMark = css({ color: "#DC2626" });
const hintRow = css({ display: "flex", alignItems: "flex-start", mt: "12px" });
const hintIcon = css({ color: "ink3", mt: "2px", flexShrink: 0 });
const hintText = css({ textStyle: "meta", color: "ink2" });
const alertSpaced = css({ mt: "12px" });
const actionsRight = css({ display: "flex", justifyContent: "flex-end", mt: "20px" });

const addEmailBlock = css({
  mt: "24px",
  pt: "24px",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "#F1F5F9",
});
const addEmailHead = css({ display: "flex", alignItems: "center", gap: "8px", mb: "4px" });
const addEmailTitle = css({ textStyle: "body", fontWeight: 600 });
const addEmailText = css({ textStyle: "ui", color: "ink2", maxW: "480px", mb: "14px" });
const stackRow = css({
  display: "flex",
  flexDirection: { base: "column", sm: "row" },
  alignItems: { base: "stretch", sm: "flex-start" },
  gap: "12px",
});
const stackRowCentered = css({
  display: "flex",
  flexDirection: { base: "column", sm: "row" },
  alignItems: { base: "stretch", sm: "center" },
  gap: "12px",
});
const flexOne = css({ flex: 1, minW: 0 });
const alertPhone = css({ mb: "16px" });

// The unverified-phone banner kept its own amber palette, so it overrides the ds tones.
const phoneWarning = css(alert.raw({ tone: "warning" }), {
  mt: "16px",
  px: "16px",
  py: "8px",
  gap: "12px",
  borderRadius: "8px",
  backgroundColor: "#FFFBEB",
  borderColor: "rgba(245, 158, 11, 0.25)",
  color: "#92400E",
  textStyle: "ui",
  "& > svg": { color: "#F59E0B", mt: "2px" },
});

const phoneWarningMsg = css({ flex: 1, minW: 0, py: "4px" });

const dialogPaper = css({
  // BareModal's panel radius is 16px; the old one was 14px.
  borderRadius: "14px !important",
  p: "8px",
  boxSizing: "border-box",
  color: "ink",
});
const dialogContent = css({ p: "20px 24px" });
const dialogTitle = css({ textStyle: "lead", fontWeight: 600 });
const dialogDesc = css({ textStyle: "ui", color: "ink2" });
const dialogActions = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "16px",
  px: "24px",
  pt: "8px",
  pb: "20px",
});
const dialogActionsTight = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "16px",
  px: "24px",
  pt: "8px",
  pb: "16px",
});
// The old stack spacing: the margin lands on every child but <p>, where globals.css kills it.
const dialogStack = css({ "& > * + *": { mt: "12px" } });
const dialogPhoneRow = css({ display: "flex", alignItems: "flex-start", gap: "8px" });
const otpHint = css({ textStyle: "ui", color: "ink2" });

const sessionsEmpty = css({ textStyle: "ui", color: "ink2" });
const sessionsLoadingWrap = css({ display: "flex", justifyContent: "center", py: "24px" });
const sessionDivider = css({ height: "1px", backgroundColor: "#F1F5F9" });
const sessionRow = css({
  display: "flex",
  alignItems: "center",
  gap: "14px",
  py: "14px",
  "&:first-of-type": { pt: 0 },
  "&:last-of-type": { pb: 0 },
});
const sessionIcon = css({
  width: "36px",
  height: "36px",
  backgroundColor: "#F1F5F9",
  borderRadius: "8px",
  display: "grid",
  placeItems: "center",
  color: "ink",
  flexShrink: 0,
});
const sessionBody = css({ flex: 1, minW: 0 });
const sessionNameRow = css({ display: "flex", alignItems: "center", gap: "8px", mb: "2px" });
const sessionName = css({ textStyle: "body", fontWeight: 500 });
const sessionMeta = css({ textStyle: "meta", color: "ink2" });
const signOutRow = css({ display: "flex", justifyContent: "flex-end", mt: "16px" });

const dangerBox = css({
  backgroundColor: "#FFFFFF",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(220, 38, 38, 0.2)",
  borderRadius: "14px",
  p: { base: "24px", sm: "24px 28px" },
  display: "flex",
  flexDirection: { base: "column", sm: "row" },
  alignItems: { base: "stretch", sm: "flex-start" },
  justifyContent: "space-between",
  gap: "16px",
  boxSizing: "border-box",
});
const dangerTitle = css({ textStyle: "body", fontWeight: 600, color: "#DC2626", mb: "4px" });
const dangerText = css({ textStyle: "ui", color: "ink2", maxW: "460px" });

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
  const [addingEmail, setAddingEmail] = React.useState(false);
  const [profileMsg, setProfileMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Avatar
  const [avatarUploading, setAvatarUploading] = React.useState(false);

  // Phone
  const phone = user?.telephone ?? "";
  const phoneVerified = user?.is_verified_phone ?? false;
  const [phoneDialogOpen, setPhoneDialogOpen] = React.useState(false);
  const [newPhone, setNewPhone] = React.useState(""); // local digits — +855 prefix comes from PhoneInput
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
  const [pwErrors, setPwErrors] = React.useState<{ current?: string; new?: string; confirm?: string }>({});

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

  // Phone-only accounts (signed up with a phone, no email) can add an email here as a
  // second contact. Accounts that already have an email edit it via updateProfile instead.
  const hasEmail = !!user?.email;
  const emailVerified = !!user?.email_verified_at;
  const emailChanged = email !== (user?.email ?? "");

  const kycStatus: KycStatus = (() => {
    if (user?.is_verified_id) return "verified";
    if (user?.kyc_status === "pending") return "pending";
    if (user?.kyc_status === "rejected") return "rejected";
    return "not_submitted";
  })();

  // ── Handlers ──

  // PhoneInput collects the local part only — convert to E.164 the same way sign-up does.
  const e164NewPhone = () => `+855${newPhone.replace(/\D/g, "").replace(/^0+/, "")}`;

  const handleSendPhoneOtp = async () => {
    if (!newPhone.replace(/\D/g, "")) return;
    setSendingPhoneOtp(true);
    setPhoneMsg(null);
    try {
      await api.sendPhoneOtp(e164NewPhone());
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
      const updatedUser = await api.updatePhone(e164NewPhone(), phoneCode);
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
      // Phone-only accounts add their email through handleAddEmail, not here — only send
      // the email field for accounts that already have one (so we never blank it out).
      const updatedUser = await api.updateUserProfile({ name, ...(hasEmail ? { email } : {}) });
      setUser(updatedUser);
      setProfileMsg({
        type: "success",
        text: hasEmail && emailChanged
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

  const handleAddEmail = async () => {
    if (!email.trim()) return;
    setAddingEmail(true);
    setProfileMsg(null);
    try {
      const updatedUser = await api.addEmail(email.trim());
      setUser(updatedUser);
      setProfileMsg({ type: "success", text: "Email added — check your inbox to verify it." });
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to add email.",
      });
    } finally {
      setAddingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg(null);
    const errs: typeof pwErrors = {};
    if (!currentPassword) errs.current = "Current password is required";
    if (!newPassword) errs.new = "New password is required";
    else if (newPassword.length < 8) errs.new = "Password must be at least 8 characters";
    if (!confirmPassword) errs.confirm = "Please confirm your new password";
    else if (newPassword && newPassword !== confirmPassword) errs.confirm = "Passwords do not match";
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSavingPassword(true);
    try {
      await api.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordMsg({ type: "success", text: "Password changed successfully." });
      setPwErrors({});
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

  // Token names are now device labels from the backend ("Chrome · Windows",
  // "Safari · iPhone"). Tokens created before that change are still named
  // "api-token" — show those as "Unknown device".
  const displaySessionName = (tokenName: string) =>
    tokenName === "api-token" ? "Unknown device" : tokenName;

  const guessDevice = (tokenName: string): "desktop" | "mobile" => {
    const lower = tokenName.toLowerCase();
    if (["iphone", "ipad", "android", "mobile"].some((k) => lower.includes(k))) return "mobile";
    return "desktop";
  };

  if (!user) {
    return (
      <div className={bootLoading}>
        <Spinner size={40} className={spinnerPrimary} />
      </div>
    );
  }

  return (
    <div className={pageContainer}>
      {/* Page header */}
      <div className={pageHeader}>
        <p className={pageKicker}>Account</p>
        <h1 className={pageTitle}>Settings</h1>
        <p className={pageSub}>Manage your profile, security, and account preferences.</p>
      </div>

      <div className={sectionsStack}>
        {/* 1. Profile photo */}
        <Section title="Profile photo" description="This is how clients will see you across Kickair.">
          <div className={photoRow}>
            <div className={avatarWrap}>
              <Avatar name={user.name} src={user.avatar_url ?? undefined} px={80} style={avatarStyle} />
              {avatarUploading && (
                <div className={avatarBusy}>
                  <Spinner size={24} className={spinnerWhite} />
                </div>
              )}
            </div>
            <div className={photoSide}>
              <div className={photoButtons}>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpg,image/jpeg,image/png,image/webp"
                  className={hiddenInput}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={avatarUploading}
                  onClick={() => avatarInputRef.current?.click()}
                  className={btn({ tone: "secondary" })}
                >
                  <Upload size={18} className={btnStartIcon} />
                  Upload photo
                </button>
                {user.avatar_url && (
                  <button
                    type="button"
                    disabled={avatarUploading}
                    onClick={handleAvatarRemove}
                    className={btn({ tone: "ghost" })}
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className={photoHint}>JPG or PNG, max 5&nbsp;MB.</p>
            </div>
          </div>
        </Section>

        {/* 2. Personal information */}
        <Section
          title="Personal information"
          description={hasEmail ? "Your name and contact email." : "Your name and account contacts."}
        >
          <div className={infoGrid({ twoUp: hasEmail })}>
            <TextInput label="Full name" required value={name} onChange={setName} />
            {hasEmail && (
              <div>
                <div className={labelRow}>
                  <label className={fieldLabelCss}>
                    Email <span className={requiredMark}>*</span>
                  </label>
                  <StatusChip
                    label={emailVerified ? "Verified" : "Unverified"}
                    variant={emailVerified ? "success" : "warn"}
                  />
                </div>
                <TextInput type="email" value={email} onChange={setEmail} />
              </div>
            )}
          </div>

          {hasEmail && emailChanged && (
            <div className={hintRow}>
              <Info size={14} className={hintIcon} />
              <p className={hintText}>A verification link will be sent to your new email.</p>
            </div>
          )}

          {profileMsg && (
            <Alert tone={profileMsg.type} className={alertSpaced}>
              {profileMsg.text}
            </Alert>
          )}

          <div className={actionsRight}>
            <button
              type="button"
              disabled={savingProfile}
              onClick={handleSaveProfile}
              className={btn({ tone: "primary" })}
            >
              {savingProfile ? <Spinner size={16} className={spinnerWhite} /> : "Save changes"}
            </button>
          </div>

          {/* Add email — phone-only accounts add their email here as a second contact */}
          {!hasEmail && (
            <div className={addEmailBlock}>
              <div className={addEmailHead}>
                <p className={addEmailTitle}>Email address</p>
                <StatusChip label="Not added" variant="neutral" />
              </div>
              <p className={addEmailText}>
                Add an email as a second way to sign in and to receive order notifications. We&apos;ll
                send a verification link to confirm it.
              </p>
              <div className={stackRow}>
                <div className={flexOne}>
                  <TextInput
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={setEmail}
                    disabled={addingEmail}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddEmail}
                  disabled={addingEmail || !email.trim()}
                  className={btn({ tone: "primary", nowrap: true })}
                >
                  {addingEmail ? <Spinner size={16} className={spinnerWhite} /> : "Add email"}
                </button>
              </div>
            </div>
          )}
        </Section>

        {/* 3. Phone number */}
        <Section
          title="Phone number"
          description="Used for two-factor authentication and order alerts."
        >
          {phoneMsg && (
            <Alert tone={phoneMsg.type} onClose={() => setPhoneMsg(null)} className={alertPhone}>
              {phoneMsg.text}
            </Alert>
          )}

          <div className={stackRowCentered}>
            <div className={flexOne}>
              <TextInput type="tel" value={phone || ""} placeholder="No phone number added" disabled />
            </div>
            {phone && (
              <StatusChip
                label={phoneVerified ? "Verified" : "Unverified"}
                variant={phoneVerified ? "success" : "warn"}
              />
            )}
            <button
              type="button"
              onClick={() => {
                setNewPhone("");
                setPhoneCode("");
                setPhoneOtpSent(false);
                setPhoneMsg(null);
                setPhoneDialogOpen(true);
              }}
              className={btn({ tone: "secondary", nowrap: true })}
            >
              {phone ? (phoneVerified ? "Change" : "Verify") : "Add phone"}
            </button>
          </div>

          {phone && !phoneVerified && (
            <div role="alert" className={phoneWarning}>
              <AlertTriangle size={18} />
              <div className={phoneWarningMsg}>
                Verify your phone to increase trust with clients and unlock 2FA.
              </div>
            </div>
          )}
        </Section>

        {/* Phone OTP dialog */}
        <BareModal
          open={phoneDialogOpen}
          onOpenChange={(open) => { if (!open && !savingPhone) setPhoneDialogOpen(false); }}
          maxW="460px"
          className={dialogPaper}
        >
          <div className={dialogContent}>
            <p className={dialogTitle}>
              {phone ? (phoneVerified ? "Change phone number" : "Verify phone number") : "Add phone number"}
            </p>
            <p className={dialogDesc}>
              {phone && !phoneVerified
                ? "Enter your Cambodian mobile number below — we'll send a verification code to it via Telegram."
                : "Enter your Cambodian mobile number. We'll send a verification code via Telegram."}
            </p>

            {phoneMsg?.type === "error" && (
              <Alert tone="error" onClose={() => setPhoneMsg(null)} className={alertPhone}>
                {phoneMsg.text}
              </Alert>
            )}

            <div className={dialogStack}>
              {/* Phone input + send code */}
              <div className={dialogPhoneRow}>
                <div className={flexOne}>
                  <PhoneInput
                    placeholder="12 345 678"
                    value={newPhone}
                    onChange={(v) => { setNewPhone(v); setPhoneOtpSent(false); setPhoneCode(""); }}
                    disabled={savingPhone}
                    size="sm"
                    helper="Cambodian number — digits only, we add the +855 for you."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSendPhoneOtp()}
                  disabled={sendingPhoneOtp || !newPhone.replace(/\D/g, "") || savingPhone}
                  className={btn({ tone: "secondary", wide: true })}
                >
                  {sendingPhoneOtp
                    ? <Spinner size={14} className={spinnerPrimary} />
                    : phoneOtpSent ? "Resend" : "Send code"}
                </button>
              </div>

              {/* Code input — shown after OTP sent */}
              {phoneOtpSent && (
                <>
                  <p className={otpHint}>
                    We sent a 6-digit code to <strong>{e164NewPhone()}</strong> via{" "}
                    <strong>Telegram</strong>. Check your Telegram app.
                  </p>
                  <OtpInput value={phoneCode} onChange={setPhoneCode} disabled={savingPhone} autoFocus />
                </>
              )}
            </div>
          </div>
          <div className={dialogActions}>
            <button
              type="button"
              onClick={() => setPhoneDialogOpen(false)}
              disabled={savingPhone}
              className={btn({ tone: "secondaryFlat", grow: true })}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdatePhone}
              disabled={!phoneOtpSent || phoneCode.length < 6 || savingPhone}
              className={btn({ tone: "primary", grow: true })}
            >
              {savingPhone
                ? <Spinner size={16} className={spinnerWhite} />
                : "Confirm"}
            </button>
          </div>
        </BareModal>

        {/* 4. Password */}
        <Section
          title="Password"
          description="Use at least 8 characters with a mix of letters, numbers, and symbols."
        >
          <div className={fieldStack}>
            <PasswordInput
              label="Current password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(v) => { setCurrentPassword(v); setPwErrors(p => ({ ...p, current: undefined })); }}
              required
              error={pwErrors.current}
            />
            <PasswordInput
              label="New password"
              placeholder="Enter new password (8+ characters)"
              value={newPassword}
              onChange={(v) => { setNewPassword(v); setPwErrors(p => ({ ...p, new: undefined })); }}
              required
              error={pwErrors.new}
            />
            <PasswordInput
              label="Confirm new password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(v) => { setConfirmPassword(v); setPwErrors(p => ({ ...p, confirm: undefined })); }}
              required
              error={pwErrors.confirm}
            />
          </div>

          {passwordMsg && (
            <Alert tone={passwordMsg.type} className={alertSpaced}>
              {passwordMsg.text}
            </Alert>
          )}

          <div className={actionsRight}>
            <button
              type="button"
              disabled={savingPassword}
              onClick={handleChangePassword}
              className={btn({ tone: "primary" })}
            >
              {savingPassword ? <Spinner size={16} className={spinnerWhite} /> : "Update password"}
            </button>
          </div>
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
            <div className={sessionsLoadingWrap}>
              <Spinner size={24} className={spinnerPrimary} />
            </div>
          ) : sessions.length === 0 ? (
            <p className={sessionsEmpty}>No active sessions found.</p>
          ) : (
            <div>
              {sessions.map((s, i) => (
                <React.Fragment key={s.id}>
                  {i > 0 && <div className={sessionDivider} />}
                  <div className={sessionRow}>
                    <div className={sessionIcon}>
                      {guessDevice(s.name) === "desktop" ? (
                        <Monitor size={18} />
                      ) : (
                        <Smartphone size={18} />
                      )}
                    </div>
                    <div className={sessionBody}>
                      <div className={sessionNameRow}>
                        <p className={sessionName}>{displaySessionName(s.name)}</p>
                        {s.current && <StatusChip label="This device" variant="success" />}
                      </div>
                      <p className={sessionMeta}>
                        {(() => {
                          const rel = formatSessionTime(s.last_used_at || s.created_at);
                          return rel === "Active now"
                            ? rel
                            : `Last active ${rel.charAt(0).toLowerCase()}${rel.slice(1)}`;
                        })()}
                      </p>
                    </div>
                    {!s.current && (
                      <button
                        type="button"
                        onClick={() => handleRevokeSession(s.id)}
                        className={btn({ tone: "secondary" })}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}

          {sessions.length > 1 && (
            <div className={signOutRow}>
              <button
                type="button"
                disabled={revokingOther}
                onClick={handleRevokeOther}
                className={btn({ tone: "ghostDanger" })}
              >
                {revokingOther ? (
                  <Spinner size={14} className={spinnerDanger} />
                ) : (
                  "Sign out of all other sessions"
                )}
              </button>
            </div>
          )}
        </Section>

        {/* 7. Danger zone */}
        <div className={dangerBox}>
          <div className={flexOne}>
            <p className={dangerTitle}>Deactivate account</p>
            <p className={dangerText}>
              Your profile will be hidden and all active orders must be completed first. This action
              can be reversed within 30 days.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDeactivateOpen(true)}
            className={btn({ tone: "dangerOutline" })}
          >
            Deactivate account
          </button>
        </div>
      </div>

      {/* Deactivate confirmation dialog */}
      <BareModal
        open={deactivateOpen}
        onOpenChange={(open) => { if (!open) setDeactivateOpen(false); }}
        maxW="436px"
        className={dialogPaper}
      >
        <div className={dialogContent}>
          <p className={dialogTitle}>Deactivate your account?</p>
          <p className={dialogDesc}>
            Your profile will be hidden from clients and you&apos;ll be signed out everywhere. You
            can reactivate within 30 days by signing back in.
          </p>
        </div>
        <div className={dialogActionsTight}>
          <button type="button" onClick={() => setDeactivateOpen(false)} className={btn({ tone: "ghost" })}>
            Cancel
          </button>
          <button type="button" className={btn({ tone: "dangerSolid" })}>
            Deactivate
          </button>
        </div>
      </BareModal>
    </div>
  );
}
