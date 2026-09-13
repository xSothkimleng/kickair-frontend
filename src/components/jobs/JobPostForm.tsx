"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, CloudUpload, X, FileText, Image as ImageIcon, History } from "lucide-react";
import { css, cva, cx } from "styled-system/css";
import { Alert, Spinner } from "@/components/ds";
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

/* ── static styles ── */
/* MUI text `Button` metrics with `pl: 0`. */
const backBtn = css({
  display: "inline-flex", alignItems: "center", gap: "8px",
  m: 0, mb: "16px", p: "6px 8px 6px 0", border: "none", bg: "transparent",
  color: "ink2", fontFamily: "inherit", fontSize: "13px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "color .25s",
  _hover: { color: "ink" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { flexShrink: 0 },
});
const paper = css({
  bg: "surface",
  borderRadius: "card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  p: "32px",
});
/* globals.css zeroes `p` margins outside any layer, so the old Typography `mb` never applied. */
const formTitle = css({ lineHeight: 1.5, fontSize: "24px", fontWeight: 600 });
const formSub = css({ lineHeight: 1.5, fontSize: "13px", color: "rgba(0,0,0,0.5)" });
const alertBox = css({ mb: "24px", borderRadius: "8px", fontSize: "13px" });

const banner = css({
  borderRadius: "cardSm",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(245, 158, 11, 0.35)",
  bg: "rgba(245, 158, 11, 0.06)",
  p: "16px",
  mb: "24px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
});
const bannerIcon = css({ color: "pendingText", flexShrink: 0 });
const bannerText = css({ lineHeight: 1.5, fontSize: "13px", color: "#92400e", flex: 1, minW: "200px" });
const smallBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  boxSizing: "border-box", m: 0, px: "16px", h: "32px", minW: "64px",
  border: "none", borderRadius: "8px",
  fontFamily: "inherit", fontSize: "12px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "background-color .25s, color .25s",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const amberBtn = css({ bg: "pendingText", color: "white", _hover: { bg: "#92400e" } });
const amberGhostBtn = css({ bg: "transparent", color: "#92400e", _hover: { bg: "rgba(245,158,11,0.12)" } });

const stack = css({ display: "flex", flexDirection: "column", gap: "24px" });
const fieldLabel = cva({
  base: { lineHeight: 1.5, fontSize: "13px", fontWeight: 500 },
  variants: { invalid: { true: { color: "#d32f2f" }, false: { color: "rgba(0,0,0,0.7)" } } },
});
const editorError = css({ borderWidth: "1px", borderStyle: "solid", borderColor: "#d32f2f", borderRadius: "8px" });
const helperError = css({ lineHeight: 1.5, fontSize: "12px", color: "#d32f2f" });
const twoCol = css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "1fr 1fr" }, gap: "16px" });

const mediaGrid = css({
  display: "grid",
  gridTemplateColumns: { base: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" },
  gap: "12px",
});
const thumb = css({
  position: "relative",
  aspectRatio: "1",
  bg: "rgba(0,0,0,0.05)",
  borderRadius: "cardSm",
  overflow: "hidden",
  "&:hover .delete-btn": { opacity: 1 },
});
const pdfPreview = css({
  w: "100%", h: "100%",
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  bg: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.4)",
});
const pdfName = css({ lineHeight: 1.5, fontSize: "9px", color: "rgba(0,0,0,0.5)", px: "8px", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxW: "100%" });
const deleteOverlay = css({ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bg: "rgba(0,0,0,0.3)" });
const deleteBtn = css({
  position: "absolute", top: "6px", right: "6px",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  p: "6px", m: 0, border: "none", borderRadius: "50%",
  bg: "#ef4444", color: "white", cursor: "pointer", fontFamily: "inherit",
  opacity: 0, transition: "opacity 0.2s, background-color .2s",
  _hover: { bg: "#dc2626" },
  _focusVisible: { opacity: 1, outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block" },
});
const uploadBox = css({
  aspectRatio: "1",
  w: "100%",
  boxSizing: "border-box",
  bg: "rgba(0,0,0,0.04)",
  borderRadius: "cardSm",
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  borderWidth: "2px", borderStyle: "dashed", borderColor: "rgba(0,0,0,0.15)",
  cursor: "pointer", fontFamily: "inherit",
  transition: "background-color .25s, border-color .25s",
  _hover: { bg: "rgba(0,113,227,0.04)", borderColor: "accent" },
  "&[data-disabled]": { pointerEvents: "none", bg: "rgba(0,0,0,0.04)" },
});
const uploadIcon = css({ color: "rgba(0,0,0,0.4)", mb: "6px" });
const uploadText = css({ lineHeight: 1.5, fontSize: "11px", color: "rgba(0,0,0,0.6)" });
const uploadHint = css({ lineHeight: 1.5, fontSize: "10px", color: "rgba(0,0,0,0.4)" });
const hintRow = css({ display: "flex", alignItems: "center", gap: "16px", mt: "12px" });
const hintItem = css({ display: "flex", alignItems: "center", gap: "4px", color: "rgba(0,0,0,0.4)" });
const hintText = css({ lineHeight: 1.5, fontSize: "11px", color: "rgba(0,0,0,0.5)" });
const hintCount = css({ lineHeight: 1.5, fontSize: "11px", color: "rgba(0,0,0,0.4)" });

const actions = css({ display: "flex", gap: "16px", pt: "8px" });
const bigBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  boxSizing: "border-box", m: 0, flex: 1, minW: "64px", borderRadius: "40px",
  fontFamily: "inherit", fontSize: "13px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "background-color .25s, border-color .25s, color .25s, box-shadow .25s",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  _disabled: { pointerEvents: "none" },
});
const cancelBtn = css({
  p: "5px 15px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0,0,0,0.2)",
  bg: "transparent", color: "ink",
  _hover: { borderColor: "rgba(0,0,0,0.4)", bg: "transparent" },
  _disabled: { color: "rgba(0, 0, 0, 0.26)", borderColor: "rgba(0, 0, 0, 0.12)" },
});
const draftBtn = css({
  p: "6px 16px", border: "none",
  bg: "rgba(0,0,0,0.05)", color: "ink",
  _hover: { bg: "rgba(0,0,0,0.1)" },
  _disabled: { color: "rgba(0, 0, 0, 0.26)" },
});
const primaryBtn = css({
  p: "6px 16px", border: "none",
  bg: "accent", color: "white",
  boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
  _hover: { bg: "accentHover" },
  _disabled: { bg: "rgba(0, 0, 0, 0.12)", color: "rgba(0, 0, 0, 0.26)", boxShadow: "none" },
});

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

  // Bring the first invalid field into view (in page order) so the user doesn't
  // have to hunt for the red field on a long form. Mirrors the service form.
  const ERROR_ANCHORS: Array<[key: string, anchorId: string]> = [
    ["title", "job-field-title"],
    ["category", "job-field-category"],
    ["description", "job-field-description"],
    ["budgetMin", "job-field-budget-min"],
    ["budgetMax", "job-field-budget-max"],
    ["deadline", "job-field-deadline"],
  ];

  const scrollToFirstError = (errs: Record<string, string>) => {
    for (const [key, anchorId] of ERROR_ANCHORS) {
      if (errs[key]) {
        document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
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
        scrollToFirstError(errs);
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
        <div className={pdfPreview}>
          <FileText size={28} />
          <p className={pdfName}>
            {item.file_name}
          </p>
        </div>
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
    <div>
      {/* Back button */}
      <button type="button" onClick={onBack} className={backBtn}>
        <ChevronLeft size={24} />
        Back to Jobs
      </button>

      <div className={paper}>
        <p className={formTitle}>{isEditing ? "Edit Job Post" : "Post a Job"}</p>
        <p className={formSub}>
          {isEditing ? "Update your job details." : "Describe the work you need done and attract the right freelancers."}
        </p>

        {error && (
          <Alert tone="error" className={alertBox} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Unsaved-changes recovery banner (local-storage safety net) */}
        {recovered && (
          <div className={banner}>
            <History size={20} className={bannerIcon} />
            <p className={bannerText}>
              You have unsaved changes from a previous session.
            </p>
            <button type="button" onClick={() => restoreDraft(recovered.data)} className={cx(smallBtn, amberBtn)}>
              Restore
            </button>
            <button type="button" onClick={discardRecovery} className={cx(smallBtn, amberGhostBtn)}>
              Discard
            </button>
          </div>
        )}

        <div className={stack}>
          {/* Title */}
          <div id="job-field-title">
            <TextInput
              label="Job Title"
              value={title}
              onChange={v => { setTitle(v); clearFieldError("title"); }}
              placeholder="e.g., Build a modern e-commerce website"
              error={fieldErrors.title}
            />
          </div>

          {/* Category */}
          <div id="job-field-category">
            <CategoryPicker
              tree={categories}
              loading={refLoading}
              value={category}
              onChange={v => { setCategory(v); clearFieldError("category"); }}
              error={fieldErrors.category}
            />
          </div>

          {/* Description */}
          <div id="job-field-description">
            <p className={fieldLabel({ invalid: !!fieldErrors.description })}>Description</p>
            <div className={fieldErrors.description ? editorError : undefined}>
              <RichTextEditor
                value={description}
                onChange={(v) => { setDescription(v); clearFieldError("description"); }}
                placeholder="Describe the project in detail — goals, features, requirements..."
                minHeight={180}
              />
            </div>
            {fieldErrors.description && (
              <p className={helperError}>{fieldErrors.description}</p>
            )}
          </div>

          {/* Budget */}
          <div className={twoCol}>
            <div id="job-field-budget-min">
              <TextInput
                label="Budget Min (USD)"
                inputMode="decimal"
                value={budgetMin === "" ? "" : String(budgetMin)}
                onChange={v => { setBudgetMin(v); clearFieldError("budgetMin"); clearFieldError("budgetMax"); }}
                placeholder="500"
                error={fieldErrors.budgetMin}
                startIcon="$"
              />
            </div>
            <div id="job-field-budget-max">
              <TextInput
                label="Budget Max (USD)"
                inputMode="decimal"
                value={budgetMax === "" ? "" : String(budgetMax)}
                onChange={v => { setBudgetMax(v); clearFieldError("budgetMax"); }}
                placeholder="2000"
                error={fieldErrors.budgetMax}
                startIcon="$"
              />
            </div>
          </div>

          {/* Deadline + Max Proposals */}
          <div className={twoCol}>
            <div id="job-field-deadline">
              <DatePicker
                label="Deadline"
                value={parseYmd(deadline)}
                onChange={d => { setDeadline(toYmd(d)); clearFieldError("deadline"); }}
                minDate={minDeadline}
                error={fieldErrors.deadline}
              />
            </div>
            <div>
              <TextInput
                label="Max Proposals (optional)"
                inputMode="numeric"
                value={maxProposals}
                onChange={setMaxProposals}
                placeholder="50"
              />
            </div>
          </div>

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
          <div>
            <p className={fieldLabel({ invalid: false })}>
              Attachments (optional)
            </p>

            <div className={mediaGrid}>
              {/* Existing media for editing — read-only thumbnails */}
              {isEditing && (job?.media ?? []).map(mediaItem => (
                <div className={thumb} key={`media-${mediaItem.id}`}>
                  {renderPreview(mediaItem)}
                </div>
              ))}

              {/* Newly added uploads (new job or edit) */}
              {tempUploads.map(tempItem => (
                <div className={thumb} key={`temp-${tempItem.id}`}>
                  {renderPreview(tempItem)}

                  {/* Delete overlay */}
                  {deletingId === tempItem.id ? (
                    <div className={deleteOverlay}>
                      <Spinner size={24} className={css({ color: "white" })} />
                    </div>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Remove ${tempItem.file_name}`}
                      className={cx("delete-btn", deleteBtn)}
                      onClick={() => handleDeleteTempUpload(tempItem.id)}>
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}

              {/* Upload button */}
              {tempUploads.length < MAX_FILES && (
                <label className={uploadBox} data-disabled={uploading ? "" : undefined}>
                  {uploading ? (
                    <Spinner size={22} className={css({ color: "rgba(0,0,0,0.4)" })} />
                  ) : (
                    <>
                      <CloudUpload size={22} className={uploadIcon} />
                      <span className={uploadText}>Upload</span>
                      <span className={uploadHint}>Image or PDF</span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    hidden
                    accept={ACCEPTED_EXTENSIONS.map(ext => `.${ext}`).join(",")}
                    onChange={handleFileSelect}
                  />
                </label>
              )}
            </div>

            {/* File type hints + counter */}
            <div className={hintRow}>
              <div className={hintItem}>
                <ImageIcon size={13} />
                <span className={hintText}>Images (5MB)</span>
              </div>
              <div className={hintItem}>
                <FileText size={13} />
                <span className={hintText}>PDFs (10MB)</span>
              </div>
              <p className={hintCount}>
                {tempUploads.length}/{MAX_FILES} new file{tempUploads.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className={actions}>
            <button
              type="button"
              onClick={onBack}
              disabled={submitting || savingDraft}
              className={cx(bigBtn, cancelBtn)}>
              Cancel
            </button>
            {canSaveDraft && (
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={submitting || savingDraft}
                className={cx(bigBtn, draftBtn)}>
                {savingDraft ? <Spinner size={18} className={css({ color: "rgba(0,0,0,0.5)" })} /> : "Save as Draft"}
              </button>
            )}
            <button
              type="button"
              disabled={submitting || savingDraft}
              onClick={() => handleSave(false)}
              className={cx(bigBtn, primaryBtn)}>
              {submitting ? <Spinner size={18} className={css({ color: "white" })} /> : primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
