"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Stack,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ChevronLeftOutlined,
  AttachMoney as DollarIcon,
  CloudUploadOutlined,
  CloseOutlined,
  InsertDriveFileOutlined,
  ImageOutlined,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { JobPost, CreateJobPostRequest } from "@/types/job";
import { ServiceCategory } from "@/types/service";
import { TemporaryUpload } from "@/types/service";
import { Expertise } from "@/types/user";
import RichTextEditor from "@/components/ui/RichTextEditor";

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

const today = new Date().toISOString().split("T")[0];

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
  const [categoryId, setCategoryId] = useState<number | "">(job?.category?.id ?? "");
  const [description, setDescription] = useState(job?.description ?? "");
  const [budgetMin, setBudgetMin] = useState(job?.budget_min ?? "");
  const [budgetMax, setBudgetMax] = useState(job?.budget_max ?? "");
  const [deadline, setDeadline] = useState(job?.deadline ?? "");
  const [maxProposals, setMaxProposals] = useState<string>(job?.max_proposals ? String(job.max_proposals) : "");
  const [selectedSkills, setSelectedSkills] = useState<Expertise[]>(
    job?.skills?.map(s => ({ id: s.id, expertise_name: s.expertise_name })) ?? [],
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setRefLoading(true);
        const [cats, exps] = await Promise.all([api.getServiceCategories(), api.getExpertises()]);
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
    if (isEditing) return;
    api
      .getUploadToken()
      .then(setUploadToken)
      .catch(() => {});
  }, [isEditing]);

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

  const handleSubmit = async () => {
    if (!title.trim()) { setError("Title is required."); return; }
    if (!categoryId) { setError("Category is required."); return; }
    if (!description.trim()) { setError("Description is required."); return; }
    if (!budgetMin || !budgetMax) { setError("Budget range is required."); return; }
    if (Number(budgetMax) < Number(budgetMin)) { setError("Budget max must be ≥ budget min."); return; }
    if (!deadline) { setError("Deadline is required."); return; }

    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateJobPostRequest = {
        category_id: categoryId as number,
        title: title.trim(),
        description,
        budget_min: Number(budgetMin),
        budget_max: Number(budgetMax),
        deadline,
        ...(maxProposals ? { max_proposals: Number(maxProposals) } : {}),
        ...(selectedSkills.length ? { skill_ids: selectedSkills.map(s => s.id) } : {}),
        ...(uploadToken && tempUploads.length ? { upload_token: uploadToken } : {}),
      };
      const saved = isEditing ? await api.updateJobPost(job!.id, payload) : await api.createJobPost(payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save job post.");
    } finally {
      setSubmitting(false);
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

        <Stack spacing={3}>
          {/* Title */}
          <TextField
            label="Job Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Build a modern e-commerce website"
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
          />

          {/* Category */}
          <FormControl fullWidth disabled={refLoading}>
            <InputLabel sx={{ fontSize: 13 }}>Category</InputLabel>
            <Select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value as number)}
              label="Category"
              sx={{ borderRadius: 2, fontSize: 13 }}>
              <MenuItem value="">
                <em>Select a category</em>
              </MenuItem>
              {categories.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Description */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1, color: "rgba(0,0,0,0.7)" }}>Description</Typography>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Describe the project in detail — goals, features, requirements..."
              minHeight={180}
            />
          </Box>

          {/* Budget */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Budget Min (USD)"
                type="number"
                value={budgetMin}
                onChange={e => setBudgetMin(e.target.value)}
                placeholder="500"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DollarIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Budget Max (USD)"
                type="number"
                value={budgetMax}
                onChange={e => setBudgetMax(e.target.value)}
                placeholder="2000"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DollarIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
              />
            </Grid>
          </Grid>

          {/* Deadline + Max Proposals */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Deadline"
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                fullWidth
                inputProps={{ min: today }}
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Max Proposals (optional)"
                type="number"
                value={maxProposals}
                onChange={e => setMaxProposals(e.target.value)}
                placeholder="50"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
              />
            </Grid>
          </Grid>

          {/* Required Skills */}
          <Autocomplete
            multiple
            options={expertises}
            getOptionLabel={o => o.expertise_name}
            value={selectedSkills}
            onChange={(_, v) => setSelectedSkills(v)}
            loading={refLoading}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.expertise_name}
                  size="small"
                  {...getTagProps({ index })}
                  key={option.id}
                  sx={{ fontSize: 12, height: 26 }}
                />
              ))
            }
            renderInput={params => (
              <TextField
                {...params}
                label="Required Skills (optional)"
                placeholder="Search skills..."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
              />
            )}
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

              {/* Temp uploads for new job */}
              {!isEditing && tempUploads.map(tempItem => (
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

              {/* Upload button — new jobs only */}
              {!isEditing && tempUploads.length < MAX_FILES && (
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
              {!isEditing && (
                <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.4)", ml: "auto" }}>
                  {tempUploads.length}/{MAX_FILES} files
                </Typography>
              )}
            </Box>
          </Box>

          {/* Submit */}
          <Stack direction="row" spacing={2} pt={1}>
            <Button
              variant="outlined"
              onClick={onBack}
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
            <Button
              variant="contained"
              disabled={submitting}
              onClick={handleSubmit}
              sx={{
                flex: 1,
                fontSize: 13,
                textTransform: "none",
                borderRadius: 10,
                bgcolor: "#0071e3",
                "&:hover": { bgcolor: "#0077ED" },
              }}>
              {submitting ? <CircularProgress size={18} sx={{ color: "white" }} /> : isEditing ? "Save Changes" : "Post Job"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
