"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";
import GlobalNotificationToast from "@/components/layout/GlobalNotificationToast";
import { useAuth } from "@/components/context/AuthContext";
import { Box, CircularProgress, Button, Tooltip, IconButton } from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import LogoutIcon from "@mui/icons-material/Logout";
import { tokens } from "@/theme";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  // The admin login page lives inside this route group but must render bare —
  // without the authenticated shell or the redirect guard (which would loop).
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;
    if (!loading && (!user || !user.is_admin)) {
      router.replace("/admin/login");
    }
  }, [user, loading, router, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading || !user?.is_admin) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: tokens.canvas }}>
      <GlobalNotificationToast />
      <AdminSidebar />
      <Box component='main' sx={{ flex: 1, minWidth: 0, overflow: "auto", display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
            px: 3.5,
            height: 64,
            borderBottom: `1px solid ${tokens.border}`,
            bgcolor: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(8px)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <Button
            onClick={() => router.push("/")}
            startIcon={<LaunchIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: "none", fontSize: 13, color: "text.secondary", "&:hover": { color: "text.primary", bgcolor: "grey.100" } }}
          >
            Switch to user site
          </Button>
          <AdminNotificationBell />
          <Tooltip title="Log out">
            <IconButton onClick={handleLogout} size="small" sx={{ color: "text.secondary", "&:hover": { color: "error.main", bgcolor: "grey.100" } }}>
              <LogoutIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ flex: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
}
