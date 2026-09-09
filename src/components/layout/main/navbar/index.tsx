"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BookOpen, Briefcase, ChevronDown, CircleHelp, Globe, LogOut, Menu as MenuIcon, Search, Settings as SettingsIcon, Shield, Users, Zap } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Avatar, Dialog, Portal, Spinner, iconButton } from "@/components/ds";
import { useAuth } from "@/components/context/AuthContext";
import { type DropdownType, type UserMode, type Language, LANGUAGES } from "./types";
import { dropdownPanelRaw, muiBtnRaw, navBtnCss, modeBtnOnCss, modeBtnOffCss } from "./styles";
import { DropdownItem } from "./DropdownItem";
import { MobileDrawer } from "./MobileDrawer";
import { NotificationBell } from "./NotificationBell";
import { MessageBell } from "./MessageBell";
import { WalletChip } from "./WalletChip";

// The desktop/hamburger switch keeps MUI's exact `lg` breakpoint (1200px) via a
// literal media query — Panda's `lg` token is 1024px.
const navCss = css({ position: "sticky", top: 0, zIndex: 1100, bg: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" });
const containerCss = css({ w: "100%", maxW: "1200px", mx: "auto", boxSizing: "border-box", px: { base: "16px", sm: "24px" }, display: "flex", alignItems: "center", justifyContent: "space-between" });
const logoWrapCss = css({ display: "block", h: "48px" });
const logoCss = css({ objectFit: "contain", mt: "5px" });
const desktopCss = css({ display: "none", alignItems: "center", gap: "20px", "@media (min-width: 1200px)": { display: "flex" } });
const navGroupCss = css({ display: "flex", gap: "10px", alignItems: "center" });
const relCss = css({ position: "relative" });
const navChevronCss = css({ ml: "8px", mr: "-4px", flexShrink: 0, transition: "transform 0.2s" });
const openCss = css({ transform: "rotate(180deg)" });
const megaPanelCss = css(dropdownPanelRaw, { left: "50%", transform: "translateX(-50%)" });
const megaInnerCss = css({ p: "24px" });
const megaLeadCss = css({ fontSize: "11px", color: "rgba(0,0,0,0.6)", mb: "16px", lineHeight: 1.5 });
const megaListCss = css({ display: "flex", flexDirection: "column", gap: "4px" });
const ddIconCss = css({ color: "rgba(0,0,0,0.6)", display: "block" });
const rightGroupCss = css({ display: "flex", alignItems: "center", gap: "10px" });
const langBtnCss = css(muiBtnRaw, { fontSize: "12px", gap: "4px", color: "rgba(0,0,0,0.7)", _hover: { bg: "rgba(0,0,0,0.04)" } });
const langPanelCss = css(dropdownPanelRaw, { right: 0, mt: "8px", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" });
const langListCss = css({ py: "8px" });
const langOptRaw = css.raw({ w: "100%", justifyContent: "flex-start", px: "16px", py: "8px", fontSize: "12px", _hover: { bg: "rgba(0,0,0,0.04)" } });
const langOptOnCss = css(muiBtnRaw, langOptRaw, { color: "black", fontWeight: 600 });
const langOptOffCss = css(muiBtnRaw, langOptRaw, { color: "rgba(0,0,0,0.6)", fontWeight: 400 });
const spinnerCss = css({ color: "rgba(0,0,0,0.6)" });
const profileBtnCss = css(muiBtnRaw, { display: "flex", alignItems: "center", gap: "8px", px: "12px", h: "44px", fontSize: "12px", color: "rgba(0,0,0,0.8)", _hover: { color: "black", bg: "transparent" } });
const profileChevronCss = css({ opacity: 0.6, flexShrink: 0, transition: "transform 0.2s" });
const menuPanelCss = css(dropdownPanelRaw, { width: "360px", right: 0, mt: "8px", borderRadius: "6px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" });
const menuHeaderCss = css({ p: "12px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "rgba(0,0,0,0.08)" });
const menuHeaderRowCss = css({ display: "flex", alignItems: "center", gap: "12px", px: "8px" });
const menuNameCss = css({ fontSize: "13px", fontWeight: 500, lineHeight: 1.5 });
const menuModeTextCss = css({ fontSize: "11px", color: "rgba(0,0,0,0.6)", textTransform: "capitalize", lineHeight: 1.5 });
const modeBoxCss = css({ p: "16px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "rgba(0,0,0,0.08)" });
const modeLabelCss = css({ fontSize: "11px", color: "rgba(0,0,0,0.6)", textTransform: "uppercase", letterSpacing: "0.05em", mb: "8px", lineHeight: 1.5 });
const modeRowCss = css({ display: "flex", gap: "8px" });
const menuGroupCss = css({ py: "8px" });
const menuItemCss = css(muiBtnRaw, { w: "100%", justifyContent: "flex-start", px: "16px", py: "10px", fontSize: "12px", color: "black", _hover: { bg: "rgba(0,0,0,0.04)" } });
const menuIconCss = css({ color: "rgba(0,0,0,0.6)", mr: "8px", flexShrink: 0 });
const logoutBoxCss = css({ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(0,0,0,0.08)", p: "8px" });
const logoutCss = css(muiBtnRaw, { w: "100%", justifyContent: "flex-start", px: "16px", py: "10px", fontSize: "12px", color: "#dc2626", borderRadius: "4px", _hover: { bg: "#fef2f2" } });
const logoutIconCss = css({ mr: "8px", flexShrink: 0 });
// `<a>` colour needs !important: globals.css sets `a { color: inherit }` outside any layer.
const signInCss = css(muiBtnRaw, { ml: "8px", px: "16px", h: "32px", fontSize: "12px", color: "white !important", fontWeight: 700, bg: "black", borderRadius: "100px", _hover: { bg: "rgba(0,0,0,0.8)" } });
const hamburgerCss = css(iconButton.raw({ size: "md" }), { w: "40px", h: "40px", color: "rgba(0,0,0,0.54)", _hover: { bg: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.54)" }, "@media (min-width: 1200px)": { display: "none" } });
// Enable-second-role dialog — keeps the MUI Dialog geometry (600px paper, 12px radius, 8px paper padding).
const dlgBackdropCss = css({ position: "fixed", inset: 0, bg: "rgba(0,0,0,0.5)", zIndex: 1300 });
const dlgPositionerCss = css({ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center" });
const dlgPaperCss = css({ bg: "white", borderRadius: "12px", w: "600px", minW: "400px", maxW: "calc(100vw - 64px)", maxH: "calc(100vh - 64px)", m: "32px", p: "8px", overflowY: "auto", display: "flex", flexDirection: "column", boxShadow: "0 11px 15px -7px rgba(0,0,0,0.2), 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12)", _focus: { outline: "none" } });
const dlgContentCss = css({ px: "24px", py: "20px" });
const dlgTitleWrapCss = css({ pb: "8px" });
const dlgTitleCss = css({ fontSize: "18px", fontWeight: 600, lineHeight: 1.5, color: "rgba(0,0,0,0.87)" });
const dlgBodyCss = css({ fontSize: "14px", lineHeight: 1.5, color: "rgba(0,0,0,0.6)" });
const dlgErrorCss = css({ fontSize: "13px", color: "#dc2626", pt: "12px", lineHeight: 1.5 });
const dlgActionsCss = css({ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", px: "24px", pt: "8px", pb: "16px" });
const dlgCancelCss = css(muiBtnRaw, { fontSize: "13px", color: "rgba(0,0,0,0.6)", _hover: { bg: "rgba(0,0,0,0.04)" }, _disabled: { color: "rgba(0,0,0,0.26)" } });
const dlgPrimaryCss = css(muiBtnRaw, { fontSize: "13px", bg: "black", color: "white", px: "24px", borderRadius: "8px", _hover: { bg: "rgba(0,0,0,0.8)" } });
const whiteSpinnerCss = css({ color: "white" });

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

  // Pending close for the hover mega-menus — lets the mouse cross the small gap
  // between a trigger and its panel (or between adjacent triggers) without the
  // menu flickering shut, while still closing reliably once the mouse leaves.
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Close any open dropdown (hover menus + profile/language) on route change,
  // and drop any pending hover-close so it can't fire against the new page.
  useEffect(() => {
    setActiveDropdown(null);
    if (hoverCloseTimer.current) {
      clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  }, [pathname]);

  // The navbar is sticky, so scrolling keeps a trigger under the cursor while
  // the page moves — close hover menus so they don't hang over shifted content.
  useEffect(() => {
    const handleScroll = () => {
      setActiveDropdown(prev => (prev === "why" || prev === "freelancer" || prev === "client" ? null : prev));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Clear any pending hover-close timer on unmount
  useEffect(() => {
    return () => {
      if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    };
  }, []);

  // Per-account storage key so one account's mode never carries over to another.
  const modeKey = user ? `kickair_mode:u${user.id}` : null;

  // Restore the last-used mode so neutral pages don't reset a dual-role user's view.
  useEffect(() => {
    if (!modeKey) return;
    try {
      const saved = localStorage.getItem(modeKey);
      if (saved === "client" || saved === "freelancer") setModePref(saved);
    } catch {
      // localStorage unavailable in private browsing / SSR
    }
  }, [modeKey]);

  // Remember the mode whenever the user lands on a mode-specific dashboard.
  useEffect(() => {
    if (!urlMode) return;
    setModePref(urlMode);
    if (!modeKey) return;
    try {
      localStorage.setItem(modeKey, urlMode);
    } catch {
      // ignore
    }
  }, [urlMode, modeKey]);

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
    cancelHoverClose();
    setActiveDropdown(prev => (prev === dropdown ? null : dropdown));
  };

  // ── Hover mega-menu open/close ────────────────────────────────────────────
  const isHoverMenu = (d: DropdownType) => d === "why" || d === "freelancer" || d === "client";

  const cancelHoverClose = () => {
    if (hoverCloseTimer.current) {
      clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  };

  // Opening a hover menu replaces whatever surface is open — including the
  // click-opened profile/language dropdowns — so only one panel shows at a time.
  const openHoverMenu = (menu: DropdownType) => {
    cancelHoverClose();
    setActiveDropdown(menu);
  };

  // Immediate close for hover menus only (leaves profile/language alone)
  const closeHoverMenuNow = () => {
    cancelHoverClose();
    setActiveDropdown(prev => (isHoverMenu(prev) ? null : prev));
  };

  // Slightly delayed close: fired on mouseleave of a trigger/panel region, and
  // cancelled if the mouse re-enters one before the timer runs out.
  const scheduleHoverClose = () => {
    cancelHoverClose();
    hoverCloseTimer.current = setTimeout(() => {
      hoverCloseTimer.current = null;
      setActiveDropdown(prev => (isHoverMenu(prev) ? null : prev));
    }, 200);
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

  // Enable the second account role (Become a freelancer / Become a client). No KYC gate — this
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
      try {
        localStorage.removeItem("kickair_mode"); // legacy unscoped key
      } catch {
        /* ignore */
      }
      setActiveDropdown(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav role='navigation' aria-label='Main navigation' className={navCss}>
      <div className={containerCss}>
        {/* Logo */}
        <span className={logoWrapCss}>
          <Link href='/'>
            <Image src='/assets/images/kickair-logo.png' alt='KickAir' width={100} height={38} className={logoCss} />
          </Link>
        </span>

        {/* ── Desktop Nav ──────────────────────────────────────────────────────── */}
        <div className={desktopCss}>
          {/* Hover state: entering any trigger opens (or switches) its menu; leaving a
              trigger/panel region schedules a short-delay close that re-entering cancels,
              so sliding between trigger and panel never flickers, but leaving closes. */}
          <div className={navGroupCss} onMouseLeave={scheduleHoverClose}>
            {/* Explore Services — no dropdown, so hovering it clears any open hover menu */}
            <Link href='/explore-services' onMouseEnter={closeHoverMenuNow} className={navBtnCss}>
              Explore Services
            </Link>

            {/* Why KickAir ▾ */}
            <div className={relCss} onMouseEnter={() => openHoverMenu("why")} onMouseLeave={scheduleHoverClose}>
              <button type='button' aria-haspopup='true' aria-expanded={activeDropdown === "why"} className={navBtnCss}>
                Why KickAir
                <ChevronDown size={20} className={cx(navChevronCss, activeDropdown === "why" && openCss)} />
              </button>

              {activeDropdown === "why" && (
                <div className={megaPanelCss}>
                  <div className={megaInnerCss}>
                    <div className={megaLeadCss}>Learn why KickAir is the best platform for freelancing</div>
                    <div className={megaListCss}>
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
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* For Freelancers ▾ */}
            <div className={relCss} onMouseEnter={() => openHoverMenu("freelancer")} onMouseLeave={scheduleHoverClose}>
              <button type='button' aria-haspopup='true' aria-expanded={activeDropdown === "freelancer"} className={navBtnCss}>
                For Freelancers
                <ChevronDown size={20} className={cx(navChevronCss, activeDropdown === "freelancer" && openCss)} />
              </button>

              {activeDropdown === "freelancer" && (
                <div className={megaPanelCss}>
                  <div className={megaInnerCss}>
                    <div className={megaLeadCss}>Learn, earn, and grow your freelance career</div>
                    <div className={megaListCss}>
                      <DropdownItem
                        icon={<Zap size={20} className={ddIconCss} />}
                        title='Post Your Service'
                        description='Create your service listing with three-tier pricing'
                        onClick={goToCreateService}
                      />
                      <DropdownItem
                        icon={<Briefcase size={20} className={ddIconCss} />}
                        title='Opportunities'
                        description='Find gigs, part-time & full-time work'
                        href='/jobs'
                        onClick={() => setActiveDropdown(null)}
                      />
                      <DropdownItem
                        icon={<BookOpen size={20} className={ddIconCss} />}
                        title='KickAir University'
                        description='Master freelancing skills, pricing strategies, and client management'
                        href='/kick-air-university'
                        onClick={() => setActiveDropdown(null)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* For Clients ▾ */}
            <div className={relCss} onMouseEnter={() => openHoverMenu("client")} onMouseLeave={scheduleHoverClose}>
              <button type='button' aria-haspopup='true' aria-expanded={activeDropdown === "client"} className={navBtnCss}>
                For Clients
                <ChevronDown size={20} className={cx(navChevronCss, activeDropdown === "client" && openCss)} />
              </button>

              {activeDropdown === "client" && (
                <div className={megaPanelCss}>
                  <div className={megaInnerCss}>
                    <div className={megaLeadCss}>Get work done with trusted freelancers</div>
                    <div className={megaListCss}>
                      <DropdownItem
                        icon={<BookOpen size={20} className={ddIconCss} />}
                        title='KickAir University'
                        description='Learn project management and hiring best practices'
                        href='/kick-air-university'
                        onClick={() => setActiveDropdown(null)}
                      />
                      <DropdownItem
                        icon={<Search size={20} className={ddIconCss} />}
                        title='Explore Services'
                        description='Browse freelancer offerings'
                        href='/explore-services'
                        onClick={() => setActiveDropdown(null)}
                      />
                      <DropdownItem
                        icon={<Users size={20} className={ddIconCss} />}
                        title='Find Freelancers'
                        description='One-off jobs & projects'
                        href='/find-freelancer'
                        onClick={() => setActiveDropdown(null)}
                      />
                      <DropdownItem
                        icon={<Briefcase size={20} className={ddIconCss} />}
                        title='Post Your Gig'
                        description='Create a service listing to sell'
                        onClick={goToCreateService}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Side: Language + Auth ──────────────────────────────────────── */}
          {/* Single ref covers both click-based dropdowns */}
          <div ref={clickDropdownRef} className={rightGroupCss}>
            {/* Language ▾ */}
            <div className={relCss}>
              <button
                type='button'
                onClick={() => handleDropdownToggle("language")}
                aria-haspopup='listbox'
                aria-expanded={activeDropdown === "language"}
                aria-label={`Language: ${selectedLanguage.label}`}
                className={langBtnCss}>
                <Globe size={14} />
                {selectedLanguage.label}
              </button>

              {activeDropdown === "language" && (
                <div role='listbox' aria-label='Select language' className={langPanelCss}>
                  <div className={langListCss}>
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        type='button'
                        role='option'
                        aria-selected={selectedLanguage.code === lang.code}
                        onClick={() => handleLanguageChange(lang)}
                        className={selectedLanguage.code === lang.code ? langOptOnCss : langOptOffCss}>
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Auth */}
            {loading ? (
              <Spinner size={24} className={spinnerCss} />
            ) : user ? (
              <>
                <WalletChip />
                <MessageBell />
                <NotificationBell />
                {/* Profile dropdown */}
                <div className={relCss}>
                  <button
                    type='button'
                    onClick={() => handleDropdownToggle("profile")}
                    aria-haspopup='menu'
                    aria-expanded={activeDropdown === "profile"}
                    aria-label='Profile menu'
                    className={profileBtnCss}>
                    <Avatar src={profileImageSrc} name={user.name} px={24} />
                    <span>{user.name}</span>
                    <ChevronDown size={14} className={cx(profileChevronCss, activeDropdown === "profile" && openCss)} />
                  </button>

                  {activeDropdown === "profile" && (
                    <div role='menu' className={menuPanelCss}>
                      {/* Profile header */}
                      <div className={menuHeaderCss}>
                        <div className={menuHeaderRowCss}>
                          <Avatar src={profileImageSrc} name={user.name} px={40} />
                          <div>
                            <div className={menuNameCss}>{user.name}</div>
                            <div className={menuModeTextCss}>{currentMode} mode</div>
                          </div>
                        </div>
                      </div>

                      {/* Mode switcher */}
                      <div className={modeBoxCss}>
                        <div className={modeLabelCss}>Mode</div>
                        <div className={modeRowCss}>
                          {(["freelancer", "client"] as const).map(mode => {
                            const hasRole = mode === "freelancer" ? isFreelancer : isClient;
                            // For a role the user doesn't have yet, the button doubles as the
                            // "Become a freelancer / Become a client" CTA that opens the enable-role dialog.
                            const label = hasRole
                              ? mode.charAt(0).toUpperCase() + mode.slice(1)
                              : mode === "freelancer"
                                ? "Become a freelancer"
                                : "Become a client";
                            return (
                              <button
                                key={mode}
                                type='button'
                                onClick={() => handleModeSwitch(mode)}
                                className={currentMode === mode ? modeBtnOnCss : modeBtnOffCss}>
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Menu items */}
                      <div role='group' className={menuGroupCss}>
                        {[
                          ...(user?.is_admin
                            ? [
                                {
                                  href: "/admin",
                                  icon: <Shield size={14} className={menuIconCss} />,
                                  label: "Go to Admin Dashboard",
                                },
                              ]
                            : []),
                          {
                            href: currentMode === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client",
                            icon: <Briefcase size={14} className={menuIconCss} />,
                            label: currentMode === "freelancer" ? "Freelancer Space" : "Client Space",
                          },
                          {
                            href: "/settings",
                            icon: <SettingsIcon size={14} className={menuIconCss} />,
                            label: "Settings",
                          },
                          {
                            href: "/help",
                            icon: <CircleHelp size={14} className={menuIconCss} />,
                            label: "Help & Support",
                          },
                        ].map(item => (
                          <Link key={item.href} role='menuitem' href={item.href} onClick={() => setActiveDropdown(null)} className={menuItemCss}>
                            {item.icon}
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className={logoutBoxCss}>
                        <button type='button' role='menuitem' onClick={handleLogout} className={logoutCss}>
                          <LogOut size={14} className={logoutIconCss} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Not logged in
              <Link href='/auth/sign-in' className={signInCss}>
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* ── Mobile Hamburger (hidden on desktop) ─────────────────────────────── */}
        <button type='button' onClick={() => setMobileOpen(true)} aria-label='Open navigation menu' className={hamburgerCss}>
          <MenuIcon size={24} />
        </button>

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

        {/* ── Enable second role dialog (Become a freelancer / Become a client) ──── */}
        <Dialog.Root open={profileDialogOpen} onOpenChange={d => { if (!d.open) handleDialogClose(); }} lazyMount unmountOnExit>
          <Portal>
            <Dialog.Backdrop className={dlgBackdropCss} />
            <Dialog.Positioner className={dlgPositionerCss}>
              <Dialog.Content className={dlgPaperCss}>
                <div className={dlgContentCss}>
                  <div className={dlgTitleWrapCss}>
                    <Dialog.Title className={dlgTitleCss}>
                      {profileDialogType === "freelancer" ? "Become a freelancer" : "Become a client"}
                    </Dialog.Title>
                  </div>
                  <Dialog.Description className={dlgBodyCss}>
                    {profileDialogType === "freelancer"
                      ? "Enable your freelancer account to offer services and apply to jobs. It's free — you can set up your profile next."
                      : "Enable your client account to post jobs and hire freelancers. It's free and only takes a moment."}
                  </Dialog.Description>
                  {profileDialogError && <div className={dlgErrorCss}>{profileDialogError}</div>}
                </div>
                <div className={dlgActionsCss}>
                  <button type='button' onClick={handleDialogClose} disabled={profileDialogLoading} className={dlgCancelCss}>
                    Cancel
                  </button>
                  <button type='button' onClick={handleCreateProfile} disabled={profileDialogLoading} className={dlgPrimaryCss}>
                    {profileDialogLoading ? (
                      <Spinner size={16} className={whiteSpinnerCss} />
                    ) : profileDialogType === "freelancer" ? (
                      "Become a freelancer"
                    ) : (
                      "Become a client"
                    )}
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </div>
    </nav>
  );
}
