"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { api } from "@/lib/api";
import { FreelancerProfile } from "@/types/user";
import { FreelancerProfilePage } from "@/components/ui/freelancerProfilePage";

export default function FreelancerProfileRoute() {
  const params = useParams();
  const id = Number(params.id);

  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getFreelancerProfile(id);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F5F5F7" }}>
        <CircularProgress sx={{ color: "#0071e3" }} />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F5F5F7" }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: 15, color: "rgba(0, 0, 0, 0.6)", mb: 2 }}>
            {error || "Freelancer not found"}
          </Typography>
          <Button
            href="/find-freelancer"
            sx={{
              px: 4, height: 40, fontSize: 13, fontWeight: 500,
              bgcolor: "#0071e3", color: "white", borderRadius: 25, textTransform: "none",
              "&:hover": { bgcolor: "#0077ED" },
            }}>
            Back to Freelancers
          </Button>
        </Box>
      </Box>
    );
  }

  return <FreelancerProfilePage profile={profile} />;
}
