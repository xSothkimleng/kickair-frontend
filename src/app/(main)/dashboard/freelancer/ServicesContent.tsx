"use client";

import { useState, useEffect } from "react";
import { Box, Paper, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { AddOutlined, WorkOutlined } from "@mui/icons-material";
import { Service } from "@/types/service";
import ServiceCard from "@/components/dashboard/freelancer/ServiceCard";
import DraftCard from "@/components/dashboard/freelancer/DraftCard";
import ServiceForm from "@/components/dashboard/freelancer/ServiceForm";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ServicesContent() {
  const router = useRouter();
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/my-services");
      setServices(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditService = async (service: Service) => {
    setEditLoading(true);
    try {
      // Fetch full service detail so pricing_options, media, and faqs are all loaded
      const response = await api.get(`/api/services/${service.id}`);
      setEditingService(response.data);
    } catch {
      setEditingService(service); // fallback to list data
    } finally {
      setEditLoading(false);
    }
    setView("edit");
  };

  const handleViewService = (service: Service) => {
    router.push(`/explore-services/${service.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.deleteService(deleteTarget.id);
      setDeleteTarget(null);
      fetchServices();
    } catch {
      // keep dialog open so user can retry
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => {
    setView("list");
    setEditingService(null);
    fetchServices();
  };

  if (editLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (view === "create" || view === "edit") {
    return <ServiceForm service={editingService} onBack={handleBack} />;
  }

  const drafts = services.filter(s => s.status === "draft");
  const liveServices = services.filter(s => s.status !== "draft");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>My Services</Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)" }}>Create and manage your service offerings</Typography>
        </Box>
        <Button
          onClick={() => setView("create")}
          startIcon={<AddOutlined sx={{ fontSize: 16 }} />}
          sx={{
            px: 3,
            height: 44,
            fontSize: 13,
            color: "white",
            bgcolor: "black",
            borderRadius: 10,
            textTransform: "none",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.8)",
            },
          }}>
          Create Service
        </Button>
      </Box>

      {/* Active Services */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 3 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 2 }}>Your Services</Typography>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress size={32} sx={{ color: "rgba(0, 0, 0, 0.4)" }} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography sx={{ fontSize: 13, color: "rgba(239, 68, 68, 0.8)", mb: 2 }}>{error}</Typography>
            <Button onClick={fetchServices} sx={{ fontSize: 12, textTransform: "none" }}>
              Try again
            </Button>
          </Box>
        ) : liveServices.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {liveServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={() => handleEditService(service)}
                onView={() => handleViewService(service)}
                onDelete={() => setDeleteTarget(service)}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <WorkOutlined sx={{ fontSize: 48, color: "rgba(0, 0, 0, 0.2)", mb: 2 }} />
            <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)" }}>No active services yet</Typography>
          </Box>
        )}
      </Paper>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>Delete Service</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 13 }}>
            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} sx={{ fontSize: 13, textTransform: "none", color: "rgba(0,0,0,0.6)" }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} disabled={deleting} sx={{ fontSize: 13, textTransform: "none", color: "#ef4444" }}>
            {deleting ? <CircularProgress size={16} sx={{ color: "#ef4444" }} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drafts — private, never reviewed or public until published */}
      {drafts.length > 0 && (
        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Drafts</Typography>
            <Box sx={{ px: 1, py: 0.25, bgcolor: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.6)", fontSize: 11, fontWeight: 600, borderRadius: 1 }}>
              {drafts.length}
            </Box>
          </Box>
          <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.5)", mb: 2 }}>
            Only you can see these. Continue editing and publish when you&apos;re ready for admin review.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {drafts.map(draft => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onContinueEditing={() => handleEditService(draft)}
                onDelete={() => setDeleteTarget(draft)}
              />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
