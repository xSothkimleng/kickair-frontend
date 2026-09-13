"use client";
import { AlertTriangle, Hourglass, IdCard } from "lucide-react";
import Link from "next/link";
import { css } from "styled-system/css";
import { Alert } from "@/components/ds";
import { useAuth } from "@/components/context/AuthContext";

const banner = css({ mb: "24px" });
const bannerIcon = css({ mt: "1px" });
// The "Resubmit" / "Verify Now" action: a small text button in the alert's ink.
const bannerAction = css({
  alignSelf: "center",
  flexShrink: 0,
  ml: "8px",
  px: "8px",
  py: "4px",
  borderRadius: "6px",
  textStyle: "ui",
  fontWeight: 600,
  whiteSpace: "nowrap",
  color: "inherit !important",
  textDecoration: "none",
  _hover: { bg: "rgba(0, 0, 0, 0.05)", textDecoration: "none" },
});

export default function KycBanner() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.is_verified_id) return null;

  // Pending review
  if (user.kyc_status === "pending") {
    return (
      <Alert tone="info" icon={<Hourglass size={18} className={bannerIcon} />} className={banner}>
        Your identity documents are under review. Some actions are restricted until approval.
      </Alert>
    );
  }

  // Rejected — urge resubmission
  if (user.kyc_status === "rejected") {
    return (
      <Alert
        tone="error"
        icon={<AlertTriangle size={18} className={bannerIcon} />}
        className={banner}
        action={<Link href="/dashboard/kyc" className={bannerAction}>Resubmit</Link>}>
        Your KYC was rejected. Please re-upload your documents to unlock all features.
      </Alert>
    );
  }

  // Not submitted yet
  return (
    <Alert
      tone="warning"
      icon={<IdCard size={18} className={bannerIcon} />}
      className={banner}
      action={<Link href="/dashboard/kyc" className={bannerAction}>Verify Now</Link>}>
      Identity verification is required to offer services, deliver orders, or post jobs. Complete KYC to unlock these features.
    </Alert>
  );
}
