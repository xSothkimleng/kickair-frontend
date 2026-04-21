"use client";

import { useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import ShieldIcon from "@mui/icons-material/Shield";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BarChartIcon from "@mui/icons-material/BarChart";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: DashboardIcon, path: "/admin" },
  { id: "users", label: "User Management", icon: PeopleIcon, path: "/admin/users" },
  { id: "marketplace", label: "Gigs & Jobs", icon: WorkIcon, path: "/admin/marketplace" },
  { id: "trust", label: "Trust & Safety", icon: ShieldIcon, path: "/admin/trust" },
  { id: "payments", label: "Payments & Finance", icon: AttachMoneyIcon, path: "/admin/payments" },
  { id: "analytics", label: "Analytics", icon: BarChartIcon, path: "/admin/analytics" },
  { id: "monitoring", label: "Technical Monitoring", icon: MonitorHeartIcon, path: "/admin/monitoring" },
  { id: "config", label: "Configuration", icon: SettingsIcon, path: "/admin/config" },
];

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 72;

export default function AdminSidebar() {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Box
      sx={{
        width: open ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED,
        height: "100vh",
        position: "sticky",
        top: 0,
        bgcolor: "white",
        borderRight: "1px solid",
        borderColor: "grey.200",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        flexShrink: 0,
        overflowY: "auto",
      }}>
      {/* Logo + Toggle */}
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          px: open ? 2 : 1,
          borderBottom: "1px solid",
          borderColor: "grey.200",
        }}>
        {open && (
          <Typography fontWeight={700} fontSize={18} color='primary.main'>
            Kickair Admin
          </Typography>
        )}
        <IconButton size='small' onClick={() => setOpen(!open)}>
          {open ? <CloseIcon fontSize='small' /> : <MenuIcon fontSize='small' />}
        </IconButton>
      </Box>

      {/* Nav Items */}
      <List sx={{ px: 1, py: 1.5, gap: 0.5, display: "flex", flexDirection: "column" }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
          const isActive = pathname === path || (path !== "/admin" && pathname.startsWith(path));
          return (
            <Tooltip key={id} title={!open ? label : ""} placement='right'>
              <ListItemButton
                onClick={() => router.push(path)}
                sx={{
                  borderRadius: 2,
                  px: open ? 1.5 : 1,
                  py: 1,
                  justifyContent: open ? "flex-start" : "center",
                  bgcolor: isActive ? "primary.50" : "transparent",
                  color: isActive ? "primary.main" : "text.secondary",
                  "&:hover": {
                    bgcolor: isActive ? "primary.50" : "grey.100",
                  },
                  minHeight: 44,
                }}>
                <ListItemIcon
                  sx={{
                    minWidth: open ? 36 : "auto",
                    color: "inherit",
                  }}>
                  <Icon fontSize='small' />
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={label}
                    slotProps={{
                      primary: {
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 400,
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      {/* Spacer pushes user info to bottom */}
      <Box sx={{ flex: 1 }} />

      {/* User Info */}
      <Divider />
      <Box sx={{ p: open ? 2 : 1, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontSize: 13, fontWeight: 700 }}>SA</Avatar>
        {open && (
          <Box>
            <Typography fontSize={13} fontWeight={600}>
              Super Admin
            </Typography>
            <Typography fontSize={11} color='text.secondary'>
              admin@kickair.com
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
