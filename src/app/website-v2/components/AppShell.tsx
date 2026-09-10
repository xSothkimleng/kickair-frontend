"use client";

import { Bell, ChevronDown, Globe, MessageCircle, Wallet } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { crossFade, material, spring, text } from "../design";
import { Avatar } from "../ui";

/**
 * Workspace chrome.
 *
 * Keeps the shape the live site already has — global top bar, a page header, and
 * a horizontal tab strip — and rebuilds it against the design system rather than
 * replacing the structure. People already know where things are here; §16
 * Familiarity says only break a familiar pattern if you can prove it is better.
 *
 * What changes is the treatment: the bar is a translucent material with content
 * scrolling under it, the tab strip is a second sticky layer with a sliding
 * indicator, and the header sets a real type hierarchy instead of one size.
 */

export interface Tab {
  label: string;
  href?: string;
}

const NAV = [
  { label: "Explore Services", href: "/website-v2/explore" },
  { label: "Why KickAir", menu: ["How escrow works", "Disputes", "Reviews", "Kick Air Pro"] },
  { label: "For Freelancers", menu: ["Freelancer Space", "Find jobs", "Kick Air University", "Get verified"] },
  { label: "For Clients", menu: ["Client Space", "Post a job", "Browse services", "Payments"] },
];

const bar = css({ position: "fixed", top: 0, left: 0, right: 0, zIndex: 60, height: "3.5rem" });
const materialLayer = css({ position: "absolute", inset: 0, pointerEvents: "none" });

const barInner = css({
  position: "relative", height: "100%", maxW: "94rem", mx: "auto",
  px: { base: "1rem", lg: "1.75rem" },
  display: "flex", alignItems: "center", gap: "1.5rem",
});

const wordmark = css({
  fontSize: "1.0625rem", fontWeight: 600, letterSpacing: "-0.022em",
  color: "var(--v2-primary)", flexShrink: 0,
});

const navRow = css({ display: { base: "none", lg: "flex" }, alignItems: "center", gap: "0.125rem" });

const navBtn = cx(
  text.onMaterial,
  css({
    display: "inline-flex", alignItems: "center", gap: "0.25rem",
    px: "0.6875rem", height: "2rem", borderRadius: "var(--v2-r-chip)",
    bg: "transparent", border: "none", fontFamily: "inherit", cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    _hover: { color: "var(--v2-primary)" },
  })
);

const menuCard = css({
  position: "absolute", top: "calc(100% + 0.5rem)", left: 0, zIndex: 70,
  minWidth: "13rem", p: "0.375rem",
  bg: "var(--v2-white)", borderRadius: "var(--v2-r-tile)",
  boxShadow: "inset 0 0 0 1px var(--v2-hairline), var(--v2-sh-float)",
});

const menuItem = css({
  display: "block", width: "100%", px: "0.625rem", height: "2.125rem",
  lineHeight: "2.125rem", borderRadius: "0.375rem",
  fontSize: "0.8125rem", textAlign: "left", color: "var(--v2-primary)",
  bg: "transparent", border: "none", fontFamily: "inherit", cursor: "pointer",
  _hover: { bg: "var(--v2-canvas)" },
});

const utils = css({ display: "flex", alignItems: "center", gap: "0.5rem", ml: "auto" });

const utilGhost = cx(
  text.onMaterial,
  css({
    display: { base: "none", md: "inline-flex" }, alignItems: "center", gap: "0.3125rem",
    px: "0.5rem", height: "2rem", borderRadius: "var(--v2-r-chip)",
    bg: "transparent", border: "none", fontFamily: "inherit", cursor: "pointer",
    _hover: { color: "var(--v2-primary)" },
  })
);

/** The wallet reads as money, so tabular figures and a defined edge. */
const walletPill = css({
  display: "inline-flex", alignItems: "center", gap: "0.4375rem",
  px: "0.75rem", height: "2.125rem", borderRadius: "var(--v2-r-pill)",
  bg: "var(--v2-white)", boxShadow: "inset 0 0 0 1px var(--v2-hairline)",
  fontSize: "0.8125rem", fontWeight: 600, color: "var(--v2-primary)",
  fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em",
  border: "none", fontFamily: "inherit", cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
});

const iconBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  w: "2.125rem", h: "2.125rem", borderRadius: "var(--v2-r-pill)",
  bg: "transparent", border: "none", color: "var(--v2-secondary)",
  cursor: "pointer", WebkitTapHighlightColor: "transparent",
  _hover: { bg: "rgba(10,10,11,0.05)", color: "var(--v2-primary)" },
});

const userBtn = css({
  display: "inline-flex", alignItems: "center", gap: "0.4375rem",
  pl: "0.25rem", pr: "0.5rem", height: "2.375rem", borderRadius: "var(--v2-r-pill)",
  bg: "transparent", border: "none", fontFamily: "inherit", cursor: "pointer",
  fontSize: "0.8125rem", fontWeight: 500, color: "var(--v2-primary)",
  WebkitTapHighlightColor: "transparent",
  _hover: { bg: "rgba(10,10,11,0.05)" },
});

/* ── Header + tabs ───────────────────────────────────────────────────────── */

const headerWrap = css({ bg: "var(--v2-white)", pt: "3.5rem" });
const headerInner = css({
  maxW: "94rem", mx: "auto", px: { base: "1.25rem", lg: "1.75rem" },
  pt: { base: "1.75rem", md: "2.25rem" }, pb: "1.25rem",
});

/**
 * §12 — the tab strip is a second floating layer under the bar, so it gets the
 * same material and sits at the bar's height. Content passes beneath both.
 */
const tabWrap = css({
  position: "sticky", top: "3.5rem", zIndex: 50,
  bg: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(20px) saturate(180%)",
  boxShadow: "inset 0 -1px 0 var(--v2-hairline)",
  "@media (prefers-reduced-transparency: reduce)": { bg: "var(--v2-white)", backdropFilter: "none" },
});

const tabRow = css({
  maxW: "94rem", mx: "auto", px: { base: "1.25rem", lg: "1.75rem" },
  display: "flex", gap: "0.25rem",
  overflowX: "auto", scrollbarWidth: "none",
  "&::-webkit-scrollbar": { display: "none" },
});

const tab = css({
  position: "relative", flexShrink: 0,
  px: "0.875rem", height: "2.875rem",
  display: "inline-flex", alignItems: "center",
  fontSize: "0.875rem", letterSpacing: "-0.004em",
  bg: "transparent", border: "none", fontFamily: "inherit", cursor: "pointer",
  whiteSpace: "nowrap", WebkitTapHighlightColor: "transparent",
});

const tabUnderline = css({
  position: "absolute", left: "0.875rem", right: "0.875rem", bottom: 0,
  height: "2px", borderRadius: "2px", bg: "var(--v2-primary)",
});

const content = css({
  maxW: "94rem", mx: "auto",
  px: { base: "1.25rem", lg: "1.75rem" },
  pt: "1.5rem", pb: "4rem",
});

function NavMenu({ label, items }: { label: string; items: string[] }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  return (
    <div className={css({ position: "relative" })}>
      <button type="button" className={navBtn} onClick={() => setOpen((o) => !o)}>
        {label}
        <ChevronDown size={13} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className={css({ position: "fixed", inset: 0, zIndex: 65 })} onClick={() => setOpen(false)} />
            {/* §7 — the menu scales from its trigger, not from its own centre. */}
            <motion.div
              className={menuCard}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
              transition={reduced ? crossFade : spring.quick}
              style={{ transformOrigin: "top left" }}
            >
              {items.map((i) => (
                <button key={i} type="button" className={menuItem} onClick={() => setOpen(false)}>
                  {i}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface Props {
  title: string;
  subtitle: string;
  tabs: Tab[];
  activeTab: string;
  user: string;
  balance: number;
  children: ReactNode;
}

export default function AppShell({ title, subtitle, tabs, activeTab, user, balance, children }: Props) {
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  return (
    <div className={css({ bg: "var(--v2-canvas)", minHeight: "100vh" })}>
      <header className={bar}>
        <motion.div
          aria-hidden
          className={cx(materialLayer, material)}
          initial={false}
          animate={{ opacity: 1 }}
          transition={spring.ui}
          style={{ boxShadow: scrolled ? "var(--v2-sh-chrome)" : "none" }}
        />
        <div className={barInner}>
          <Link href="/website-v2" className={wordmark}>Kick Air</Link>

          <nav className={navRow}>
            {NAV.map((n) =>
              n.menu ? (
                <NavMenu key={n.label} label={n.label} items={n.menu} />
              ) : (
                <Link key={n.label} href={n.href!} className={navBtn}>{n.label}</Link>
              )
            )}
          </nav>

          <div className={utils}>
            <button type="button" className={utilGhost}>
              <Globe size={14} aria-hidden /> English
            </button>
            <button type="button" className={walletPill}>
              <Wallet size={14} strokeWidth={2} aria-hidden />
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </button>
            <button type="button" className={iconBtn} aria-label="Messages">
              <MessageCircle size={17} strokeWidth={1.9} aria-hidden />
            </button>
            <button type="button" className={iconBtn} aria-label="Notifications">
              <Bell size={17} strokeWidth={1.9} aria-hidden />
            </button>
            <button type="button" className={userBtn}>
              <Avatar name={user} size={28} />
              <span className={css({ display: { base: "none", sm: "inline" } })}>{user}</span>
              <ChevronDown size={13} className={css({ color: "var(--v2-tertiary)" })} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <div className={headerWrap}>
        <div className={headerInner}>
          <h1 className={cx(text.title, css({ color: "var(--v2-primary)" }))}>{title}</h1>
          <p className={cx(text.body, css({ color: "var(--v2-secondary)", mt: "0.4375rem" }))}>{subtitle}</p>
        </div>

        <div className={tabWrap}>
          <div className={tabRow}>
            {tabs.map((t) => {
              const on = t.label === activeTab;
              const inner = (
                <>
                  {t.label}
                  {on && (
                    /* §3/§7 — one shared indicator slides between tabs, so the
                       move shows where you came from instead of blinking. */
                    <motion.span
                      layoutId="tab-underline"
                      aria-hidden
                      className={tabUnderline}
                      transition={reduced ? { duration: 0.15 } : spring.ui}
                    />
                  )}
                </>
              );
              const cls = tab;
              const style = { color: on ? "var(--v2-primary)" : "var(--v2-secondary)", fontWeight: on ? 600 : 450 };
              return t.href ? (
                <Link key={t.label} href={t.href} className={cls} style={style}>{inner}</Link>
              ) : (
                <button key={t.label} type="button" className={cls} style={style}>{inner}</button>
              );
            })}
          </div>
        </div>
      </div>

      <main className={content}>{children}</main>
    </div>
  );
}
