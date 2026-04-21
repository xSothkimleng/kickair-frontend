"use client";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import {
  BadgeOutlined,
  CheckCircleOutline,
  HourglassEmptyOutlined,
  UploadFileOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { useAuth } from "@/components/context/AuthContext";
import { api as apiClient } from "@/lib/api";
import { IdentityVerification } from "@/types/user";
import DashboardHeader from "@/components/layout/dashboard/DashboardHeader";

export default function KycPage() {
  const { user } = useAuth();
  const [kyc, setKyc] = useState<IdentityVerification | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiClient
      .getKycStatus()
      .then(setKyc)
      .catch(() => setKyc(null))
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (
    file: File | null,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void
  ) => {
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!idFile || !selfieFile) {
      setError("Please upload both your ID document and selfie.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const result = await apiClient.submitKyc(idFile, selfieFile);
      setKyc(result);
      setSuccess("Documents submitted successfully. An admin will review your application shortly.");
      setIdFile(null);
      setSelfieFile(null);
      setIdPreview(null);
      setSelfiePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canResubmit = kyc?.status === "rejected";
  const isPending = kyc?.status === "pending";
  const isApproved = user?.is_verified_id;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      <DashboardHeader title="Identity Verification" description="Verify your identity to unlock all platform features" />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Current status banner */}
            {isApproved && (
              <Alert
                icon={<CheckCircleOutline />}
                severity="success"
                sx={{ mb: 3, borderRadius: 2 }}
              >
                Your identity has been verified. You have full access to the platform.
              </Alert>
            )}
            {isPending && !isApproved && (
              <Alert
                icon={<HourglassEmptyOutlined />}
                severity="info"
                sx={{ mb: 3, borderRadius: 2 }}
              >
                Your documents are under review. We&apos;ll notify you once the review is complete.
              </Alert>
            )}
            {canResubmit && (
              <Alert
                icon={<WarningAmberOutlined />}
                severity="error"
                sx={{ mb: 3, borderRadius: 2 }}
              >
                <strong>Verification rejected.</strong>{" "}
                {kyc.admin_note && <>Reason: {kyc.admin_note}. </>}
                Please re-upload clearer documents.
              </Alert>
            )}

            <Paper elevation={0} sx={{ borderRadius: 4, border: 1, borderColor: "divider", p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <BadgeOutlined sx={{ fontSize: 28, color: "primary.main" }} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Identity Verification (KYC)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload a government-issued ID and a selfie holding it
                  </Typography>
                </Box>
                {kyc && (
                  <Chip
                    label={kyc.status}
                    size="small"
                    color={kyc.status === "approved" ? "success" : kyc.status === "pending" ? "warning" : "error"}
                    sx={{ ml: "auto", textTransform: "capitalize" }}
                  />
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Requirements */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                Accepted documents: <strong>National ID, Passport, or Driver&apos;s License</strong>.
                Photos must be clear, unedited, and show all four corners of the document. The selfie must show
                your face clearly while holding the ID.
              </Typography>

              {(!isPending || canResubmit) && !isApproved && (
                <>
                  {success && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                      {success}
                    </Alert>
                  )}
                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {/* ID Document upload */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      1. ID Document (front)
                    </Typography>
                    <input
                      ref={idInputRef}
                      type="file"
                      accept="image/jpg,image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      onChange={e => handleFileChange(e.target.files?.[0] ?? null, setIdFile, setIdPreview)}
                    />
                    {idPreview ? (
                      <Box sx={{ position: "relative" }}>
                        <Box
                          component="img"
                          src={idPreview}
                          alt="ID preview"
                          sx={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 2, border: 1, borderColor: "divider" }}
                        />
                        <Button
                          size="small"
                          onClick={() => { setIdFile(null); setIdPreview(null); if (idInputRef.current) idInputRef.current.value = ""; }}
                          sx={{ mt: 1, textTransform: "none", color: "error.main" }}
                        >
                          Remove
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={<UploadFileOutlined />}
                        onClick={() => idInputRef.current?.click()}
                        fullWidth
                        sx={{ height: 80, borderRadius: 2, borderStyle: "dashed", textTransform: "none" }}
                      >
                        Click to upload ID document
                      </Button>
                    )}
                  </Box>

                  {/* Selfie upload */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      2. Selfie holding your ID
                    </Typography>
                    <input
                      ref={selfieInputRef}
                      type="file"
                      accept="image/jpg,image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      onChange={e => handleFileChange(e.target.files?.[0] ?? null, setSelfieFile, setSelfiePreview)}
                    />
                    {selfiePreview ? (
                      <Box sx={{ position: "relative" }}>
                        <Box
                          component="img"
                          src={selfiePreview}
                          alt="Selfie preview"
                          sx={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 2, border: 1, borderColor: "divider" }}
                        />
                        <Button
                          size="small"
                          onClick={() => { setSelfieFile(null); setSelfiePreview(null); if (selfieInputRef.current) selfieInputRef.current.value = ""; }}
                          sx={{ mt: 1, textTransform: "none", color: "error.main" }}
                        >
                          Remove
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={<UploadFileOutlined />}
                        onClick={() => selfieInputRef.current?.click()}
                        fullWidth
                        sx={{ height: 80, borderRadius: 2, borderStyle: "dashed", textTransform: "none" }}
                      >
                        Click to upload selfie
                      </Button>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    disabled={submitting || !idFile || !selfieFile}
                    onClick={handleSubmit}
                    sx={{ height: 48, borderRadius: 3, textTransform: "none", fontWeight: 500, color: "white" }}
                  >
                    {submitting ? <CircularProgress size={20} color="inherit" /> : canResubmit ? "Resubmit Documents" : "Submit for Verification"}
                  </Button>
                </>
              )}
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
}
