"use client";
import { useRef, useState, useEffect } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LanguageIcon from "@mui/icons-material/Language";
import BookOpenIcon from "@mui/icons-material/MenuBook";
import BoltIcon from "@mui/icons-material/Bolt";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import ShieldIcon from "@mui/icons-material/Shield";
import MenuIcon from "@mui/icons-material/Menu";
import { Settings as SettingsIcon, HelpOutline, Logout, Work as BriefcaseIcon } from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Button,
  Avatar,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Container,
} from "@mui/material";
import { useAuth } from "@/components/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { type DropdownType, type UserMode, type Language, LANGUAGES } from "./types";
import { dropdownPanelSx, navBtnSx } from "./styles";
import { DropdownItem } from "./DropdownItem";
import { MobileDrawer } from "./MobileDrawer";
import { NotificationBell } from "./NotificationBell";
import { MessageBell } from "./MessageBell";

export default function MainNavbar() {
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileDialogType, setProfileDialogType] = useState<UserMode | null>(null);
  const [profileDialogLoading, setProfileDialogLoading] = useState(false);
  const [profileDialogError, setProfileDialogError] = useState<string | null>(null);

  // Wraps both click-based dropdowns (language + profile) for the outside-click handler
  const clickDropdownRef = useRef<HTMLDivElement>(null);

  const { user, loading, logout, enableRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Declared early so all handlers below can reference them
  const isFreelancer = user?.is_freelancer ?? false;
  const isClient = user?.is_client ?? false;

  // The active mode a dual-role user is viewing in. It's not stored on the server, so we
  // derive it: an explicit dashboard URL wins; otherwise fall back to the last mode the user
  // was in (persisted below), so navigating to a neutral page (Explore, Find Freelancers, …)
  // doesn't silently flip them from client → freelancer.
  //
  // Job posts (proposal review) and standalone order detail live outside the /dashboard/client
  // path but are client-owned surfaces — treat them as client mode too.
  const [modePref, setModePref] = useState<UserMode | null>(null);

  const urlMode: UserMode | null =
    pathname?.includes("/dashboard/client") || pathname?.includes("/dashboard/jobs") || pathname?.includes("/dashboard/orders")
      ? "client"
      : pathname?.includes("/dashboard/freelancer")
        ? "freelancer"
        : null;

  // Only honor a persisted preference the user still has the role for (guards against a
  // stale value from a previous session/user).
  const usablePref = modePref && (modePref === "freelancer" ? isFreelancer : isClient) ? modePref : null;

  const currentMode: UserMode = urlMode ?? usablePref ?? (isFreelancer ? "freelancer" : "client");

  // Single derived value — avoids duplicating the URL construction in JSX
  const profileImageSrc = user?.avatar_url ?? undefined;

  // Close click-based dropdowns when clicking outside — stable (no deps)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clickDropdownRef.current && !clickDropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(prev => (prev === "language" || prev === "profile" ? null : prev));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close everything on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Restore the last-used mode on mount so neutral pages don't reset a dual-role user's view.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kickair_mode");
      if (saved === "client" || saved === "freelancer") setModePref(saved);
    } catch {
      // localStorage unavailable in private browsing / SSR
    }
  }, []);

  // Remember the mode whenever the user lands on a mode-specific dashboard.
  useEffect(() => {
    if (!urlMode) return;
    setModePref(urlMode);
    try {
      localStorage.setItem("kickair_mode", urlMode);
    } catch {
      // ignore
    }
  }, [urlMode]);

  // Restore language preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kickair_language");
      if (saved) {
        const match = LANGUAGES.find(l => l.code === saved);
        if (match) {
          setSelectedLanguage(match);
          document.documentElement.lang = match.code;
        }
      }
    } catch {
      // localStorage unavailable in private browsing / SSR
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
    setActiveDropdown(null);
    try {
      localStorage.setItem("kickair_language", lang.code);
      document.documentElement.lang = lang.code;
    } catch {
      // ignore
    }
  };

  const navigateTo = (href: string) => {
    setActiveDropdown(null);
    router.push(href);
  };

  // Posting a service lives in the freelancer space; send guests to sign in first.
  const goToCreateService = () => {
    setActiveDropdown(null);
    router.push(user ? "/dashboard/freelancer" : "/auth/sign-in");
  };

  const handleDropdownToggle = (dropdown: DropdownType) => {
    setActiveDropdown(prev => (prev === dropdown ? null : dropdown));
  };

  const handleModeSwitch = (mode: UserMode) => {
    if (mode === "freelancer" && !isFreelancer) {
      setProfileDialogType("freelancer");
      setProfileDialogOpen(true);
    } else if (mode === "client" && !isClient) {
      setProfileDialogType("client");
      setProfileDialogOpen(true);
    } else {
      navigateTo(`/dashboard/${mode}`);
    }
  };

  const handleDialogClose = () => {
    if (profileDialogLoading) return;
    setProfileDialogOpen(false);
    setProfileDialogType(null);
    setProfileDialogError(null);
  };

  // Enable the second account role (Start selling / Start hiring). No KYC gate — this
  // just flips the role flag and creates the missing profile, then drops the user into
  // that dashboard. The publish gate still applies when they create a service or job.
  const handleCreateProfile = async () => {
    if (!profileDialogType) return;
    setProfileDialogLoading(true);
    setProfileDialogError(null);
    try {
      await enableRole(profileDialogType);
      setProfileDialogOpen(false);
      setProfileDialogType(null);
      setActiveDropdown(null);
      router.push(`/dashboard/${profileDialogType}`);
    } catch (error) {
      setProfileDialogError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setProfileDialogLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setModePref(null);
      try { localStorage.removeItem("kickair_mode"); } catch { /* ignore */ }
      setActiveDropdown(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Box
      component='nav'
      role='navigation'
      aria-label='Main navigation'
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        bgcolor: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}>
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        {/* Logo */}
        <Box component='span'>
          <Link href='/'>
            <Image
              src='/assets/images/kickair-logo.png'
              alt='KickAir'
              width={100}
              height={38}
              style={{ objectFit: "contain", marginTop: 5 }}
            />
          </Link>
        </Box>

        {/* ── Desktop Nav ──────────────────────────────────────────────────────── */}
        <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", gap: "20px" }}>
          <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {/* Explore Services */}
            <Button component={Link as React.ElementType} href='/explore-services' sx={navBtnSx}>
              Explore Services
            </Button>

            {/* Why KickAir ▾ */}
            <Box sx={{ position: "relative" }}>
              <Button
                endIcon={
                  <KeyboardArrowDownIcon
                    sx={{
                      fontSize: 16,
                      transition: "transform 0.2s",
                      transform: activeDropdown === "why" ? "rotate(180deg)" : "none",
                    }}
                  />
                }
                onMouseEnter={() => setActiveDropdown("why")}
                aria-haspopup='true'
                aria-expanded={activeDropdown === "why"}
                sx={navBtnSx}>
                Why KickAir
              </Button>

              {activeDropdown === "why" && (
                <Box
                  onMouseLeave={() => setActiveDropdown(null)}
                  sx={{ ...dropdownPanelSx, left: "50%", transform: "translateX(-50%)" }}>
                  <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)", mb: 2 }}>
                      Learn why KickAir is the best platform for freelancing
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <DropdownItem
                        href='/why-kick-air#how-it-works'
                        title='How It Works'
                        description='Step-by-step guide for clients and freelancers'
                        onClick={() => setActiveDropdown(null)}
                      />
                      <DropdownItem
                        href='/why-kick-air#success-stories'
                        title='Success Stories'
                        description='Real results from our community'
                        onClick={() => setActiveDropdown(null)}
                      />
                      <DropdownItem
                        href='/why-kick-air#reviews'
                        title='Reviews'
                        description='See what people are saying about us'
                        onClick={() => setActiveDropdown(null)}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {/* For Freelancers ▾ */}
            <Box sx={{ position: "relative" }}>
              <Button
                endIcon={
                  <KeyboardArrowDownIcon
                    sx={{
                      fontSize: 16,
                      transition: "transform 0.2s",
                      transform: activeDropdown === "freelancer" ? "rotate(180deg)" : "none",
                    }}
                  />
                }
                onMouseEnter={() => setActiveDropdown("freelancer")}
                aria-haspopup='true'
                aria-expanded={activeDropdown === "freelancer"}
                sx={navBtnSx}>
                For Freelancers
              </Button>

              {activeDropdown === "freelancer" && (
                <Box
                  onMouseLeave={() => setActiveDropdown(null)}
                  sx={{ ...dropdownPanelSx, left: "50%", transform: "translateX(-50%)" }}>
                  <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)", mb: 2 }}>
                      Learn, earn, and grow your freelance career
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <DropdownItem
                        icon={<BoltIcon sx={{ fontSize: 20, color: "rgba(0,0,0,0.6)" }} />}
                        title='Post Your Service'
                        description='Create your service listing with three-tier pricing'
                        onClick={goToCreateService}
                      />
                      <DropdownItem
                        icon={<BusinessCenterIcon sx={{ fontSize: 20, color: "rgba(0,0,0,0.6)" }} />}
                        title='Opportunities'
                        description='Find gigs, part-time & full-time work'
                        href='/jobs'
                        onClick={() => setActiveDropdown(null)}
                      />
                      <DropdownItem
                        icon={<BookOpenIcon sx={{ fontSize: 20, color: "rgba(0,0,0,0.6)" }} />}
                        title='KickAir University'
                        description='Master freelancing skills, pricing strategies, and client management'
                        href='/kick-air-university'
                        onClick={() => setActiveDropdown(null)}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {/* For Clients ▾ */}
            <Box sx={{ position: "relative" }}>
              <Button
                endIcon={
                  <KeyboardArrowDownIcon
                    sx={{
                      fontSize: 16,
                      transition: "transform 0.2s",
                      transform: activeDropdown === "client" ? "rotate(180deg)" : "none",
                    }}
                  />
                }
                onMouseEnter={() => setActiveDropdown("client")}
                aria-haspopup='true'
                aria-expanded={activeDropdown === "client"}
                sx={navBtnSx}>
                For Clients
              </Button>

              {activeDropdown === "client" && (
                <Box
                  onMouseLeave={() => setActiveDropdown(null)}
                  sx={{ ...dropdownPanelSx, left: "50%", transform: "translateX(-50%)" }}>
                  <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)", mb: 2 }}>
                      Get work done with trusted freelancers
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <DropdownItem
                        icon={<BookOpenIcon sx={{ fontSize: 20, color: "rgba(0,0,0,0.6)" }} />}
                        title='KickAir University'
                        description='Learn project management and hiring best practices'
                        href='/kick-air-university'
                        onClick={() => setActiveDropdown(null)}
                      />
                      <DropdownItem
                        icon={<SearchIcon sx={{ fontSize: 20, color: "rgba(0,0,0,0.6)" }} />}
                        title='Explore Services'
                        description='Browse freelancer offerings'
                        href='/explore-services'
                        onClick={() => setActiveDropdown(null)}
                      />
                      <DropdownItem
                        icon={<PeopleIcon sx={{ fontSize: 20, color: "rgba(0,0,0,0.6)" }} />}
                        title='Find Freelancers'
                        description='One-off jobs & projects'
                        href='/find-freelancer'
                        onClick={() => setActiveDropdown(null)}
                      />
                      <DropdownItem
                        icon={<BusinessCenterIcon sx={{ fontSize: 20, color: "rgba(0,0,0,0.6)" }} />}
                        title='Post Your Gig'
                        description='Create a service listing to sell'
                        onClick={goToCreateService}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

          </Box>

          {/* ── Right Side: Language + Auth ──────────────────────────────────────── */}
          {/* Single ref covers both click-based dropdowns */}
          <Box ref={clickDropdownRef} sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Language ▾ */}
            <Box sx={{ position: "relative" }}>
              <Button
                onClick={() => handleDropdownToggle("language")}
                aria-haspopup='listbox'
                aria-expanded={activeDropdown === "language"}
                aria-label={`Language: ${selectedLanguage.label}`}
                sx={{ fontSize: 12, textTransform: "none", gap: 0.5, color: "rgba(0,0,0,0.7)" }}>
                <LanguageIcon sx={{ fontSize: 14 }} />
                {selectedLanguage.label}
              </Button>

              {activeDropdown === "language" && (
                <Box
                  role='listbox'
                  aria-label='Select language'
                  sx={{
                    ...dropdownPanelSx,
                    right: 0,
                    mt: 1,
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}>
                  <Box sx={{ py: 1 }}>
                    {LANGUAGES.map(lang => (
                      <Button
                        key={lang.code}
                        role='option'
                        aria-selected={selectedLanguage.code === lang.code}
                        onClick={() => handleLanguageChange(lang)}
                        sx={{
                          width: "100%",
                          justifyContent: "flex-start",
                          px: 2,
                          py: 1,
                          fontSize: 12,
                          textTransform: "none",
                          color: selectedLanguage.code === lang.code ? "black" : "rgba(0,0,0,0.6)",
                          fontWeight: selectedLanguage.code === lang.code ? 600 : 400,
                          "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                        }}>
                        {lang.label}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Auth */}
            {loading ? (
              <CircularProgress size={24} sx={{ color: "rgba(0,0,0,0.6)" }} />
            ) : user ? (
              <>
                <MessageBell />
                <NotificationBell />
                {/* Profile dropdown */}
                <Box sx={{ position: "relative" }}>
                <Button
                  onClick={() => handleDropdownToggle("profile")}
                  aria-haspopup='menu'
                  aria-expanded={activeDropdown === "profile"}
                  aria-label='Profile menu'
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    height: 44,
                    fontSize: 12,
                    color: "rgba(0,0,0,0.8)",
                    textTransform: "none",
                    "&:hover": { color: "black", bgcolor: "transparent" },
                  }}>
                  <Avatar src={profileImageSrc} alt={user.name} sx={{ width: 24, height: 24 }}>
                    {!profileImageSrc && user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <span>{user.name}</span>
                  <KeyboardArrowDownIcon
                    sx={{
                      fontSize: 14,
                      opacity: 0.6,
                      transition: "transform 0.2s",
                      transform: activeDropdown === "profile" ? "rotate(180deg)" : "none",
                    }}
                  />
                </Button>

                {activeDropdown === "profile" && (
                  <Box
                    role='menu'
                    sx={{
                      ...dropdownPanelSx,
                      width: 260,
                      right: 0,
                      mt: 1,
                      borderRadius: 1.5,
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}>
                    {/* Profile header */}
                    <Box sx={{ p: 1.5, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1 }}>
                        <Avatar src={profileImageSrc} alt={user.name} sx={{ width: 40, height: 40 }}>
                          {!profileImageSrc && user.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{user.name}</Typography>
                          <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)", textTransform: "capitalize" }}>
                            {currentMode} mode
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Mode switcher */}
                    <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "rgba(0,0,0,0.6)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          mb: 1,
                        }}>
                        Mode
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {(["freelancer", "client"] as const).map(mode => {
                          const hasRole = mode === "freelancer" ? isFreelancer : isClient;
                          // For a role the user doesn't have yet, the button doubles as the
                          // "Start selling / Start hiring" CTA that opens the enable-role dialog.
                          const label = hasRole
                            ? mode.charAt(0).toUpperCase() + mode.slice(1)
                            : mode === "freelancer" ? "Start selling" : "Start hiring";
                          return (
                            <Button
                              key={mode}
                              onClick={() => handleModeSwitch(mode)}
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
                              {label}
                            </Button>
                          );
                        })}
                      </Box>
                    </Box>

                    {/* Menu items */}
                    <Box role='group' sx={{ py: 1 }}>
                      {[
                        ...(user?.is_admin
                          ? [{
                              href: "/admin",
                              icon: <ShieldIcon sx={{ fontSize: 14, color: "rgba(0,0,0,0.6)", mr: 1 }} />,
                              label: "Go to Admin Dashboard",
                            }]
                          : []),
                        {
                          href: currentMode === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client",
                          icon: <BriefcaseIcon sx={{ fontSize: 14, color: "rgba(0,0,0,0.6)", mr: 1 }} />,
                          label: currentMode === "freelancer" ? "Freelancer Space" : "Client Space",
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
                          role='menuitem'
                          component={Link as React.ElementType}
                          href={item.href}
                          onClick={() => setActiveDropdown(null)}
                          sx={{
                            width: "100%",
                            justifyContent: "flex-start",
                            px: 2,
                            py: 1.25,
                            fontSize: 12,
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
                    <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.08)", p: 1 }}>
                      <Button
                        role='menuitem'
                        onClick={handleLogout}
                        sx={{
                          width: "100%",
                          justifyContent: "flex-start",
                          px: 2,
                          py: 1.25,
                          fontSize: 12,
                          color: "#dc2626",
                          borderRadius: 1,
                          textTransform: "none",
                          "&:hover": { bgcolor: "#fef2f2" },
                        }}>
                        <Logout sx={{ fontSize: 14, mr: 1 }} />
                        Logout
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
              </>
            ) : (
              // Not logged in
              <Button
                component={Link as React.ElementType}
                href='/auth/sign-in'
                sx={{
                  ml: 1,
                  px: 2,
                  height: 32,
                  fontSize: 12,
                  color: "white !important",
                  fontWeight: "bold",
                  bgcolor: "black",
                  borderRadius: 25,
                  textTransform: "none",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                }}>
                Sign In
              </Button>
            )}
          </Box>
        </Box>

        {/* ── Mobile Hamburger (hidden on desktop) ─────────────────────────────── */}
        <IconButton
          onClick={() => setMobileOpen(true)}
          aria-label='Open navigation menu'
          sx={{ display: { xs: "flex", lg: "none" } }}>
          <MenuIcon />
        </IconButton>

        <MobileDrawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
          user={user}
          loading={loading}
          onLogout={handleLogout}
          currentMode={currentMode}
          onModeSwitch={handleModeSwitch}
        />

        {/* ── Enable second role dialog (Start selling / Start hiring) ───────────── */}
        <Dialog
          open={profileDialogOpen}
          onClose={handleDialogClose}
          slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 400, p: 1 } } }}>
          <DialogTitle sx={{ fontSize: 18, fontWeight: 600, pb: 1 }}>
            {profileDialogType === "freelancer" ? "Start selling on KickAir" : "Start hiring on KickAir"}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: 14, color: "rgba(0,0,0,0.6)" }}>
              {profileDialogType === "freelancer"
                ? "Enable your freelancer account to offer services and apply to jobs. It's free — you can set up your profile next."
                : "Enable your client account to post jobs and hire freelancers. It's free and only takes a moment."}
            </Typography>
            {profileDialogError && <Typography sx={{ fontSize: 13, color: "#dc2626", mt: 1.5 }}>{profileDialogError}</Typography>}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleDialogClose}
              disabled={profileDialogLoading}
              sx={{
                textTransform: "none",
                fontSize: 13,
                color: "rgba(0,0,0,0.6)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
              }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateProfile}
              disabled={profileDialogLoading}
              sx={{
                textTransform: "none",
                fontSize: 13,
                bgcolor: "black",
                color: "white",
                px: 3,
                borderRadius: 2,
                "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
              }}>
              {profileDialogLoading ? <CircularProgress size={16} sx={{ color: "white" }} /> : profileDialogType === "freelancer" ? "Start selling" : "Start hiring"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
