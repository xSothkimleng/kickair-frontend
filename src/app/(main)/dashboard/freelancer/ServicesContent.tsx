"use client";

import { useState, useEffect } from "react";
import { Box, Paper, Typography, Button, CircularProgress } from "@mui/material";
import { AddOutlined, WorkOutlined } from "@mui/icons-material";
import { Service } from "@/types/service";
import ServiceCard from "@/components/dashboard/freelancer/ServiceCard";
import ServiceForm from "@/components/dashboard/freelancer/ServiceForm";
import { api } from "@/lib/api";

export default function ServicesContent() {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setView("edit");
  };

  const handleBack = () => {
    setView("list");
    setEditingService(null);
    fetchServices(); // Refresh list after form closes
  };

  if (view === "create" || view === "edit") {
    return <ServiceForm service={editingService} onBack={handleBack} />;
  }

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
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 2 }}>Active Services</Typography>

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
        ) : services.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {services.map(service => (
              <ServiceCard key={service.id} service={service} onEdit={() => handleEditService(service)} />
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <WorkOutlined sx={{ fontSize: 48, color: "rgba(0, 0, 0, 0.2)", mb: 2 }} />
            <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)" }}>No active services yet</Typography>
          </Box>
        )}
      </Paper>

      {/* Drafts */}
      {/* {mockDrafts.length > 0 && (
        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 3 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 2 }}>Drafts</Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {mockDrafts.map(draft => (
              <DraftCard key={draft.id} draft={draft} onContinueEditing={() => handleEditService(draft)} />
            ))}
          </Box>
        </Paper>
      )} */}
    </Box>
  );
}
