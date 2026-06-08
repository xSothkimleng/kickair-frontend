"use client";

import { useEffect, useState } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Alert, Typography,
} from "@mui/material";
import { api } from "@/lib/api";
import { ServiceCategory } from "@/types/service";
import { TextArea } from "@/components/ui/inputs";
import CategoryPicker, { CategoryValue } from "@/components/category/CategoryPicker";

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
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Set category</DialogTitle>
      <DialogContent>
        {target?.requestedCategory && (
          <Alert severity="info" sx={{ mb: 2 }}>
            The user requested a new category: <strong>{target.requestedCategory}</strong>. Approve it as a new
            subcategory below, or map this listing to an existing one.
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {target?.title}
        </Typography>

        {treeLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={24} /></Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <CategoryPicker tree={tree} value={value} onChange={setValue} />
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
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ textTransform: "none" }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={submitting || treeLoading || (!value.categoryId && !value.requestedCategory?.trim())}
          sx={{ textTransform: "none" }}>
          {submitting ? <CircularProgress size={18} color="inherit" /> : "Save category"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
