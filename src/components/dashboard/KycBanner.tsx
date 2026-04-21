"use client";
import { Alert, Button } from "@mui/material";
import { BadgeOutlined, CheckCircleOutline, HourglassEmptyOutlined, WarningAmberOutlined } from "@mui/icons-material";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";

export default function KycBanner() {
  const { user } = useAuth();

  if (!user) return null;

  // Already approved — show nothing (or a subtle confirmed badge)
  if (user.is_verified_id) {
    return null;
  }

  // Pending review
  if (user.kyc_status === "pending") {
    return (
      <Alert
        icon={<HourglassEmptyOutlined />}
        severity="info"
        sx={{ mb: 3, borderRadius: 2 }}
      >
        Your identity documents are under review. Some actions are restricted until approval.
      </Alert>
    );
  }

  // Rejected — urge resubmission
  if (user.kyc_status === "rejected") {
    return (
      <Alert
        icon={<WarningAmberOutlined />}
        severity="error"
        sx={{ mb: 3, borderRadius: 2 }}
        action={
          <Link href="/dashboard/kyc" style={{ textDecoration: "none" }}>
            <Button color="inherit" size="small" sx={{ textTransform: "none", fontWeight: 600 }}>
              Resubmit
            </Button>
          </Link>
        }
      >
        Your KYC was rejected. Please re-upload your documents to unlock all features.
      </Alert>
    );
  }

  // Not submitted yet
  return (
    <Alert
      icon={<BadgeOutlined />}
      severity="warning"
      sx={{ mb: 3, borderRadius: 2 }}
      action={
        <Link href="/dashboard/kyc" style={{ textDecoration: "none" }}>
          <Button color="inherit" size="small" sx={{ textTransform: "none", fontWeight: 600 }}>
            Verify Now
          </Button>
        </Link>
      }
    >
      Identity verification is required to offer services, deliver orders, or post jobs. Complete KYC to unlock these features.
    </Alert>
  );
}
