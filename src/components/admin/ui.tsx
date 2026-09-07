"use client";

import { css, cva, cx } from "styled-system/css";
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useEffect, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, X } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────────
   Admin console design tokens. Scoped to the shell root as CSS variables so the
   console is independent of the MUI palette the user-facing site still uses.
   ──────────────────────────────────────────────────────────────────────────── */
export const tdVars = css({
  "--td-canvas": "#FFFFFF",
  "--td-surface": "#FFFFFF",
  "--td-surface-2": "#FAFAF8",
  "--td-hover": "#F3F3F0",
  "--td-ink": "#15171C",
  "--td-ink-2": "#5C616B",
  "--td-ink-3": "#8E939C",
  "--td-line": "#E8E8E4",
  "--td-line-2": "#D8D8D2",
  "--td-accent": "#3453E4",
  "--td-accent-hover": "#2B47C8",
  "--td-accent-soft": "#EDF0FD",
  "--td-green": "#1D8A57",
  "--td-green-soft": "#E5F5EC",
  "--td-amber": "#B26E12",
  "--td-amber-soft": "#FCF1DC",
  "--td-red": "#C63C36",
  "--td-red-soft": "#FCE8E6",
  "--td-blue": "#2B69D9",
  "--td-blue-soft": "#E7EFFC",
  "--td-purple": "#6B49DD",
  "--td-purple-soft": "#EEE9FC",
  "--td-shadow-sm": "0 1px 2px rgba(21,23,28,0.06)",
  "--td-shadow-lg": "0 24px 64px -16px rgba(21,23,28,0.28), 0 0 0 1px rgba(21,23,28,0.05)",
  color: "var(--td-ink)",
  fontSize: "14px",
  lineHeight: 1.45,
  fontSmoothing: "antialiased",
  "& *, & *::before, & *::after": { boxSizing: "border-box" },
  "& button, & input, & select, & textarea": { fontFamily: "inherit", fontSize: "inherit" },
  "& input, & select, & textarea": { color: "inherit" },
  "& a": { color: "inherit", textDecoration: "none" },
  "& svg": { flexShrink: 0 },
});

/* ── Layout ─────────────────────────────────────────────────────────────── */
export const page = css({ px: "36px", py: "28px", maxW: "1320px", mx: "auto", w: "100%" });

export const stack = cva({
  base: { display: "flex", flexDirection: "column" },
  variants: { gap: { 1: { gap: "4px" }, 2: { gap: "8px" }, 3: { gap: "12px" }, 4: { gap: "16px" }, 6: { gap: "24px" }, 8: { gap: "32px" } } },
  defaultVariants: { gap: 4 },
});
export const row = cva({
  base: { display: "flex", alignItems: "center" },
  variants: {
    gap: { 1: { gap: "4px" }, 2: { gap: "8px" }, 3: { gap: "12px" }, 4: { gap: "16px" }, 6: { gap: "24px" } },
    between: { true: { justifyContent: "space-between" } },
    wrap: { true: { flexWrap: "wrap" } },
    top: { true: { alignItems: "flex-start" } },
  },
  defaultVariants: { gap: 2 },
});

export const grid = cva({
  base: { display: "grid", gap: "16px" },
  variants: {
    cols: {
      2: { gridTemplateColumns: "repeat(2, minmax(0,1fr))" },
      3: { gridTemplateColumns: "repeat(3, minmax(0,1fr))" },
      4: { gridTemplateColumns: "repeat(4, minmax(0,1fr))" },
      5: { gridTemplateColumns: "repeat(5, minmax(0,1fr))" },
      main: { gridTemplateColumns: "minmax(0,1fr) 360px" },
      side: { gridTemplateColumns: "300px minmax(0,1fr)" },
    },
  },
});

/* ── Text ───────────────────────────────────────────────────────────────── */
export const text = cva({
  base: { margin: 0 },
  variants: {
    size: {
      xs: { fontSize: "11.5px", lineHeight: 1.4 },
      sm: { fontSize: "12.5px", lineHeight: 1.45 },
      md: { fontSize: "14px", lineHeight: 1.5 },
      lg: { fontSize: "16px", lineHeight: 1.45 },
      xl: { fontSize: "20px", lineHeight: 1.3, letterSpacing: "-0.01em" },
      "2xl": { fontSize: "26px", lineHeight: 1.2, letterSpacing: "-0.02em" },
    },
    tone: {
      ink: { color: "var(--td-ink) !important" },
      2: { color: "var(--td-ink-2) !important" },
      3: { color: "var(--td-ink-3) !important" },
      accent: { color: "var(--td-accent) !important" },
      red: { color: "var(--td-red) !important" },
      green: { color: "var(--td-green) !important" },
    },
    weight: { 400: { fontWeight: 400 }, 500: { fontWeight: 500 }, 600: { fontWeight: 600 }, 700: { fontWeight: 700 } },
    mono: { true: { fontFamily: "var(--td-mono)", fontVariantNumeric: "tabular-nums" } },
    truncate: { true: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
    upper: { true: { textTransform: "uppercase", letterSpacing: "0.06em" } },
  },
  defaultVariants: { size: "md", tone: "ink", weight: 400 },
});

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx(text({ size: "xs", tone: 3, weight: 600, upper: true }), className)}>{children}</p>;
}

/* ── Page header ────────────────────────────────────────────────────────── */
export function PageHeader({ title, eyebrow, description, actions }: { title: ReactNode; eyebrow?: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className={cx(row({ between: true, top: true, gap: 4 }), css({ mb: "24px" }))}>
      <div className={stack({ gap: 1 })}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className={text({ size: "2xl", weight: 600 })}>{title}</h1>
        {description ? <p className={cx(text({ tone: 2 }), css({ mt: "2px" }))}>{description}</p> : null}
      </div>
      {actions ? <div className={row({ gap: 2 })}>{actions}</div> : null}
    </header>
  );
}

/* ── Panel ──────────────────────────────────────────────────────────────── */
export const panel = cva({
  base: { bg: "var(--td-surface)", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--td-line)", borderRadius: "14px", overflow: "hidden" },
  variants: {
    pad: { none: {}, sm: { p: "14px" }, md: { p: "20px" }, lg: { p: "24px" } },
    interactive: { true: { cursor: "pointer", transition: "border-color .15s, box-shadow .15s", _hover: { borderColor: "var(--td-line-2)", boxShadow: "var(--td-shadow-sm)" } } },
  },
  defaultVariants: { pad: "none" },
});

export function Panel({ pad, interactive, className, ...props }: HTMLAttributes<HTMLDivElement> & { pad?: "none" | "sm" | "md" | "lg"; interactive?: boolean }) {
  return <div className={cx(panel({ pad, interactive }), className)} {...props} />;
}

export function PanelHead({ title, meta, actions }: { title: ReactNode; meta?: ReactNode; actions?: ReactNode }) {
  return (
    <div className={cx(row({ between: true, gap: 3 }), css({ px: "20px", py: "14px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)" }))}>
      <div className={row({ gap: 2 })}>
        <h2 className={text({ size: "md", weight: 600 })}>{title}</h2>
        {meta ? <span className={text({ size: "sm", tone: 3 })}>{meta}</span> : null}
      </div>
      {actions}
    </div>
  );
}

/* ── Pills (status) ─────────────────────────────────────────────────────── */
export const pill = cva({
  base: {
    display: "inline-flex", alignItems: "center", gap: "6px", h: "22px", px: "8px", borderRadius: "999px",
    fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", lineHeight: 1,
    "& i": { display: "inline-block", w: "6px", h: "6px", borderRadius: "999px", bg: "currentColor" },
  },
  variants: {
    tone: {
      neutral: { bg: "var(--td-hover)", color: "var(--td-ink-2)" },
      green: { bg: "var(--td-green-soft)", color: "var(--td-green)" },
      amber: { bg: "var(--td-amber-soft)", color: "var(--td-amber)" },
      red: { bg: "var(--td-red-soft)", color: "var(--td-red)" },
      blue: { bg: "var(--td-blue-soft)", color: "var(--td-blue)" },
      purple: { bg: "var(--td-purple-soft)", color: "var(--td-purple)" },
      ink: { bg: "var(--td-ink)", color: "#fff" },
    },
    outline: { true: { bg: "transparent", boxShadow: "inset 0 0 0 1px var(--td-line-2)" } },
  },
  defaultVariants: { tone: "neutral" },
});
export type Tone = "neutral" | "green" | "amber" | "red" | "blue" | "purple" | "ink";
export function Pill({ tone, dot, outline, children, className }: { tone?: Tone; dot?: boolean; outline?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cx(pill({ tone, outline }), className)}>
      {dot ? <i /> : null}
      {children}
    </span>
  );
}

/* ── Buttons ────────────────────────────────────────────────────────────── */
export const button = cva({
  base: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", whiteSpace: "nowrap",
    borderRadius: "9px", borderWidth: "1px", borderStyle: "solid", borderColor: "transparent", fontWeight: 600, cursor: "pointer",
    appearance: "none", userSelect: "none", transition: "background-color .12s, border-color .12s, color .12s, box-shadow .12s",
    _focusVisible: { outline: "none", boxShadow: "0 0 0 3px var(--td-accent-soft), 0 0 0 1px var(--td-accent)" },
    _disabled: { opacity: 0.5, cursor: "not-allowed" },
  },
  variants: {
    variant: {
      primary: { bg: "var(--td-ink)", color: "#fff", _hover: { bg: "#2A2D35" } },
      accent: { bg: "var(--td-accent)", color: "#fff", _hover: { bg: "var(--td-accent-hover)" } },
      secondary: { bg: "var(--td-surface)", color: "var(--td-ink)", borderColor: "var(--td-line-2)", _hover: { bg: "var(--td-hover)" } },
      ghost: { bg: "transparent", color: "var(--td-ink-2)", _hover: { bg: "var(--td-hover)", color: "var(--td-ink)" } },
      danger: { bg: "var(--td-red)", color: "#fff", _hover: { bg: "#AE322D" } },
      dangerSoft: { bg: "var(--td-red-soft)", color: "var(--td-red)", _hover: { bg: "#F9D9D6" } },
      success: { bg: "var(--td-green)", color: "#fff", _hover: { bg: "#18774B" } },
    },
    size: {
      xs: { h: "26px", px: "9px", fontSize: "12px", borderRadius: "7px" },
      sm: { h: "30px", px: "11px", fontSize: "12.5px" },
      md: { h: "36px", px: "14px", fontSize: "13.5px" },
      lg: { h: "42px", px: "18px", fontSize: "14px", borderRadius: "10px" },
    },
    full: { true: { w: "100%" } },
  },
  defaultVariants: { variant: "secondary", size: "md" },
});
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "accent" | "secondary" | "ghost" | "danger" | "dangerSoft" | "success"; size?: "xs" | "sm" | "md" | "lg"; full?: boolean };
export function Btn({ variant, size, full, className, type = "button", ...props }: BtnProps) {
  return <button type={type} className={cx(button({ variant, size, full }), className)} {...props} />;
}

export const iconBtn = cva({
  base: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", border: "none", bg: "transparent",
    color: "var(--td-ink-2)", cursor: "pointer", appearance: "none", transition: "background-color .12s, color .12s",
    _hover: { bg: "var(--td-hover)", color: "var(--td-ink)" },
    _focusVisible: { outline: "none", boxShadow: "0 0 0 3px var(--td-accent-soft)" },
  },
  variants: { size: { sm: { w: "28px", h: "28px" }, md: { w: "34px", h: "34px" } } },
  defaultVariants: { size: "md" },
});
export function IconBtn({ size, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { size?: "sm" | "md" }) {
  return <button type="button" className={cx(iconBtn({ size }), className)} {...props} />;
}

/* ── Avatar ─────────────────────────────────────────────────────────────── */
const avatarPalette = ["#DCE4FB", "#E3F4E9", "#FCEBD6", "#EFE7FB", "#FBE3E1", "#E6F1F7"];
const avatarInk = ["#2B4BC9", "#1E7A4E", "#A05A0A", "#5B3FC9", "#B2342F", "#1E6F93"];
export const avatar = cva({
  base: { display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "999px", fontWeight: 600, flexShrink: 0, letterSpacing: "0.01em" },
  variants: { size: { xs: { w: "22px", h: "22px", fontSize: "9.5px" }, sm: { w: "28px", h: "28px", fontSize: "11px" }, md: { w: "36px", h: "36px", fontSize: "13px" }, lg: { w: "48px", h: "48px", fontSize: "16px" }, xl: { w: "64px", h: "64px", fontSize: "22px" } } },
  defaultVariants: { size: "md" },
});
export function Avatar({ name, size, seed, src }: { name: string; size?: "xs" | "sm" | "md" | "lg" | "xl"; seed?: number; src?: string | null }) {
  const s = (seed ?? name.length) % avatarPalette.length;
  const init = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
  // A photo that fails to load (dead URL, blocked host) falls back to initials.
  const [failed, setFailed] = useState<string | null>(null);
  if (src && failed !== src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={cx(avatar({ size }), css({ objectFit: "cover" }))} referrerPolicy="no-referrer" onError={() => setFailed(src)} />;
  }
  return (
    <span className={avatar({ size })} style={{ background: avatarPalette[s], color: avatarInk[s] }} aria-hidden>
      {init}
    </span>
  );
}

/* ── Table ──────────────────────────────────────────────────────────────── */
export const table = css({
  w: "100%", borderCollapse: "collapse", fontSize: "13.5px",
  "& th": { textAlign: "left", fontSize: "11.5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--td-ink-3)", px: "16px", py: "10px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)", bg: "var(--td-surface-2)", whiteSpace: "nowrap" },
  "& td": { px: "16px", py: "12px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)", verticalAlign: "middle" },
  "& tbody tr:last-child td": { borderBottom: "none" },
  "& tbody tr[data-clickable]": { cursor: "pointer", transition: "background-color .1s" },
  "& tbody tr[data-clickable]:hover": { bg: "var(--td-surface-2)" },
  "& td.num, & th.num": { textAlign: "right", fontVariantNumeric: "tabular-nums" },
  "& td.actions": { textAlign: "right", whiteSpace: "nowrap" },
});

/* ── Segmented filter tabs ──────────────────────────────────────────────── */
const segWrap = css({ display: "inline-flex", gap: "2px", p: "3px", bg: "var(--td-hover)", borderRadius: "10px" });
const segItem = css({
  display: "inline-flex", alignItems: "center", gap: "7px", h: "30px", px: "12px", borderRadius: "8px", border: "none", bg: "transparent",
  fontSize: "13px", fontWeight: 500, color: "var(--td-ink-2)", cursor: "pointer", appearance: "none", transition: "all .12s",
  _hover: { color: "var(--td-ink)" },
  "&[data-active=true]": { bg: "var(--td-surface)", color: "var(--td-ink)", fontWeight: 600, boxShadow: "var(--td-shadow-sm)" },
  "& b": { fontSize: "11px", fontWeight: 600, color: "var(--td-ink-3)", bg: "var(--td-line)", borderRadius: "999px", px: "6px", h: "18px", display: "inline-flex", alignItems: "center", fontVariantNumeric: "tabular-nums" },
  "&[data-active=true] b": { color: "var(--td-ink)" },
});
export function Segmented<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { value: T; label: string; count?: number }[] }) {
  return (
    <div className={segWrap} role="tablist">
      {items.map((it) => (
        <button key={it.value} role="tab" aria-selected={it.value === value} data-active={it.value === value} className={segItem} onClick={() => onChange(it.value)}>
          {it.label}
          {typeof it.count === "number" ? <b>{it.count}</b> : null}
        </button>
      ))}
    </div>
  );
}

/* ── Underline tabs (for detail pages) ──────────────────────────────────── */
const tabsWrap = css({ display: "flex", gap: "4px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)" });
const tabItem = css({
  position: "relative", h: "40px", px: "12px", border: "none", bg: "transparent", fontSize: "13.5px", fontWeight: 500, color: "var(--td-ink-2)", cursor: "pointer", appearance: "none",
  _hover: { color: "var(--td-ink)" },
  "&[data-active=true]": { color: "var(--td-ink)", fontWeight: 600 },
  "&[data-active=true]::after": { content: '""', position: "absolute", left: "8px", right: "8px", bottom: "-1px", h: "2px", bg: "var(--td-ink)", borderRadius: "2px" },
});
export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { value: T; label: string }[] }) {
  return (
    <div className={tabsWrap} role="tablist">
      {items.map((it) => (
        <button key={it.value} role="tab" aria-selected={it.value === value} data-active={it.value === value} className={tabItem} onClick={() => onChange(it.value)}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ── Form fields ────────────────────────────────────────────────────────── */
const fieldBase = css({
  w: "100%", h: "36px", px: "11px", bg: "var(--td-surface)", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--td-line-2)", borderRadius: "9px",
  fontSize: "13.5px", color: "var(--td-ink)", appearance: "none", outline: "none", transition: "border-color .12s, box-shadow .12s",
  _placeholder: { color: "var(--td-ink-3)" },
  _focus: { borderColor: "var(--td-accent)", boxShadow: "0 0 0 3px var(--td-accent-soft)" },
});
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(fieldBase, className)} {...props} />;
}
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(fieldBase, css({ h: "auto", minH: "88px", py: "9px", resize: "vertical", lineHeight: 1.5 }), className)} {...props} />;
}
const selectCss = css({
  pr: "30px", cursor: "pointer",
  backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E939C' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")",
  backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
});
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(fieldBase, selectCss, className)} {...props} />;
}
export function Field({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className={stack({ gap: 1 })}>
      <span className={text({ size: "sm", weight: 600, tone: 2 })}>{label}</span>
      {children}
      {hint ? <span className={text({ size: "xs", tone: 3 })}>{hint}</span> : null}
    </label>
  );
}

/* ── Search box ─────────────────────────────────────────────────────────── */
export const searchWrap = css({
  position: "relative", "& svg": { position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--td-ink-3)", pointerEvents: "none" },
  "& input": { pl: "32px" },
});

/* ── Empty state ────────────────────────────────────────────────────────── */
export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: ReactNode; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className={cx(stack({ gap: 2 }), css({ alignItems: "center", textAlign: "center", py: "48px", px: "24px" }))}>
      {icon ? <div className={css({ w: "40px", h: "40px", borderRadius: "12px", bg: "var(--td-hover)", display: "grid", placeItems: "center", color: "var(--td-ink-3)", mb: "6px" })}>{icon}</div> : null}
      <p className={text({ weight: 600 })}>{title}</p>
      {body ? <p className={cx(text({ size: "sm", tone: 2 }), css({ maxW: "360px" }))}>{body}</p> : null}
      {action ? <div className={css({ mt: "8px" })}>{action}</div> : null}
    </div>
  );
}

/* ── Key/value list ─────────────────────────────────────────────────────── */
export const kvList = css({
  display: "grid", gridTemplateColumns: "max-content 1fr", columnGap: "20px", rowGap: "10px", fontSize: "13.5px",
  "& dt": { color: "var(--td-ink-3)", whiteSpace: "nowrap" },
  "& dd": { margin: 0, color: "var(--td-ink)", minW: 0, overflowWrap: "anywhere" },
});

/* ── Pagination ─────────────────────────────────────────────────────────── */
export interface PageInfo { current_page: number; last_page: number; per_page: number; total: number }
export function Pager({ meta, onPage, noun = "items" }: { meta: PageInfo | undefined; onPage: (p: number) => void; noun?: string }) {
  if (!meta || meta.total === 0) return null;
  const from = (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.total, meta.current_page * meta.per_page);
  return (
    <div className={cx(row({ between: true }), css({ px: "16px", py: "10px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "var(--td-line)", bg: "var(--td-surface-2)" }))}>
      <span className={text({ size: "sm", tone: 3 })}>{from}–{to} of {meta.total.toLocaleString("en-US")} {noun}</span>
      {meta.last_page > 1 ? (
        <span className={row({ gap: 1 })}>
          <IconBtn size="sm" aria-label="Previous page" disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)} className={css({ _disabled: { opacity: 0.35, cursor: "not-allowed" } })}><ChevronLeft size={15} /></IconBtn>
          <span className={cx(text({ size: "sm", tone: 2 }), css({ px: "4px", fontVariantNumeric: "tabular-nums" }))}>{meta.current_page} / {meta.last_page}</span>
          <IconBtn size="sm" aria-label="Next page" disabled={meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)} className={css({ _disabled: { opacity: 0.35, cursor: "not-allowed" } })}><ChevronRight size={15} /></IconBtn>
        </span>
      ) : null}
    </div>
  );
}

/* ── Loading / error states ─────────────────────────────────────────────── */
const spinner = css({
  w: "18px", h: "18px", borderRadius: "999px", border: "2px solid var(--td-line-2)", borderTopColor: "var(--td-ink)", animation: "tdSpin .7s linear infinite", flexShrink: 0,
});
export function Spinner({ className }: { className?: string }) {
  return <span className={cx(spinner, className)} role="status" aria-label="Loading" />;
}
export function Loading({ label = "Loading…", tall }: { label?: string; tall?: boolean }) {
  return (
    <div className={cx(row({ gap: 3 }), css({ justifyContent: "center", py: tall ? "96px" : "40px", color: "var(--td-ink-3)", fontSize: "13px" }))}>
      <Spinner /> {label}
    </div>
  );
}
export function ErrorState({ title = "Couldn't load this", body, onRetry }: { title?: ReactNode; body?: ReactNode; onRetry?: () => void }) {
  return (
    <EmptyState icon={<AlertTriangle size={20} />} title={title} body={body ?? "Check the connection to the API and try again."} action={onRetry ? <Btn onClick={onRetry}>Try again</Btn> : undefined} />
  );
}

/* ── Divider ────────────────────────────────────────────────────────────── */
export const divider = css({ h: "1px", bg: "var(--td-line)", border: "none", m: 0 });

/* ── Overlay: Drawer + Modal ────────────────────────────────────────────── */
const backdrop = css({ position: "fixed", inset: 0, bg: "rgba(21,23,28,0.32)", zIndex: 60, animation: "tdFade .16s ease-out" });
const drawerCss = css({
  position: "fixed", top: "12px", right: "12px", bottom: "12px", w: "min(560px, calc(100vw - 24px))", bg: "var(--td-surface)", borderRadius: "16px",
  boxShadow: "var(--td-shadow-lg)", zIndex: 61, display: "flex", flexDirection: "column", overflow: "hidden", animation: "tdSlide .2s cubic-bezier(.2,.8,.2,1)",
});
const modalPos = css({ position: "fixed", inset: 0, zIndex: 61, display: "grid", placeItems: "center", p: "24px", pointerEvents: "none" });
const modalCss = cva({
  base: { bg: "var(--td-surface)", borderRadius: "16px", boxShadow: "var(--td-shadow-lg)", w: "100%", pointerEvents: "auto", animation: "tdPop .18s cubic-bezier(.2,.8,.2,1)", display: "flex", flexDirection: "column", maxH: "calc(100vh - 48px)", overflow: "hidden" },
  variants: { size: { sm: { maxW: "420px" }, md: { maxW: "520px" }, lg: { maxW: "680px" } } },
  defaultVariants: { size: "md" },
});
export const overlayHead = css({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", px: "22px", pt: "20px", pb: "14px" });
export const overlayBody = css({ px: "22px", pb: "22px", overflowY: "auto", flex: 1 });
export const overlayFoot = css({ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", px: "22px", py: "14px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "var(--td-line)", bg: "var(--td-surface-2)" });

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
}

export function Drawer({ open, onClose, title, subtitle, children, footer }: { open: boolean; onClose: () => void; title: ReactNode; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <>
      <div className={backdrop} onClick={onClose} />
      <aside className={cx(tdVars, drawerCss)} role="dialog" aria-modal="true">
        <div className={overlayHead}>
          <div className={stack({ gap: 1 })}>
            <h2 className={text({ size: "lg", weight: 600 })}>{title}</h2>
            {subtitle ? <div className={text({ size: "sm", tone: 2 })}>{subtitle}</div> : null}
          </div>
          <IconBtn onClick={onClose} aria-label="Close"><X size={18} /></IconBtn>
        </div>
        <div className={overlayBody}>{children}</div>
        {footer ? <div className={overlayFoot}>{footer}</div> : null}
      </aside>
    </>
  );
}

export function Modal({ open, onClose, title, description, size, children, footer }: { open: boolean; onClose: () => void; title: ReactNode; description?: ReactNode; size?: "sm" | "md" | "lg"; children?: ReactNode; footer?: ReactNode }) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <>
      <div className={backdrop} onClick={onClose} />
      <div className={modalPos}>
        <div className={cx(tdVars, modalCss({ size }))} role="dialog" aria-modal="true">
          <div className={overlayHead}>
            <div className={stack({ gap: 1 })}>
              <h2 className={text({ size: "lg", weight: 600 })}>{title}</h2>
              {description ? <p className={text({ size: "sm", tone: 2 })}>{description}</p> : null}
            </div>
            <IconBtn onClick={onClose} aria-label="Close"><X size={18} /></IconBtn>
          </div>
          {children ? <div className={overlayBody}>{children}</div> : null}
          {footer ? <div className={overlayFoot}>{footer}</div> : null}
        </div>
      </div>
    </>
  );
}

/* ── Keyframes (global, injected once by the shell) ─────────────────────── */
export const keyframesCss = `
@keyframes tdFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes tdSlide { from { opacity: 0; transform: translateX(24px) } to { opacity: 1; transform: none } }
@keyframes tdPop { from { opacity: 0; transform: translateY(8px) scale(.98) } to { opacity: 1; transform: none } }
@keyframes tdToast { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes tdSpin { to { transform: rotate(360deg) } }
`;
