"use client";

import { useState } from "react";
import { Box, Typography, Button, TextField, Stack, InputAdornment, CircularProgress, Alert } from "@mui/material";
import { AttachMoney as DollarIcon, ScheduleOutlined } from "@mui/icons-material";
import { api } from "@/lib/api";
import { Proposal, CreateProposalRequest } from "@/types/job";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface ProposalFormProps {
  jobPostId: number;
  existing?: Proposal | null;
  onSaved: (proposal: Proposal) => void;
  onCancel: () => void;
}

const FieldLabel = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <Box mb={0.75}>
    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.primary" }}>{children}</Typography>
    {hint && <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.25 }}>{hint}</Typography>}
  </Box>
);

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    fontSize: 14,
    bgcolor: "white",
    "& fieldset": { borderColor: "rgba(0,0,0,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(0,0,0,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#0071e3", borderWidth: 1.5 },
  },
};

export default function ProposalForm({ jobPostId, existing, onSaved, onCancel }: ProposalFormProps) {
  const isEditing = !!existing;

  const [price, setPrice] = useState(existing?.price ?? "");
  const [timelineDays, setTimelineDays] = useState(existing?.timeline_days ? String(existing.timeline_days) : "");
  const [coverLetter, setCoverLetter] = useState(existing?.cover_letter ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!price) {
      setError("Price is required.");
      return;
    }
    if (Number(price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }
    if (!timelineDays || Number(timelineDays) < 1) {
      setError("Timeline must be at least 1 day.");
      return;
    }
    if (!coverLetter.trim() || coverLetter === "<p></p>") {
      setError("Cover letter is required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateProposalRequest = {
        price: Number(price),
        timeline_days: Number(timelineDays),
        cover_letter: coverLetter,
      };
      const saved = isEditing ? await api.updateProposal(existing!.id, payload) : await api.submitProposal(jobPostId, payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.25 }}>
          {isEditing ? "Edit Your Proposal" : "Submit a Proposal"}
        </Typography>
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Fill in your terms for this project.</Typography>
      </Box>

      {error && (
        <Alert severity='error' sx={{ borderRadius: 1.5, fontSize: 12, py: 0.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Price */}
      <Box>
        <FieldLabel hint="What you'll charge for this project">Your Price</FieldLabel>
        <TextField
          type='number'
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder='0'
          fullWidth
          size='small'
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <DollarIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={fieldSx}
        />
      </Box>

      {/* Timeline */}
      <Box>
        <FieldLabel hint='How long will this project take?'>Timeline</FieldLabel>
        <TextField
          type='number'
          value={timelineDays}
          onChange={e => setTimelineDays(e.target.value)}
          placeholder='14'
          fullWidth
          size='small'
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <Stack direction='row' spacing={0.5} alignItems='center'>
                    <ScheduleOutlined sx={{ fontSize: 14, color: "text.disabled" }} />
                    <Typography sx={{ fontSize: 12, color: "text.disabled" }}>days</Typography>
                  </Stack>
                </InputAdornment>
              ),
              inputProps: { min: 1 },
            },
          }}
          sx={fieldSx}
        />
      </Box>

      {/* Cover letter */}
      <Box>
        <FieldLabel hint='Why are you a great fit for this project?'>Cover Letter</FieldLabel>
        <RichTextEditor
          value={coverLetter}
          onChange={setCoverLetter}
          placeholder='Explain your relevant experience and approach...'
          minHeight={130}
        />
      </Box>

      {/* Actions */}
      <Stack direction='row' spacing={1}>
        <Button
          variant='outlined'
          onClick={onCancel}
          sx={{
            flex: 1,
            fontSize: 13,
            fontWeight: 500,
            textTransform: "none",
            borderRadius: 1.5,
            borderColor: "divider",
            color: "text.secondary",
            "&:hover": { borderColor: "rgba(0,0,0,0.3)", bgcolor: "transparent", color: "text.primary" },
          }}>
          Cancel
        </Button>
        <Button
          variant='contained'
          disabled={submitting}
          onClick={handleSubmit}
          sx={{
            flex: 2,
            fontSize: 13,
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 1.5,
            boxShadow: "none",
            color: "white",
            "&:hover": { boxShadow: "none" },
          }}>
          {submitting ? <CircularProgress size={16} sx={{ color: "white" }} /> : isEditing ? "Save Changes" : "Submit Proposal"}
        </Button>
      </Stack>
    </Stack>
  );
}
