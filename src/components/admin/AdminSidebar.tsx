"use client";

import { useState } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PeopleIcon from "@mui/icons-material/PeopleAltOutlined";
import WorkIcon from "@mui/icons-material/WorkOutline";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";
import AttachMoneyIcon from "@mui/icons-material/PaymentsOutlined";
import BarChartIcon from "@mui/icons-material/BarChartOutlined";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeartOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { tokens } from "@/theme";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: DashboardIcon, path: "/admin" },
  { id: "trust", label: "Trust & Safety", icon: ShieldIcon, path: "/admin/trust" },
  { id: "users", label: "User Management", icon: PeopleIcon, path: "/admin/users" },
  { id: "marketplace", label: "Marketplace Ops", icon: WorkIcon, path: "/admin/marketplace" },
  { id: "payments", label: "Payments & Finance", icon: AttachMoneyIcon, path: "/admin/payments" },
  { id: "analytics", label: "Analytics", icon: BarChartIcon, path: "/admin/analytics" },
  { id: "monitoring", label: "Technical Monitoring", icon: MonitorHeartIcon, path: "/admin/monitoring" },
  { id: "config", label: "Configuration", icon: SettingsIcon, path: "/admin/config" },
  { id: "notifications", label: "Notifications", icon: NotificationsIcon, path: "/admin/notifications" },
];

const EXPANDED = 256;
const COLLAPSED = 76;

function initialsOf(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "A";
}

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const name = user?.name || "Super Admin";
  const email = user?.email || "admin@kickair.com";

  const toggle = (
    <Box
      component="button"
      onClick={() => setCollapsed(c => !c)}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      sx={{
        border: 0, bgcolor: "transparent", cursor: "pointer", color: tokens.text3,
        width: 38, height: 38, borderRadius: "9px", display: "inline-flex", alignItems: "center", justifyContent: "center",
        "&:hover": { bgcolor: "rgba(0,0,0,0.05)", color: tokens.text },
      }}>
      {collapsed ? <KeyboardDoubleArrowRightIcon sx={{ fontSize: 19 }} /> : <KeyboardDoubleArrowLeftIcon sx={{ fontSize: 19 }} />}
    </Box>
  );

  return (
    <Box
      component="aside"
      sx={{
        width: collapsed ? COLLAPSED : EXPANDED,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        bgcolor: tokens.surface,
        borderRight: `1px solid ${tokens.border}`,
        display: "flex",
        flexDirection: "column",
        transition: "width .2s cubic-bezier(.3,.7,.4,1)",
        overflow: "hidden",
      }}>
      {/* Brand + collapse */}
      <Box sx={{ height: 64, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", px: collapsed ? 0 : "18px", borderBottom: `1px solid ${tokens.border}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.375, minWidth: 0 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, letterSpacing: "-0.04em", flexShrink: 0 }}>K</Box>
          {!collapsed && (
            <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <Typography sx={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.1 }}>KickAir</Typography>
              <Typography sx={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: tokens.text3 }}>Admin</Typography>
            </Box>
          )}
        </Box>
        {!collapsed && toggle}
      </Box>

      {/* Nav */}
      <Box component="nav" sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: collapsed ? "12px 16px" : "12px", display: "flex", flexDirection: "column", gap: "3px" }}>
        {collapsed && <Box sx={{ display: "flex", justifyContent: "center", mb: 0.75 }}>{toggle}</Box>}
        {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
          const active = pathname === path || (path !== "/admin" && pathname.startsWith(path));
          const btn = (
            <Box
              component="button"
              onClick={() => router.push(path)}
              sx={{
                width: collapsed ? 44 : "100%", height: collapsed ? 44 : 42, border: 0, cursor: "pointer", borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 1.375,
                px: collapsed ? 0 : 1.375, fontFamily: "inherit", fontSize: 14, textAlign: "left",
                bgcolor: active ? "rgba(0,0,0,0.06)" : "transparent",
                color: active ? tokens.text : tokens.text2,
                fontWeight: active ? 600 : 500,
                transition: "background .12s, color .12s",
                "&:hover": { bgcolor: active ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.04)", color: tokens.text },
              }}>
              <Icon sx={{ fontSize: 20, flexShrink: 0 }} />
              {!collapsed && <Box component="span" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</Box>}
            </Box>
          );
          return (
            <Box key={id} sx={{ display: "flex", justifyContent: collapsed ? "center" : "stretch" }}>
              {collapsed ? <Tooltip title={label} placement="right">{btn}</Tooltip> : btn}
            </Box>
          );
        })}
      </Box>

      {/* Admin user block */}
      <Box sx={{ flexShrink: 0, borderTop: `1px solid ${tokens.border}`, p: collapsed ? "12px 0" : "12px" }}>
        <Box title={collapsed ? `${name} · ${email}` : undefined}
          sx={{ display: "flex", alignItems: "center", gap: 1.375, p: collapsed ? 0 : "8px 10px", borderRadius: "12px", justifyContent: collapsed ? "center" : "flex-start", cursor: "default" }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initialsOf(name)}</Box>
          {!collapsed && (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</Typography>
                <Typography sx={{ fontSize: 11.5, color: tokens.text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 16, color: tokens.text3, flexShrink: 0 }} />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
