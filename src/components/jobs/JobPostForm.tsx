"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Box, Paper, Typography, Button, Stack, Grid, IconButton, CircularProgress, Alert } from "@mui/material";
import { ChevronLeftOutlined, CloudUploadOutlined, CloseOutlined, InsertDriveFileOutlined, ImageOutlined, RestoreOutlined } from "@mui/icons-material";
import { api } from "@/lib/api";
import { JobPost, CreateJobPostRequest } from "@/types/job";
import { ServiceCategory } from "@/types/service";
import { TemporaryUpload } from "@/types/service";
import { Expertise } from "@/types/user";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { TextInput, MultiSelectInput, DatePicker } from "@/components/ui/inputs";
import CategoryPicker, { CategoryValue } from "@/components/category/CategoryPicker";
import { useFormRecovery } from "@/hooks/useFormRecovery";

const FILE_LIMITS = {
  image: { extensions: ["jpg", "jpeg", "png", "gif", "webp"], maxSizeMB: 5 },
  pdf: { extensions: ["pdf"], maxSizeMB: 10 },
};

const ACCEPTED_EXTENSIONS = [
  ...FILE_LIMITS.image.extensions,
  ...FILE_LIMITS.pdf.extensions,
];

const MAX_FILES = 10;

interface JobPostFormProps {
  job?: JobPost | null;
  onBack: () => void;
  onSaved: (job: JobPost) => void;
}

const parseYmd = (s: string): Date | null => {
  if (!s) return null;
  // Accept both "YYYY-MM-DD" and full ISO timestamps ("YYYY-MM-DDT…") from the API.
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
};
const toYmd = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function JobPostForm({ job, onBack, onSaved }: JobPostFormProps) {
  const isEditing = !!job;

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [refLoading, setRefLoading] = useState(true);

  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [tempUploads, setTempUploads] = useState<TemporaryUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [title, setTitle] = useState(job?.title ?? "");
  const [category, setCategory] = useState<CategoryValue>({
    categoryId: job?.category?.id ?? null,
    requestedCategory: job?.requested_category ?? null,
    requestedParentId: job?.requested_parent_id ?? null,
  });
  const [description, setDescription] = useState(job?.description ?? "");
  const [budgetMin, setBudgetMin] = useState(job?.budget_min ?? "");
  const [budgetMax, setBudgetMax] = useState(job?.budget_max ?? "");
  const [deadline, setDeadline] = useState(job?.deadline ?? "");
  const [maxProposals, setMaxProposals] = useState<string>(job?.max_proposals ? String(job.max_proposals) : "");
  const [selectedSkills, setSelectedSkills] = useState<Expertise[]>(
    job?.skills?.map(s => ({ id: s.id, expertise_name: s.expertise_name })) ?? [],
  );

  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (key: string) =>
    setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n; });

  // Local-storage recovery safety net (survives accidental tab close / crash). Mirrors
  // ServiceForm — snapshots the text fields; uploads are handled server-side separately.
  const formSnapshot = { title, category, description, budgetMin, budgetMax, deadline, maxProposals, selectedSkills };
  const recoveryKey = isEditing ? `kickair:job-recovery:edit:${job!.id}` : "kickair:job-recovery:new";
  const { recovered, clear: clearRecovery, discard: discardRecovery, dismiss: dismissRecovery } =
    useFormRecovery<typeof formSnapshot>(recoveryKey, formSnapshot);

  const restoreDraft = (data: typeof formSnapshot) => {
    setTitle(data.title);
    setCategory(data.category);
    setDescription(data.description);
    setBudgetMin(data.budgetMin);
    setBudgetMax(data.budgetMax);
    setDeadline(data.deadline);
    setMaxProposals(data.maxProposals);
    setSelectedSkills(data.selectedSkills);
    dismissRecovery();
  };

  const minDeadline = (() => { const t = new Date(); t.setDate(t.getDate() + 1); return t; })();

  // "Save as Draft" only makes sense before a post is live — offer it for new posts and
  // for ones still in the pre-publish states (draft / pending review / rejected).
  const canSaveDraft = !isEditing || ["draft", "pending_review", "rejected"].includes(job!.status);

  const primaryLabel =
    job?.status === "rejected" ? "Resubmit"
      : !isEditing ? "Post Job"
        : job?.status === "draft" ? "Publish Job"
          : "Save Changes";

  useEffect(() => {
    const load = async () => {
      try {
        setRefLoading(true);
        const [cats, exps] = await Promise.all([api.getCategoryTree(), api.getExpertises()]);
        setCategories(cats);
        setExpertises(exps);
      } catch {
        // non-fatal — form still usable without dropdowns populated
      } finally {
        setRefLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    // Need an upload token for both new posts and edits (to attach more files).
    api
      .getUploadToken()
      .then(setUploadToken)
      .catch(() => {});
  }, []);

  const getFileType = (fileName: string): "image" | "pdf" | null => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (!ext) return null;
    if (FILE_LIMITS.image.extensions.includes(ext)) return "image";
    if (FILE_LIMITS.pdf.extensions.includes(ext)) return "pdf";
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (!uploadToken) {
      setError("Upload token not ready yet, please try again.");
      return;
    }

    setUploading(true);
    setError(null);

    for (const file of files) {
      if (tempUploads.length >= MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed.`);
        break;
      }

      const fileType = getFileType(file.name);
      if (!fileType) {
        setError(`"${file.name}" is not supported. Accepted: ${ACCEPTED_EXTENSIONS.join(", ")}`);
        continue;
      }

      const maxSizeMB = FILE_LIMITS[fileType].maxSizeMB;
      if (file.size / 1024 / 1024 > maxSizeMB) {
        setError(`"${file.name}" exceeds ${maxSizeMB} MB limit.`);
        continue;
      }

      try {
        const resp = await api.uploadFormData("/api/temporary-uploads", file, {
          upload_token: uploadToken,
        });
        const newUpload: TemporaryUpload = resp.data;
        setTempUploads(prev => [...prev, newUpload]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    }

    setUploading(false);
  };

  const handleDeleteTempUpload = async (id: number) => {
    try {
      setDeletingId(id);
      setError(null);
      await api.delete(`/api/temporary-uploads/${id}`);
      setTempUploads(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  };

  // A draft can be saved incomplete — only the publish path ("Post Job"/"Publish Job")
  // enforces the required fields. Empty values are sent as null so the backend stores a
  // genuinely blank draft (rather than "0"/invalid) that the publish gate later checks.
  const handleSave = async (asDraft: boolean) => {
    if (!asDraft) {
      const errs: Record<string, string> = {};
      if (!title.trim()) errs.title = "Job title is required";
      if (!category.categoryId && !category.requestedCategory?.trim()) errs.category = "Please select or suggest a category";
      if (!description.trim() || description === "<p></p>") errs.description = "Description is required";
      if (!budgetMin) errs.budgetMin = "Required";
      if (!budgetMax) errs.budgetMax = "Required";
      if (budgetMin && budgetMax && Number(budgetMax) < Number(budgetMin)) errs.budgetMax = "Max must be ≥ min";
      if (!deadline) errs.deadline = "Deadline is required";

      setFieldErrors(errs);
      if (Object.keys(errs).length > 0) {
        setError("Please complete the required fields highlighted below before submitting.");
        return;
      }
    } else {
      setFieldErrors({});
    }

    if (asDraft) setSavingDraft(true);
    else setSubmitting(true);
    setError(null);
    try {
      const hasDescription = !!description.trim() && description !== "<p></p>";
      const payload: CreateJobPostRequest = {
        category_id: category.categoryId,
        ...(category.categoryId
          ? {}
          : { requested_category: category.requestedCategory, requested_parent_id: category.requestedParentId ?? undefined }),
        title: title.trim(),
        description: hasDescription ? description : null,
        budget_min: budgetMin === "" ? null : Number(budgetMin),
        budget_max: budgetMax === "" ? null : Number(budgetMax),
        deadline: deadline || null,
        ...(maxProposals ? { max_proposals: Number(maxProposals) } : {}),
        ...(selectedSkills.length ? { skill_ids: selectedSkills.map(s => s.id) } : {}),
        ...(uploadToken && tempUploads.length ? { upload_token: uploadToken } : {}),
        ...(asDraft ? { save_as_draft: true } : {}),
      };
      const saved = isEditing ? await api.updateJobPost(job!.id, payload) : await api.createJobPost(payload);
      clearRecovery();
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save job post.");
    } finally {
      setSubmitting(false);
      setSavingDraft(false);
    }
  };

  // Renders an image/pdf thumbnail card
  const renderPreview = (item: { file_url: string; file_type: string; file_name: string }) => {
    if (item.file_type === "pdf") {
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0,0,0,0.06)",
          }}>
          <InsertDriveFileOutlined sx={{ fontSize: 28, color: "rgba(0,0,0,0.4)" }} />
          <Typography sx={{ fontSize: 9, color: "rgba(0,0,0,0.5)", mt: 0.5, px: 1, textAlign: "center" }} noWrap>
            {item.file_name}
          </Typography>
        </Box>
      );
    }
    return (
      <Image
        unoptimized={true}
        src={item.file_url}
        alt={item.file_name}
        fill
        sizes="(max-width: 600px) 50vw, 25vw"
        style={{ objectFit: "cover" }}
      />
    );
  };

  return (
    <Box>
      {/* Back button */}
      <Button
        startIcon={<ChevronLeftOutlined />}
        onClick={onBack}
        sx={{ mb: 2, textTransform: "none", fontSize: 13, color: "rgba(0,0,0,0.6)", pl: 0 }}>
        Back to Jobs
      </Button>

      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 4 }}>
        <Typography sx={{ fontSize: 24, fontWeight: 600, mb: 0.5 }}>{isEditing ? "Edit Job Post" : "Post a Job"}</Typography>
        <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.5)", mb: 4 }}>
          {isEditing ? "Update your job details." : "Describe the work you need done and attract the right freelancers."}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: 13 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Unsaved-changes recovery banner (local-storage safety net) */}
        {recovered && (
          <Box
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(245, 158, 11, 0.35)",
              bgcolor: "rgba(245, 158, 11, 0.06)",
              p: 2,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
            }}>
            <RestoreOutlined sx={{ fontSize: 20, color: "#b45309" }} />
            <Typography sx={{ fontSize: 13, color: "#92400e", flex: 1, minWidth: 200 }}>
              You have unsaved changes from a previous session.
            </Typography>
            <Button
              onClick={() => restoreDraft(recovered.data)}
              sx={{ px: 2, height: 32, fontSize: 12, color: "white", bgcolor: "#b45309", borderRadius: 2, textTransform: "none", "&:hover": { bgcolor: "#92400e" } }}>
              Restore
            </Button>
            <Button
              onClick={discardRecovery}
              sx={{ px: 2, height: 32, fontSize: 12, color: "#92400e", bgcolor: "transparent", borderRadius: 2, textTransform: "none", "&:hover": { bgcolor: "rgba(245,158,11,0.12)" } }}>
              Discard
            </Button>
          </Box>
        )}

        <Stack spacing={3}>
          {/* Title */}
          <TextInput
            label="Job Title"
            value={title}
            onChange={v => { setTitle(v); clearFieldError("title"); }}
            placeholder="e.g., Build a modern e-commerce website"
            error={fieldErrors.title}
          />

          {/* Category */}
          <CategoryPicker
            tree={categories}
            loading={refLoading}
            value={category}
            onChange={v => { setCategory(v); clearFieldError("category"); }}
            error={fieldErrors.category}
          />

          {/* Description */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1, color: fieldErrors.description ? "#d32f2f" : "rgba(0,0,0,0.7)" }}>Description</Typography>
            <Box sx={fieldErrors.description ? { border: "1px solid #d32f2f", borderRadius: 2 } : undefined}>
              <RichTextEditor
                value={description}
                onChange={(v) => { setDescription(v); clearFieldError("description"); }}
                placeholder="Describe the project in detail — goals, features, requirements..."
                minHeight={180}
              />
            </Box>
            {fieldErrors.description && (
              <Typography sx={{ fontSize: 12, color: "#d32f2f", mt: 0.5, ml: 0.5 }}>{fieldErrors.description}</Typography>
            )}
          </Box>

          {/* Budget */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Budget Min (USD)"
                inputMode="decimal"
                value={budgetMin === "" ? "" : String(budgetMin)}
                onChange={v => { setBudgetMin(v); clearFieldError("budgetMin"); clearFieldError("budgetMax"); }}
                placeholder="500"
                error={fieldErrors.budgetMin}
                startIcon="$"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Budget Max (USD)"
                inputMode="decimal"
                value={budgetMax === "" ? "" : String(budgetMax)}
                onChange={v => { setBudgetMax(v); clearFieldError("budgetMax"); }}
                placeholder="2000"
                error={fieldErrors.budgetMax}
                startIcon="$"
              />
            </Grid>
          </Grid>

          {/* Deadline + Max Proposals */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Deadline"
                value={parseYmd(deadline)}
                onChange={d => { setDeadline(toYmd(d)); clearFieldError("deadline"); }}
                minDate={minDeadline}
                error={fieldErrors.deadline}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Max Proposals (optional)"
                inputMode="numeric"
                value={maxProposals}
                onChange={setMaxProposals}
                placeholder="50"
              />
            </Grid>
          </Grid>

          {/* Required Skills */}
          <MultiSelectInput
            label="Required Skills (optional)"
            value={selectedSkills.map(s => s.id)}
            onChange={ids => setSelectedSkills((ids as number[]).map(id => expertises.find(e => e.id === id)).filter(Boolean) as Expertise[])}
            options={expertises.map(e => ({ value: e.id, label: e.expertise_name }))}
            placeholder="Select skills"
            disabled={refLoading}
          />

          {/* Attachments — gallery grid */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1.5, color: "rgba(0,0,0,0.7)" }}>
              Attachments (optional)
            </Typography>

            <Grid container spacing={1.5}>
              {/* Existing media for editing — read-only thumbnails */}
              {isEditing && (job?.media ?? []).map(mediaItem => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`media-${mediaItem.id}`}>
                  <Box
                    sx={{
                      position: "relative",
                      aspectRatio: "1",
                      bgcolor: "rgba(0,0,0,0.05)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}>
                    {renderPreview(mediaItem)}
                  </Box>
                </Grid>
              ))}

              {/* Newly added uploads (new job or edit) */}
              {tempUploads.map(tempItem => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`temp-${tempItem.id}`}>
                  <Box
                    sx={{
                      position: "relative",
                      aspectRatio: "1",
                      bgcolor: "rgba(0,0,0,0.05)",
                      borderRadius: 3,
                      overflow: "hidden",
                      "&:hover .delete-btn": { opacity: 1 },
                    }}>
                    {renderPreview(tempItem)}

                    {/* Delete overlay */}
                    {deletingId === tempItem.id ? (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "rgba(0,0,0,0.3)",
                        }}>
                        <CircularProgress size={24} sx={{ color: "white" }} />
                      </Box>
                    ) : (
                      <IconButton
                        className="delete-btn"
                        onClick={() => handleDeleteTempUpload(tempItem.id)}
                        sx={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          p: 0.75,
                          bgcolor: "#ef4444",
                          color: "white",
                          opacity: 0,
                          transition: "opacity 0.2s",
                          "&:hover": { bgcolor: "#dc2626" },
                        }}>
                        <CloseOutlined sx={{ fontSize: 12 }} />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
              ))}

              {/* Upload button */}
              {tempUploads.length < MAX_FILES && (
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <Button
                    component="label"
                    disabled={uploading}
                    sx={{
                      aspectRatio: "1",
                      width: "100%",
                      bgcolor: "rgba(0,0,0,0.04)",
                      borderRadius: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textTransform: "none",
                      border: "2px dashed rgba(0,0,0,0.15)",
                      "&:hover": { bgcolor: "rgba(0,113,227,0.04)", borderColor: "#0071e3" },
                      "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.04)" },
                    }}>
                    {uploading ? (
                      <CircularProgress size={22} sx={{ color: "rgba(0,0,0,0.4)" }} />
                    ) : (
                      <>
                        <CloudUploadOutlined sx={{ fontSize: 22, color: "rgba(0,0,0,0.4)", mb: 0.75 }} />
                        <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)" }}>Upload</Typography>
                        <Typography sx={{ fontSize: 10, color: "rgba(0,0,0,0.4)", mt: 0.25 }}>Image or PDF</Typography>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      hidden
                      accept={ACCEPTED_EXTENSIONS.map(ext => `.${ext}`).join(",")}
                      onChange={handleFileSelect}
                    />
                  </Button>
                </Grid>
              )}
            </Grid>

            {/* File type hints + counter */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <ImageOutlined sx={{ fontSize: 13, color: "rgba(0,0,0,0.4)" }} />
                <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>Images (5MB)</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <InsertDriveFileOutlined sx={{ fontSize: 13, color: "rgba(0,0,0,0.4)" }} />
                <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>PDFs (10MB)</Typography>
              </Box>
              <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.4)", ml: "auto" }}>
                {tempUploads.length}/{MAX_FILES} new file{tempUploads.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>

          {/* Submit */}
          <Stack direction="row" spacing={2} pt={1}>
            <Button
              variant="outlined"
              onClick={onBack}
              disabled={submitting || savingDraft}
              sx={{
                flex: 1,
                fontSize: 13,
                textTransform: "none",
                borderRadius: 10,
                borderColor: "rgba(0,0,0,0.2)",
                color: "black",
                "&:hover": { borderColor: "rgba(0,0,0,0.4)", bgcolor: "transparent" },
              }}>
              Cancel
            </Button>
            {canSaveDraft && (
              <Button
                onClick={() => handleSave(true)}
                disabled={submitting || savingDraft}
                sx={{
                  flex: 1,
                  fontSize: 13,
                  textTransform: "none",
                  borderRadius: 10,
                  color: "black",
                  bgcolor: "rgba(0,0,0,0.05)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
                }}>
                {savingDraft ? <CircularProgress size={18} sx={{ color: "rgba(0,0,0,0.5)" }} /> : "Save as Draft"}
              </Button>
            )}
            <Button
              variant="contained"
              disabled={submitting || savingDraft}
              onClick={() => handleSave(false)}
              sx={{
                flex: 1,
                fontSize: 13,
                textTransform: "none",
                borderRadius: 10,
                bgcolor: "#0071e3",
                "&:hover": { bgcolor: "#0077ED" },
              }}>
              {submitting ? <CircularProgress size={18} sx={{ color: "white" }} /> : primaryLabel}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
