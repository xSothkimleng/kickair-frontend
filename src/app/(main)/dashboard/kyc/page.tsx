"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Container } from "@mui/material";
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
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
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
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      <DashboardHeader title="Identity Verification" description="Verify your identity to unlock all platform features" />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        {body}
      </Container>
    </Box>
  );
}
