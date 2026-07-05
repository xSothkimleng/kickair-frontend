"use client";

import { useEffect, useState } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, Typography,
} from "@mui/material";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { api } from "@/lib/api";
import { ServiceCategory } from "@/types/service";
import { TextArea } from "@/components/ui/inputs";
import CategoryPicker, { CategoryValue } from "@/components/category/CategoryPicker";
import { tokens } from "@/theme";

export interface CategoryAssignTarget {
  kind: "service" | "job";
  id: number;
  title: string;
  requestedCategory?: string | null;
  requestedParentId?: number | null;
}

/**
 * Admin: assign a category to a service/job. Pick an existing shelf, or create a new one
 * (pre-filled from the user's request) — then it's saved and the owner is notified.
 * Reused for reviewing requested categories and re-filing live listings.
 */
export default function CategoryAssignDialog({
  open,
  target,
  onClose,
  onDone,
}: {
  open: boolean;
  target: CategoryAssignTarget | null;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [tree, setTree] = useState<ServiceCategory[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [value, setValue] = useState<CategoryValue>({ categoryId: null, requestedCategory: null, requestedParentId: null });
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValue({
      categoryId: null,
      requestedCategory: target?.requestedCategory ?? null,
      requestedParentId: target?.requestedParentId ?? null,
    });
    setReason("");
    setError(null);
    setTreeLoading(true);
    api.getCategoryTree()
      .then(setTree)
      .catch(() => setError("Failed to load categories."))
      .finally(() => setTreeLoading(false));
  }, [open, target]);

  const submit = async () => {
    if (!target) return;
    setError(null);
    try {
      setSubmitting(true);
      let categoryId = value.categoryId;

      // Creating a brand-new shelf from the request (or admin's own choice).
      if (!categoryId) {
        const name = value.requestedCategory?.trim();
        if (!name) {
          setError("Pick an existing subcategory, or name a new one.");
          setSubmitting(false);
          return;
        }
        const created = await api.createAdminCategory(name, value.requestedParentId ?? undefined);
        categoryId = created.id;
      }

      const trimmedReason = reason.trim() || undefined;
      if (target.kind === "service") {
        await api.setServiceCategory(target.id, categoryId, trimmedReason);
      } else {
        await api.setJobPostCategory(target.id, categoryId, trimmedReason);
      }

      onDone("Category updated.");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update category.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: `${tokens.radius.card}px`, overflow: "hidden" } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 3, pt: 2.75, pb: 2, borderBottom: `1px solid ${tokens.border}` }}>
        <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: tokens.surface2, border: `1px solid ${tokens.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: tokens.text2, flexShrink: 0 }}>
          <SellOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.3 }}>Set category</Typography>
          {target?.title && (
            <Typography sx={{ fontSize: 12.5, color: tokens.text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{target.title}</Typography>
          )}
        </Box>
      </Box>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {target?.requestedCategory && (
          <Box sx={{ display: "flex", gap: 1, p: 1.5, mb: 2, borderRadius: "10px", border: `1px solid ${tokens.pendingText}33`, bgcolor: tokens.pendingTint }}>
            <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: tokens.pendingText, flexShrink: 0, mt: "1px" }} />
            <Typography sx={{ fontSize: 12.5, color: tokens.pendingText, lineHeight: 1.5 }}>
              The owner suggested a new category, <strong>“{target.requestedCategory}”</strong>. Create it below as a new (sub)category, or map this listing to an existing one.
            </Typography>
          </Box>
        )}
        {error && (
          <Box sx={{ p: 1.5, mb: 2, borderRadius: "10px", border: `1px solid ${tokens.errorText}33`, bgcolor: tokens.errorTint }}>
            <Typography sx={{ fontSize: 12.5, color: tokens.errorText }}>{error}</Typography>
          </Box>
        )}

        {treeLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}><CircularProgress size={24} /></Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <CategoryPicker tree={tree} value={value} onChange={setValue} showNewCategoryHint={false} />
            <TextArea
              label="Note to the owner (optional)"
              minRows={2}
              maxLength={500}
              value={reason}
              onChange={setReason}
              helper="Shown in the notification, e.g. why you moved it."
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${tokens.border}` }}>
        <Button onClick={onClose} disabled={submitting} sx={{ textTransform: "none", color: tokens.text2 }}>Cancel</Button>
        <Button
          variant="contained"
          disableElevation
          onClick={submit}
          disabled={submitting || treeLoading || (!value.categoryId && !value.requestedCategory?.trim())}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: "999px", px: 2.75, bgcolor: "#000", "&:hover": { bgcolor: tokens.text }, "&.Mui-disabled": { bgcolor: tokens.border, color: tokens.text3 } }}>
          {submitting ? <CircularProgress size={18} color="inherit" /> : "Save category"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
