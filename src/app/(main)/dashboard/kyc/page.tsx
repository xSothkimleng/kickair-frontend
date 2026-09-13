"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "styled-system/css";
import { Spinner } from "@/components/ds";
import { useAuth } from "@/components/context/AuthContext";
import { api } from "@/lib/api";
import { IdentityVerification } from "@/types/user";
import DashboardHeader from "@/components/layout/dashboard/DashboardHeader";
import KycWizard from "@/components/kyc/KycWizard";
import { KycApprovedView, KycPendingView, KycRejectedView } from "@/components/kyc/KycStatusViews";

const DOC_LABEL: Record<string, string> = {
  national_id: "National ID",
  passport: "Passport",
  drivers_license: "Driver's License",
};

const pageCss = css({ minH: "100vh", bg: "#F5F5F7" });
// Page container: 600px cap, 16px gutters that grow to 24px at the
// sm breakpoint, centred, border-box (preflight is off, so it must be explicit).
const containerCss = css({ w: "100%", boxSizing: "border-box", mx: "auto", maxW: "600px", px: { base: "16px", sm: "24px" }, py: "32px" });
const loadingCss = css({ display: "flex", justifyContent: "center", py: "64px" });
const spinnerCss = css({ color: "accent" });

export default function KycPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [kyc, setKyc] = useState<IdentityVerification | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [resubmitting, setResubmitting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.getKycStatus();
      setKyc(data);
      if (data?.status === "approved") await refreshUser();
    } catch {
      setKyc(null);
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSubmitted = () => {
    setResubmitting(false);
    setLoading(true);
    fetchStatus();
  };

  const goToDashboard = () => router.push(user?.is_freelancer ? "/dashboard/freelancer" : "/dashboard/client");

  const isApproved = user?.is_verified_id;
  const status = kyc?.status;

  let body: React.ReactNode;
  if (loading) {
    body = (
      <div className={loadingCss}>
        <Spinner size={40} className={spinnerCss} />
      </div>
    );
  } else if (isApproved) {
    body = <KycApprovedView onDone={goToDashboard} />;
  } else if (status === "pending") {
    body = <KycPendingView docTypeLabel={kyc?.document_type ? DOC_LABEL[kyc.document_type] : null} submittedAt={kyc?.submitted_at ?? null} onDone={goToDashboard} />;
  } else if (status === "rejected" && !resubmitting) {
    body = <KycRejectedView reason={kyc?.admin_note ?? null} onResubmit={() => setResubmitting(true)} />;
  } else {
    body = <KycWizard rejection={null} onSubmitted={handleSubmitted} />;
  }

  return (
    <div className={pageCss}>
      <DashboardHeader title="Identity Verification" description="Verify your identity to unlock all platform features" />
      <div className={containerCss}>
        {body}
      </div>
    </div>
  );
}
