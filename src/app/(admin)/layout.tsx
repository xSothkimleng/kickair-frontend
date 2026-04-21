"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/components/context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.replace("/auth/sign-in");
    }
  }, [user, loading, router]);

  if (loading || !user?.is_admin) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.50" }}>
      <AdminSidebar />
      <Box component='main' sx={{ flex: 1, overflow: "auto" }}>
        {children}
      </Box>
    </Box>
  );
}
