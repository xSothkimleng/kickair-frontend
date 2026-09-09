"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Briefcase, ChevronDown, CircleHelp, LogOut, Settings as SettingsIcon, X } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Avatar, Divider, Drawer, Spinner, iconButton } from "@/components/ds";
import { LANGUAGES, type Language, type UserMode } from "./types";
import { WalletChip } from "./WalletChip";
import { muiBtnRaw, modeBtnOnCss, modeBtnOffCss } from "./styles";

export interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  user: { name: string; avatar_url?: string | null; is_freelancer?: boolean; is_client?: boolean } | null;
  loading: boolean;
  onLogout: () => Promise<void>;
  currentMode: UserMode;
  onModeSwitch: (mode: UserMode) => void;
}

type NavSection =
  | { label: string; href: string; items?: never }
  | { label: string; href?: never; items: { title: string; href: string; description: string; authGated?: boolean }[] };

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
      { title: "Post Your Service", href: "/dashboard/freelancer", description: "Create your service listing with three-tier pricing", authGated: true },
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
      { title: "Post Your Gig", href: "/dashboard/freelancer", description: "Create a service listing to sell", authGated: true },
    ],
  },
];

// The old MUI drawer paper was 280px wide; the ds Drawer's `sm` is min(320px, 100vw).
const panelCss = css({ maxW: "280px" });
const colCss = css({ display: "flex", flexDirection: "column", minH: "100%" });
const headerCss = css({ px: "16px", py: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "rgba(0,0,0,0.08)", flexShrink: 0 });
const logoCss = css({ objectFit: "contain" });
const closeBtnCss = css(iconButton.raw({ size: "sm" }), { color: "rgba(0,0,0,0.54)", _hover: { bg: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.54)" } });
const navBoxCss = css({ py: "8px", flexShrink: 0 });
const navItemCss = css(muiBtnRaw, { w: "100%", justifyContent: "flex-start", px: "20px", py: "10px", fontSize: "14px", color: "black", _hover: { bg: "rgba(0,0,0,0.04)" } });
const sectionChevronCss = css({ ml: "auto", mr: "-4px", flexShrink: 0, transition: "transform 0.2s" });
const openCss = css({ transform: "rotate(180deg)" });
const subBoxCss = css({ pl: "16px", pb: "8px" });
const subItemCss = css(muiBtnRaw, { w: "100%", justifyContent: "flex-start", px: "16px", py: "6px", color: "black", flexDirection: "column", alignItems: "flex-start", textAlign: "left", borderRadius: "4px", _hover: { bg: "rgba(0,0,0,0.04)" } });
const subTitleCss = css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.5 });
const subDescCss = css({ fontSize: "11px", color: "rgba(0,0,0,0.5)", lineHeight: 1.5 });
const langBoxCss = css({ px: "20px", py: "16px", flexShrink: 0 });
const sectionLabelCss = css({ fontSize: "11px", color: "rgba(0,0,0,0.6)", textTransform: "uppercase", letterSpacing: "0.05em", mb: "8px", lineHeight: 1.5 });
const langRowCss = css({ display: "flex", gap: "8px", flexWrap: "wrap" });
const langBtnRaw = css.raw({ px: "12px", py: "4px", fontSize: "12px", borderRadius: "8px" });
const langOnCss = css(muiBtnRaw, langBtnRaw, { bg: "black", color: "white", _hover: { bg: "black" } });
const langOffCss = css(muiBtnRaw, langBtnRaw, { bg: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.6)", _hover: { bg: "rgba(0,0,0,0.1)" } });
const authBoxCss = css({ px: "16px", py: "16px", mt: "auto", flexShrink: 0 });
const userRowCss = css({ display: "flex", alignItems: "center", gap: "12px", mb: "16px" });
const userTextCss = css({ flex: 1, minW: 0 });
const nameCss = css({ fontSize: "13px", fontWeight: 500, lineHeight: 1.5 });
const modeTextCss = css({ fontSize: "11px", color: "rgba(0,0,0,0.5)", textTransform: "capitalize", lineHeight: 1.5 });
const modeBoxCss = css({ mb: "16px" });
const modeRowCss = css({ display: "flex", gap: "8px" });
const linksCss = css({ display: "flex", flexDirection: "column", mb: "8px" });
const linkCss = css(muiBtnRaw, { w: "100%", justifyContent: "flex-start", px: "8px", py: "8px", fontSize: "13px", color: "black", _hover: { bg: "rgba(0,0,0,0.04)" } });
const linkIconCss = css({ color: "rgba(0,0,0,0.6)", mr: "8px", flexShrink: 0 });
const logoutCss = css(muiBtnRaw, { w: "100%", justifyContent: "flex-start", px: "8px", py: "8px", fontSize: "13px", color: "#dc2626", _hover: { bg: "#fef2f2" } });
const logoutIconCss = css({ mr: "8px", flexShrink: 0 });
// `<a>` colour needs !important: globals.css sets `a { color: inherit }` outside any layer.
const signInCss = css(muiBtnRaw, { w: "100%", bg: "black", color: "white !important", borderRadius: "100px", _hover: { bg: "rgba(0,0,0,0.8)" } });

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
    <Drawer open={open} onOpenChange={o => { if (!o) onClose(); }} side='left' size='sm' showClose={false} flush className={panelCss}>
      <div className={colCss}>
        {/* Header */}
        <div className={headerCss}>
          <Link href='/' onClick={onClose}>
            <Image src='/assets/images/kickair-logo.png' alt='KickAir' width={80} height={30} className={logoCss} />
          </Link>
          <button type='button' onClick={onClose} className={closeBtnCss} aria-label='Close menu'>
            <X size={20} />
          </button>
        </div>

        {/* Nav sections */}
        <div className={navBoxCss}>
          {NAV_SECTIONS.map(section => {
            if (!section.items) {
              return (
                <Link key={section.href} href={section.href} onClick={onClose} className={navItemCss}>
                  {section.label}
                </Link>
              );
            }

            const isOpen = expandedSection === section.label;
            return (
              <div key={section.label}>
                <button type='button' onClick={() => toggleSection(section.label)} className={navItemCss}>
                  {section.label}
                  <ChevronDown size={20} className={cx(sectionChevronCss, isOpen && openCss)} />
                </button>

                {isOpen && (
                  <div className={subBoxCss}>
                    {section.items.map(item => (
                      <Link
                        key={item.href + item.title}
                        href={item.authGated && !user ? "/auth/sign-in" : item.href}
                        onClick={onClose}
                        className={subItemCss}>
                        <div className={subTitleCss}>{item.title}</div>
                        <div className={subDescCss}>{item.description}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Divider />

        {/* Language selector */}
        <div className={langBoxCss}>
          <div className={sectionLabelCss}>Language</div>
          <div className={langRowCss}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                type='button'
                onClick={() => {
                  onLanguageChange(lang);
                  onClose();
                }}
                className={selectedLanguage.code === lang.code ? langOnCss : langOffCss}>
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Auth */}
        <div className={authBoxCss}>
          {loading ? (
            <Spinner size={20} />
          ) : user ? (
            <div>
              {/* User header */}
              <div className={userRowCss}>
                <Avatar src={avatarSrc} name={user.name} px={32} />
                <div className={userTextCss}>
                  <div className={nameCss}>{user.name}</div>
                  <div className={modeTextCss}>{currentMode} mode</div>
                </div>
                <WalletChip />
              </div>

              {/* Mode switcher */}
              <div className={modeBoxCss}>
                <div className={sectionLabelCss}>Mode</div>
                <div className={modeRowCss}>
                  {(["freelancer", "client"] as const).map(mode => {
                    const hasRole = mode === "freelancer" ? !!user?.is_freelancer : !!user?.is_client;
                    const label = hasRole
                      ? mode.charAt(0).toUpperCase() + mode.slice(1)
                      : mode === "freelancer" ? "Become a freelancer" : "Become a client";
                    return (
                      <button
                        key={mode}
                        type='button'
                        onClick={() => {
                          onModeSwitch(mode);
                          onClose();
                        }}
                        className={currentMode === mode ? modeBtnOnCss : modeBtnOffCss}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profile nav links */}
              <div className={linksCss}>
                {[
                  {
                    href: currentMode === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client",
                    icon: <Briefcase size={14} className={linkIconCss} />,
                    label: currentMode === "freelancer" ? "Freelancer Dashboard" : "Client Dashboard",
                  },
                  {
                    href: "/settings",
                    icon: <SettingsIcon size={14} className={linkIconCss} />,
                    label: "Settings",
                  },
                  {
                    href: "/help",
                    icon: <CircleHelp size={14} className={linkIconCss} />,
                    label: "Help & Support",
                  },
                ].map(item => (
                  <Link key={item.href} href={item.href} onClick={onClose} className={linkCss}>
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <button
                type='button'
                onClick={async () => {
                  await onLogout();
                  onClose();
                }}
                className={logoutCss}>
                <LogOut size={14} className={logoutIconCss} />
                Logout
              </button>
            </div>
          ) : (
            <Link href='/auth/sign-in' onClick={onClose} className={signInCss}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </Drawer>
  );
}
