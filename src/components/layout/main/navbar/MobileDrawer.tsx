"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Logout, Settings as SettingsIcon, HelpOutline, Work as BriefcaseIcon } from "@mui/icons-material";
import { Box, Button, Avatar, Typography, CircularProgress, Drawer, IconButton, Divider } from "@mui/material";
import { LANGUAGES, type Language, type UserMode } from "./types";

export interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  user: { name: string; avatar_url?: string | null } | null;
  loading: boolean;
  onLogout: () => Promise<void>;
  currentMode: UserMode;
  onModeSwitch: (mode: UserMode) => void;
}

type NavSection =
  | { label: string; href: string; items?: never }
  | { label: string; href?: never; items: { title: string; href: string; description: string }[] };

const NAV_SECTIONS: NavSection[] = [
  { label: "Explore Services", href: "/explore-services" },
  {
    label: "Why KickAir",
    items: [
      { title: "How It Works", href: "/why-kick-air#how-it-works", description: "Step-by-step guide for clients and freelancers" },
      { title: "Success Stories", href: "/why-kick-air#success-stories", description: "Real results from our community" },
      { title: "Reviews", href: "/why-kick-air#reviews", description: "See what people are saying about us" },
    ],
  },
  {
    label: "For Freelancers",
    items: [
      { title: "Post Your Service", href: "/dashboard/freelancer", description: "Create your service listing with three-tier pricing" },
      { title: "Opportunities", href: "/jobs", description: "Find gigs, part-time & full-time work" },
      { title: "KickAir University", href: "/kick-air-university", description: "Master freelancing skills, pricing strategies, and client management" },
    ],
  },
  {
    label: "For Clients",
    items: [
      { title: "KickAir University", href: "/kick-air-university", description: "Learn project management and hiring best practices" },
      { title: "Explore Services", href: "/explore-services", description: "Browse freelancer offerings" },
      { title: "Find Freelancers", href: "/find-freelancer", description: "One-off jobs & projects" },
      { title: "Post Your Gig", href: "/post-gig", description: "Part-time & full-time roles" },
      { title: "Boost Gig with Ads", href: "/pro", description: "Promote with premium placement" },
    ],
  },
  {
    label: "KickAir Pro",
    items: [
      { title: "Better Visibility with Ads", href: "/pro", description: "Priority placement and highlighted listings" },
      { title: "Lower Transaction Fees", href: "/pro", description: "Save more on every transaction" },
      { title: "Exclusive Support & Tools", href: "/pro", description: "Priority support and premium features" },
      { title: "Client Team Workspace", href: "/pro", description: "Organize projects with multiple freelancers" },
    ],
  },
];

export function MobileDrawer({
  open,
  onClose,
  selectedLanguage,
  onLanguageChange,
  user,
  loading,
  onLogout,
  currentMode,
  onModeSwitch,
}: MobileDrawerProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (label: string) => {
    setExpandedSection(prev => (prev === label ? null : label));
  };

  const avatarSrc = user?.avatar_url ?? undefined;

  return (
    <Drawer anchor='left' open={open} onClose={onClose} disableScrollLock slotProps={{ paper: { sx: { width: 280 } } }}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            flexShrink: 0,
          }}>
          <Link href='/' onClick={onClose}>
            <Image src='/assets/images/kickair-logo.png' alt='KickAir' width={80} height={30} style={{ objectFit: "contain" }} />
          </Link>
          <IconButton onClick={onClose} size='small' aria-label='Close menu'>
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>

        {/* Nav sections */}
        <Box sx={{ py: 1, flexShrink: 0 }}>
          {NAV_SECTIONS.map(section => {
            if (!section.items) {
              return (
                <Button
                  key={section.href}
                  component={Link as React.ElementType}
                  href={section.href}
                  onClick={onClose}
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    px: 2.5,
                    py: 1.25,
                    fontSize: 14,
                    textTransform: "none",
                    color: "black",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                  }}>
                  {section.label}
                </Button>
              );
            }

            const isOpen = expandedSection === section.label;
            return (
              <Box key={section.label}>
                <Button
                  onClick={() => toggleSection(section.label)}
                  endIcon={
                    <KeyboardArrowDownIcon
                      sx={{ fontSize: 16, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}
                    />
                  }
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    px: 2.5,
                    py: 1.25,
                    fontSize: 14,
                    textTransform: "none",
                    color: "black",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                    "& .MuiButton-endIcon": { ml: "auto" },
                  }}>
                  {section.label}
                </Button>

                {isOpen && (
                  <Box sx={{ pl: 2, pb: 1 }}>
                    {section.items.map(item => (
                      <Button
                        key={item.href + item.title}
                        component={Link as React.ElementType}
                        href={item.href}
                        onClick={onClose}
                        sx={{
                          width: "100%",
                          justifyContent: "flex-start",
                          px: 2,
                          py: 0.75,
                          textTransform: "none",
                          color: "black",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          borderRadius: 1,
                          "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                        }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.title}</Typography>
                        <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>{item.description}</Typography>
                      </Button>
                    ))}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        <Divider />

        {/* Language selector */}
        <Box sx={{ px: 2.5, py: 2, flexShrink: 0 }}>
          <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
            Language
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {LANGUAGES.map(lang => (
              <Button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang);
                  onClose();
                }}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  fontSize: 12,
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: selectedLanguage.code === lang.code ? "black" : "rgba(0,0,0,0.05)",
                  color: selectedLanguage.code === lang.code ? "white" : "rgba(0,0,0,0.6)",
                  "&:hover": { bgcolor: selectedLanguage.code === lang.code ? "black" : "rgba(0,0,0,0.1)" },
                }}>
                {lang.label}
              </Button>
            ))}
          </Box>
        </Box>

        <Divider />

        {/* Auth */}
        <Box sx={{ px: 2, py: 2, mt: "auto", flexShrink: 0 }}>
          {loading ? (
            <CircularProgress size={20} />
          ) : user ? (
            <Box>
              {/* User header */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Avatar src={avatarSrc} alt={user.name} sx={{ width: 32, height: 32 }}>
                  {!avatarSrc && user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{user.name}</Typography>
                  <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.5)", textTransform: "capitalize" }}>{currentMode} mode</Typography>
                </Box>
              </Box>

              {/* Mode switcher */}
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                  Mode
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {(["freelancer", "client"] as const).map(mode => (
                    <Button
                      key={mode}
                      onClick={() => {
                        onModeSwitch(mode);
                        onClose();
                      }}
                      sx={{
                        flex: 1,
                        px: 1.5,
                        py: 1,
                        fontSize: 12,
                        borderRadius: 2,
                        textTransform: "none",
                        bgcolor: currentMode === mode ? "black" : "rgba(0,0,0,0.05)",
                        color: currentMode === mode ? "white" : "rgba(0,0,0,0.6)",
                        "&:hover": { bgcolor: currentMode === mode ? "black" : "rgba(0,0,0,0.1)" },
                      }}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </Box>
              </Box>

              {/* Profile nav links */}
              <Box sx={{ display: "flex", flexDirection: "column", mb: 1 }}>
                {[
                  {
                    href: currentMode === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client",
                    icon: <BriefcaseIcon sx={{ fontSize: 14, color: "rgba(0,0,0,0.6)", mr: 1 }} />,
                    label: currentMode === "freelancer" ? "Freelancer Dashboard" : "Client Dashboard",
                  },
                  {
                    href: "/settings",
                    icon: <SettingsIcon sx={{ fontSize: 14, color: "rgba(0,0,0,0.6)", mr: 1 }} />,
                    label: "Settings",
                  },
                  {
                    href: "/help",
                    icon: <HelpOutline sx={{ fontSize: 14, color: "rgba(0,0,0,0.6)", mr: 1 }} />,
                    label: "Help & Support",
                  },
                ].map(item => (
                  <Button
                    key={item.href}
                    component={Link as React.ElementType}
                    href={item.href}
                    onClick={onClose}
                    sx={{
                      width: "100%",
                      justifyContent: "flex-start",
                      px: 1,
                      py: 1,
                      fontSize: 13,
                      color: "black",
                      textTransform: "none",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                    }}>
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
              </Box>

              {/* Logout */}
              <Button
                onClick={async () => {
                  await onLogout();
                  onClose();
                }}
                sx={{
                  width: "100%",
                  justifyContent: "flex-start",
                  px: 1,
                  py: 1,
                  fontSize: 13,
                  color: "#dc2626",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#fef2f2" },
                }}>
                <Logout sx={{ fontSize: 14, mr: 1 }} />
                Logout
              </Button>
            </Box>
          ) : (
            <Button
              component={Link as React.ElementType}
              href='/auth/sign-in'
              onClick={onClose}
              sx={{
                width: "100%",
                bgcolor: "black",
                color: "white !important",
                borderRadius: 25,
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
              }}>
              Sign In
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
