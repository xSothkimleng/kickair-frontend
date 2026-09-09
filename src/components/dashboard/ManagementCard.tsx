"use client";

import { Fragment, type ReactNode } from "react";
import { Menu as ArkMenu, Portal } from "@ark-ui/react";
import { ChevronRight, EllipsisVertical, Image as ImageIcon } from "lucide-react";
import { css, cx } from "styled-system/css";

/* ── Status pill ── */
export type CardTone = "success" | "info" | "pending" | "error" | "neutral";
const TONE_CLASS: Record<CardTone, string> = {
  success: css({ bg: "successTint", color: "successText" }),
  info: css({ bg: "rgba(37,99,235,0.10)", color: "#1d4ed8" }),
  pending: css({ bg: "pendingTint", color: "pendingText" }),
  error: css({ bg: "errorTint", color: "errorText" }),
  neutral: css({ bg: "rgba(0,0,0,0.05)", color: "ink2" }),
};
const pillBase = css({ display: "inline-flex", alignItems: "center", gap: "6px", h: "24px", px: "10px", borderRadius: "pill", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", flex: "none" });
const pillDot = css({ w: "6px", h: "6px", borderRadius: "pill", bg: "currentColor" });
export function StatusPill({ tone, label }: { tone: CardTone; label: string }) {
  return (
    <span className={cx(pillBase, TONE_CLASS[tone])}>
      <span className={pillDot} />{label}
    </span>
  );
}

/* ── Category pill ── */
const categoryPill = css({ display: "inline-flex", alignItems: "center", h: "24px", px: "11px", borderRadius: "pill", fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.01em", bg: "rgba(0,0,0,0.05)", color: "ink2", whiteSpace: "nowrap" });
export function CategoryPill({ children }: { children: ReactNode }) {
  return <span className={categoryPill}>{children}</span>;
}

/* ── Kebab overflow menu (actions never trigger the card's click) ── */
export interface MenuAction {
  icon?: ReactNode;
  label: string;
  danger?: boolean;
  onClick?: () => void;
  sep?: boolean;
}
const kebabBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", w: "34px", h: "34px", p: 0,
  border: "none", borderRadius: "9px", bg: "transparent", color: "ink3", cursor: "pointer", fontFamily: "inherit",
  transition: "background-color .12s, color .12s",
  _hover: { bg: "rgba(0,0,0,0.05)", color: "ink" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block" },
});
const kebabContent = css({
  minW: "188px", p: "6px", bg: "surface", borderRadius: "12px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  boxShadow: "0 14px 38px rgba(0,0,0,0.14)", outline: "none", zIndex: 1400,
});
const kebabItem = css({
  display: "flex", alignItems: "center", gap: "11px", px: "11px", py: "9px", borderRadius: "8px",
  fontSize: "13.5px", fontWeight: 500, color: "ink", cursor: "pointer", userSelect: "none",
  transition: "background-color .12s",
  _hover: { bg: "surface2" },
  "&[data-highlighted]": { bg: "surface2" },
  "& svg": { flexShrink: 0 },
});
const kebabDanger = css({ color: "errorText", _hover: { bg: "errorTint" }, "&[data-highlighted]": { bg: "errorTint" } });
const kebabSep = css({ h: "1px", bg: "hairline", my: "5px", mx: "6px" });
export function KebabMenu({ items }: { items: MenuAction[] }) {
  if (!items.length) return null;
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    // Wrapper swallows the (React-bubbled) clicks from the trigger and the portaled items.
    <span onClick={stop} className={css({ flex: "none", display: "inline-flex" })}>
      <ArkMenu.Root positioning={{ placement: "bottom-end", gutter: 6, strategy: "fixed" }} onSelect={(d) => items[Number(d.value)]?.onClick?.()} lazyMount unmountOnExit>
        <ArkMenu.Trigger className={kebabBtn} aria-label="More actions">
          <EllipsisVertical size={20} />
        </ArkMenu.Trigger>
        <Portal>
          <ArkMenu.Positioner className={css({ zIndex: 1400 })}>
            <ArkMenu.Content className={kebabContent} onClick={stop}>
              {items.map((it, i) =>
                it.sep ? (
                  <ArkMenu.Separator key={i} className={kebabSep} />
                ) : (
                  <Fragment key={i}>
                    <ArkMenu.Item value={String(i)} className={cx(kebabItem, it.danger && kebabDanger)}>
                      {it.icon}
                      {it.label}
                    </ArkMenu.Item>
                  </Fragment>
                ),
              )}
            </ArkMenu.Content>
          </ArkMenu.Positioner>
        </Portal>
      </ArkMenu.Root>
    </span>
  );
}

/* ── Fact strip: label over value, thin dividers ── */
export interface Fact {
  label: string;
  value: ReactNode;
  color?: string;
  mono?: boolean;
}
const factsRow = css({ display: "flex", rowGap: "12px", alignItems: "stretch" });
const factLabel = css({ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "ink3" });
const factValue = css({ fontSize: "14.5px", fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.1, color: "ink", whiteSpace: "nowrap" });
const factSep = css({ w: "1px", bg: "hairline", alignSelf: "stretch", flex: "none" });
export function Facts({ items, mobile }: { items: Fact[]; mobile?: boolean }) {
  return (
    <div className={cx(factsRow, mobile ? css({ flexWrap: "wrap" }) : css({ flexWrap: "nowrap" }))}>
      {items.map((f, i) => (
        <div key={i} className={css({ display: "flex", alignItems: "stretch" })}>
          {i > 0 && <div aria-hidden className={cx(factSep, mobile ? css({ mx: "14px" }) : css({ mx: "18px" }))} />}
          <div className={css({ display: "flex", flexDirection: "column", gap: "3px", minW: 0 })}>
            <div className={factLabel}>{f.label}</div>
            <div className={cx(factValue, f.mono && css({ fontFamily: "mono" }))} style={f.color ? { color: f.color } : undefined}>{f.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Status banner ── */
const bannerBase = css({ display: "flex", gap: "10px", p: "11px 13px", borderRadius: "tile", borderWidth: "1px", borderStyle: "solid" });
const bannerError = css({ bg: "errorTint", borderColor: "rgba(220,38,38,0.16)", color: "errorText", "& .mg-banner-icon": { color: "errorText" } });
const bannerQuiet = css({ bg: "rgba(0,0,0,0.035)", borderColor: "hairline", color: "ink2", "& .mg-banner-icon": { color: "ink3" } });
const bannerText = css({ fontSize: "12.5px", lineHeight: 1.5, lineClamp: 2 });
export function Banner({ tone, icon, label, text }: { tone: "error" | "quiet"; icon: ReactNode; label: string; text?: string }) {
  const err = tone === "error";
  return (
    <div className={cx(bannerBase, err ? bannerError : bannerQuiet)}>
      <div className={cx("mg-banner-icon", css({ flex: "none", mt: "1px", display: "flex" }))}>{icon}</div>
      <div className={css({ minW: 0 })}>
        <div className={css({ fontSize: "12.5px", fontWeight: 600 })}>{label}</div>
        {text && <div className={bannerText} style={{ opacity: err ? 0.92 : 0.82 }}>{text}</div>}
      </div>
    </div>
  );
}

/* ── Cover thumbnail (real image or striped placeholder) ── */
const thumbBase = css({ borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", overflow: "hidden", flex: "none" });
const thumbEmpty = css({ bg: "surface2", display: "flex", alignItems: "center", justifyContent: "center", color: "ink3" });
export function CoverThumb({ src, size = 92, radius = 12 }: { src?: string | null; size?: number; radius?: number }) {
  const box = { width: size, height: size, borderRadius: radius };
  if (src) {
    return (
      <div className={thumbBase} style={box}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className={css({ w: "100%", h: "100%", objectFit: "cover", display: "block" })} />
      </div>
    );
  }
  return (
    <div className={cx(thumbBase, thumbEmpty)} style={box}>
      <ImageIcon size={Math.round(size * 0.34)} />
    </div>
  );
}

/* ── Disclosure chevron (whole card opens detail) ── */
export function Chevron({ size = 20 }: { size?: number }) {
  return (
    <div className={cx("mg-chev", css({ color: "ink3", flex: "none", display: "flex", transition: "color .15s, transform .15s", "& svg": { display: "block" } }))}>
      <ChevronRight size={size} />
    </div>
  );
}

/* Shared card shell — whole card clickable, lifts chevron on hover. */
export const mgCard = css({
  position: "relative",
  bg: "surface",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  borderRadius: "card",
  cursor: "pointer",
  transition: "border-color .15s ease, box-shadow .15s ease",
  _hover: {
    borderColor: "hairlineStrong",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)",
    "& .mg-chev": { color: "ink2", transform: "translateX(2px)" },
  },
});

/**
 * @deprecated MUI `sx` twin of `mgCard`, kept (as a plain object — no MUI import) only until
 * `client/PostServiceContent.tsx` and `dashboard/freelancer/ServiceCard.tsx` are on Panda.
 */
export const mgCardSx = {
  position: "relative" as const,
  bgcolor: "#FFFFFF",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: "16px",
  cursor: "pointer",
  transition: "border-color .15s ease, box-shadow .15s ease",
  "&:hover": { borderColor: "rgba(0, 0, 0, 0.14)", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)" },
  "&:hover .mg-chev": { color: "rgba(0, 0, 0, 0.6)", transform: "translateX(2px)" },
};
