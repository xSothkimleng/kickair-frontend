"use client";

import { useState, useEffect, useRef } from "react";
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
import { Expertise } from "@/types/user";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  tempId?: number; // set after upload
}

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
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [uploading, setUploading] = useState(false);

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load reference data + generate upload token
  useEffect(() => {
    const load = async () => {
      try {
        setRefLoading(true);
        const [cats, exps] = await Promise.all([api.getServiceCategories(), api.getExpertises()]);

        console.log("Categories:", cats);
        console.log("Expertises:", exps);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (!uploadToken && !isEditing) {
      setError("Upload token not ready yet, please try again.");
      return;
    }

    setUploading(true);
    setError(null);
    for (const file of files) {
      // Validate
      const sizeMB = file.size / 1024 / 1024;
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const allowed = ["jpg", "jpeg", "png", "gif", "webp", "pdf"];
      if (!allowed.includes(ext)) {
        setError(`"${file.name}" is not a supported type (images or PDF only).`);
        continue;
      }
      if (sizeMB > 10) {
        setError(`"${file.name}" exceeds 10 MB limit.`);
        continue;
      }
      try {
        if (uploadToken) {
          const resp = await api.uploadFormData("/api/temporary-uploads", file, {
            upload_token: uploadToken,
          });
          setAttachedFiles(prev => [...prev, { name: file.name, size: file.size, type: file.type, tempId: resp.data?.id }]);
        } else {
          // editing existing job — direct media upload
          await api.uploadFormData(`/api/job-posts/${job!.id}/media`, file, {});
          setAttachedFiles(prev => [...prev, { name: file.name, size: file.size, type: file.type }]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!categoryId) {
      setError("Category is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!budgetMin || !budgetMax) {
      setError("Budget range is required.");
      return;
    }
    if (Number(budgetMax) < Number(budgetMin)) {
      setError("Budget max must be ≥ budget min.");
      return;
    }
    if (!deadline) {
      setError("Deadline is required.");
      return;
    }

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
        ...(uploadToken && attachedFiles.length ? { upload_token: uploadToken } : {}),
      };
      const saved = isEditing ? await api.updateJobPost(job!.id, payload) : await api.createJobPost(payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save job post.");
    } finally {
      setSubmitting(false);
    }
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
          <Alert severity='error' sx={{ mb: 3, borderRadius: 2, fontSize: 13 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Title */}
          <TextField
            label='Job Title'
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder='e.g., Build a modern e-commerce website'
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
          />

          {/* Category */}
          <FormControl fullWidth disabled={refLoading}>
            <InputLabel sx={{ fontSize: 13 }}>Category</InputLabel>
            <Select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value as number)}
              label='Category'
              sx={{ borderRadius: 2, fontSize: 13 }}>
              <MenuItem value=''>
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
              placeholder='Describe the project in detail — goals, features, requirements...'
              minHeight={180}
            />
          </Box>

          {/* Budget */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Budget Min (USD)'
                type='number'
                value={budgetMin}
                onChange={e => setBudgetMin(e.target.value)}
                placeholder='500'
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <DollarIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Budget Max (USD)'
                type='number'
                value={budgetMax}
                onChange={e => setBudgetMax(e.target.value)}
                placeholder='2000'
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
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
                label='Deadline'
                type='date'
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
                label='Max Proposals (optional)'
                type='number'
                value={maxProposals}
                onChange={e => setMaxProposals(e.target.value)}
                placeholder='50'
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
                  size='small'
                  {...getTagProps({ index })}
                  key={option.id}
                  sx={{ fontSize: 12, height: 26 }}
                />
              ))
            }
            renderInput={params => (
              <TextField
                {...params}
                label='Required Skills (optional)'
                placeholder='Search skills...'
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
              />
            )}
          />

          {/* File Attachments */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1.5, color: "rgba(0,0,0,0.7)" }}>
              Attachments (optional)
            </Typography>

            <Paper
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: "2px dashed",
                borderColor: "rgba(0,0,0,0.2)",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                cursor: uploading ? "default" : "pointer",
                transition: "all 0.2s",
                "&:hover": { borderColor: "#0071e3", bgcolor: "rgba(0,113,227,0.02)" },
              }}>
              {uploading ? (
                <CircularProgress size={28} sx={{ mb: 1 }} />
              ) : (
                <CloudUploadOutlined sx={{ fontSize: 36, color: "text.secondary", mb: 0.5 }} />
              )}
              <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>
                {uploading ? "Uploading..." : "Click to upload"}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Images or PDF — max 10 MB each
              </Typography>
              <input
                ref={fileInputRef}
                type='file'
                multiple
                accept='image/*,.pdf'
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
            </Paper>

            {attachedFiles.length > 0 && (
              <Stack spacing={1} mt={1.5}>
                {attachedFiles.map((f, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.08)",
                      bgcolor: "rgba(0,0,0,0.02)",
                    }}>
                    {f.type.startsWith("image/") ? (
                      <ImageOutlined sx={{ fontSize: 20, color: "#0071e3" }} />
                    ) : (
                      <InsertDriveFileOutlined sx={{ fontSize: 20, color: "#e3710a" }} />
                    )}
                    <Typography sx={{ fontSize: 13, flex: 1 }} noWrap>
                      {f.name}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{(f.size / 1024).toFixed(0)} KB</Typography>
                    <IconButton size='small' onClick={() => removeFile(i)}>
                      <CloseOutlined sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* Submit */}
          <Stack direction='row' spacing={2} pt={1}>
            <Button
              variant='outlined'
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
              variant='contained'
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
