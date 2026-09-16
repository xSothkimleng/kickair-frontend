"use client";

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { Select, createListCollection } from "@ark-ui/react";
import { Check, ChevronDown } from "lucide-react";
import { css, cva, cx } from "styled-system/css";
import { tapTargetIcon } from "@/components/ds/tap";
import { fieldOption, fieldOptionCheck, fieldOptionList, fieldPopup, fieldPositioner } from "@/components/ui/inputs";
import { money, type MoneyVariants } from "@/components/ds/Text";
import { CustomOrderEscrow, MilestoneStatus } from "@/types/customOrder";

/* ── Shared classes ────────────────────────────────────────────────────────── */

/** The white hairline card every custom-order surface is built from. */
export const coCard = css({
  bg: "surface",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  borderRadius: "card",
});

/** Uppercase micro-label. */
export const coLabel = css({
  textStyle: "eyebrow",
  fontWeight: 600,
  color: "ink3",
});

// Panda's `cx` only concatenates — it cannot resolve two atomic classes that
// set the same property — so the recoloured labels are written out in full.

/** `coLabel` in the accent colour + mono — the dialog / page "annotation". */
export const coLabelAccent = css({
  textStyle: "eyebrow",
  fontWeight: 600,
  color: "accent",
  fontVariantNumeric: "tabular-nums",
});

/**
 * Action button. Reproduces the button base these surfaces styled through
 * `sx` (500 weight, 14px, 6px/8px padding, 64px min-width,
 * pill radius) plus each tone/height the custom-order screens use.
 */
export const coBtn = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxSizing: "border-box",
    py: "6px",
    px: "8px",
    minW: "64px",
    border: "none",
    borderRadius: "pill",
    bg: "transparent",
    textStyle: "body",
    fontWeight: 500,
    textDecoration: "none",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
    userSelect: "none",
    appearance: "none",
    cursor: "pointer",
    transition: "background-color .25s, box-shadow .25s, border-color .25s, color .25s",
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
    // Greys the label and kills pointer events on a disabled text button.
    _disabled: { pointerEvents: "none", color: "rgba(0,0,0,0.26)" },
    "& svg": { flexShrink: 0 },
  },
  variants: {
    tone: {
      /** Black primary — `bgcolor: tokens.text`, hover 82 % black. */
      black: { bg: "ink", color: "#fff", _hover: { bg: "rgba(0,0,0,0.82)" } },
      /** Quiet secondary — text only, ink2. */
      quiet: { color: "ink2", _hover: { bg: "rgba(0,0,0,0.04)" } },
      /** 5 % black fill (the "Message …" pill). */
      grey: { bg: "rgba(0,0,0,0.05)", color: "ink", _hover: { bg: "rgba(0,0,0,0.09)" } },
      /** Destructive — end / cancel order. */
      danger: { bg: "error", color: "#fff", _hover: { bg: "#b91c1c" } },
      /** Hairline outline (the "Go back" button on the not-found panel). */
      outline: {
        color: "ink",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "hairline",
        _hover: { bg: "rgba(0,0,0,0.04)" },
      },
      /** Back link — no padding, no min width, hover darkens the label. */
      link: { py: 0, px: 0, minW: 0, textStyle: "ui", color: "ink2", _hover: { color: "ink", bg: "transparent" } },
    },
    size: {
      /** height 38 · px 16 · 13px (milestone actions) */
      xs: { h: "38px", px: "16px", textStyle: "ui" },
      /** height 42 · px 20 (dialog confirms) */
      sm: { h: "42px", px: "20px" },
      /** height 44 · px 20 (primary dialog CTA) */
      md: { h: "44px", px: "20px" },
      /** height 44, 8px padding (the full-width end-dialog pair) */
      h44: { h: "44px" },
      /** auto height with a wider pad — the grey "Message …" pill (14) and the
       *  outlined "Go back" button (16). */
      px14: { px: "14px" },
      px16: { px: "16px" },
      /** height 46 (fund confirm) */
      lg: { h: "46px" },
      /** height 48 · 15px (accept & pay, send offer) */
      xl: { h: "48px", textStyle: "body" },
      /** auto height (36.5px at 14px) */
      auto: {},
    },
    /** Label size where the call site overrode the 14px default. */
    font: { ui: { textStyle: "ui" } },
    strong: { true: { fontWeight: 600 } },
    full: { true: { w: "100%" } },
  },
  defaultVariants: { tone: "black", size: "auto" },
});

/** Small icon button — 30px round, 54 % black, 4 % hover fill. */
export const coIconBtn = cva({
  base: {
    ...tapTargetIcon,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "none",
    borderRadius: "50%",
    bg: "transparent",
    color: "ink2",
    cursor: "pointer",
    transition: "background-color .15s",
    _hover: { bg: "rgba(0,0,0,0.04)" },
    _disabled: { color: "rgba(0,0,0,0.26)", pointerEvents: "none" },
    "& svg": { flexShrink: 0, display: "block" },
  },
  variants: {
    size: {
      sm: { w: "30px", h: "30px", padding: 0 },
      xs: { padding: "2px" },
    },
  },
  defaultVariants: { size: "sm" },
});

/** Start / end icon negative outer margin (the 8px gap is on `coBtn`). */
export const coBtnStart = css({ ml: "-4px" });
export const coBtnEnd = css({ mr: "-4px" });

/** Black circle with white initials — the Avatar these pages used. */
export const coAvatar = cva({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "50%",
    overflow: "hidden",
    userSelect: "none",
    bg: "ink",
    color: "#fff",
    fontWeight: 600,
    lineHeight: 1,
  },
  variants: {
    size: {
      xs: { w: "26px", h: "26px", textStyle: "micro" },
      sm: { w: "36px", h: "36px", textStyle: "ui" },
      md: { w: "44px", h: "44px", textStyle: "body" },
      lg: { w: "46px", h: "46px", textStyle: "body" },
      xl: { w: "48px", h: "48px", textStyle: "lead" },
    },
  },
  defaultVariants: { size: "md" },
});

/* ── Text fields (outlined field) ────────────────────────────────── */
// The old field drew the border on an absolutely-positioned <fieldset>; here it sits on
// the root, so the paddings lose the 1px the border takes back (15.5/13 instead
// of 16.5/14) and the box keeps the 53.125 / 37.125 / 93.4px heights.

const fieldRoot = cva({
  base: {
    display: "flex",
    alignItems: "center",
    w: "100%",
    boxSizing: "border-box",
    bg: "transparent",
    color: "ink",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "hairlineStrong",
    transition: "border-color .2s",
    // `:hover:focus-within` outranks the hover rule, so a focused field keeps the
    // accent border while the pointer is over it (same as the old focused state).
    "&:focus-within, &:hover:focus-within": { borderColor: "accent" },
  },
  variants: {
    size: {
      md: { py: "15.5px", px: "13px" },
      sm: { py: "7.5px", px: "13px" },
    },
    radius: {
      "9": { borderRadius: "9px" },
      "10": { borderRadius: "10px" },
    },
    // The old input line-height was 1.4375em.
    font: {
      ui: { textStyle: "ui" },
      body: { textStyle: "body" },
    },
    /** Hover border — the fields that override it use ink3, the default is 87 % black. */
    hover: {
      subtle: { _hover: { borderColor: "ink3" } },
      strong: { _hover: { borderColor: "rgba(0,0,0,0.87)" } },
    },
    multiline: { true: { alignItems: "stretch" } },
    mono: { true: { fontVariantNumeric: "tabular-nums" } },
    /** The focused outline is 2px; the padding gives back the extra px. */
    focus: { thick: { _focusWithin: { borderWidth: "2px", py: "14.5px", px: "12px" } } },
  },
  defaultVariants: { size: "md", radius: "10", font: "body", hover: "subtle" },
});

const fieldControl = cva({
  base: {
  flex: 1,
  minW: 0,
  w: "100%",
  boxSizing: "content-box",
  h: "1.4375em",
  mt: 0,
  mr: 0,
  mb: 0,
  ml: 0,
  py: 0,
  px: 0,
  bg: "transparent",
  border: "none",
  outline: "none",
  boxShadow: "none",
  appearance: "none",
  fontWeight: "inherit",
  color: "inherit",
  _placeholder: { color: "currentcolor", opacity: 0.42 },
  "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0 },
  },
  variants: {
    multiline: { true: { display: "block", h: "auto", resize: "none", overflowY: "hidden" } },
  },
});

/**
 * `InputAdornment` — 16px, 60 % black, 8px from the control. The old
 * adornment box was 24px tall but never drove the field height (the input's own
 * padding did); here the padding sits on the root, so the line-height is pinned
 * to the control's 20.125px to keep the field at the 53.125 / 37.125px.
 */
const adornment = cva({
  base: { display: "flex", alignItems: "center", flexShrink: 0, fontVariantNumeric: "tabular-nums", textStyle: "lead", color: "ink2" },
  variants: { pos: { start: { mr: "8px" }, end: { ml: "8px" } } },
});

type FieldLook = { radius?: "9" | "10"; font?: "ui" | "body"; hover?: "subtle" | "strong"; focus?: "thick" };

export function CoInput({
  value, onChange, placeholder, start, end, size = "md", mono, inputMode, autoFocus, className, radius, font, hover,
}: FieldLook & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  start?: ReactNode;
  end?: ReactNode;
  size?: "md" | "sm";
  mono?: boolean;
  inputMode?: "numeric" | "decimal" | "text";
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <div className={cx(fieldRoot({ size, radius, font, hover, mono }), className)}>
      {start != null && <span className={adornment({ pos: "start" })}>{start}</span>}
      <input
        className={fieldControl()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoFocus={autoFocus}
      />
      {end != null && <span className={adornment({ pos: "end" })}>{end}</span>}
    </div>
  );
}

/* ── Select (Ark, in the field shell) ──────────────────────────────────── */

const triggerExtra = css({
  cursor: "pointer",
  textAlign: "left",
  fontWeight: 400,
  appearance: "none",
  mt: 0,
  mr: 0,
  mb: 0,
  ml: 0,
  _focusVisible: { outline: "none" },
  "&[data-state=open]": { borderColor: "accent" },
});
const triggerText = css({ flex: 1, minW: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", "&[data-placeholder]": { color: "ink3" } });
const triggerIndicator = css({
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
  ml: "8px",
  color: "ink2",
  transition: "transform .15s",
  "& svg": { display: "block" },
  "&[data-state=open]": { transform: "rotate(180deg)" },
});
const emptyOption = cx(fieldOption, css({ opacity: 0.45, cursor: "not-allowed" }));

export interface CoSelectOption { value: number; label: string }

/**
 * The dropdown these dialogs used (`TextField select` + `displayEmpty`), on Ark
 * UI. Trigger keeps the field metrics; the popup uses the shared field
 * recipes (inline, not portaled — see `inputs/field.ts`).
 */
export function CoSelect({
  value, onChange, options, placeholder, emptyLabel, radius,
}: FieldLook & {
  value: number | "";
  onChange: (value: number | "") => void;
  options: CoSelectOption[];
  placeholder: string;
  /** Disabled row shown instead of the options (loading / nothing to pick). */
  emptyLabel?: string;
}) {
  const collection = useMemo(
    () => createListCollection({ items: options.map((o) => ({ label: o.label, value: String(o.value), raw: o.value })) }),
    [options],
  );
  const selected = value === "" ? [] : [String(value)];
  const selectedLabel = selected.length ? collection.items.find((i) => i.value === selected[0])?.label : undefined;

  return (
    <Select.Root
      collection={collection}
      value={selected}
      onValueChange={(d) => { const item = d.items[0]; onChange(item ? item.raw : ""); }}
      positioning={{ placement: "bottom-start", strategy: "fixed", sameWidth: true, gutter: 4 }}
      lazyMount
      unmountOnExit>
      <Select.Control>
        <Select.Trigger className={cx(fieldRoot({ radius }), triggerExtra)}>
          <span className={triggerText} data-placeholder={selectedLabel === undefined ? "" : undefined}>
            {selectedLabel ?? placeholder}
          </span>
          <Select.Indicator className={triggerIndicator}><ChevronDown size={20} /></Select.Indicator>
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner className={fieldPositioner}>
        <Select.Content className={cx(fieldPopup, fieldOptionList)}>
          {emptyLabel ? <div className={emptyOption}>{emptyLabel}</div> : null}
          {collection.items.map((item) => (
            <Select.Item key={item.value} item={item} className={fieldOption}>
              <Select.ItemText>{item.label}</Select.ItemText>
              <Select.ItemIndicator className={fieldOptionCheck}><Check size={16} /></Select.ItemIndicator>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
}

/** Auto-growing textarea (auto-grow, no maxRows here). */
function useAutosize(ref: React.RefObject<HTMLTextAreaElement | null>, value: string, minRows: number) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const lineHeight = parseFloat(cs.lineHeight) || 20.125;
    const min = minRows * lineHeight;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, min)}px`;
  }, [ref, value, minRows]);
}

export function CoTextArea({
  value, onChange, placeholder, minRows = 3, className, radius, font, hover, focus,
}: FieldLook & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutosize(ref, value, minRows);
  return (
    <div className={cx(fieldRoot({ multiline: true, radius, font, hover, focus }), className)}>
      <textarea
        ref={ref}
        rows={minRows}
        className={fieldControl({ multiline: true })}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

/* ── Money (tabular figures) ──────────────────────────────────────────── */

export function fmtMoney(value: number, cents = false): string {
  return (
    "$" +
    Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    })
  );
}

const MONEY_WEIGHT = { 400: "regular", 500: "medium", 600: "semibold", 700: "bold" } as const;

/** An amount in the site font with tabular digits. `size` is a typography role (TYPOGRAPHY.md). */
export function Money({
  value,
  size = "body",
  weight = 500,
  color = "var(--colors-ink)",
  cents = false,
}: {
  value: number;
  size?: NonNullable<MoneyVariants>["size"];
  weight?: keyof typeof MONEY_WEIGHT;
  color?: string;
  cents?: boolean;
}) {
  return (
    <span className={money({ size, weight: MONEY_WEIGHT[weight] })} style={{ color }}>
      {fmtMoney(value, cents)}
    </span>
  );
}

/* ── Milestone status presentation ─────────────────────────────────────────── */

type Tone = "neutral" | "pending" | "success";

export const MS_STATUS: Record<MilestoneStatus, { label: string; tone: Tone }> = {
  upcoming: { label: "Upcoming", tone: "neutral" },
  funded: { label: "In escrow", tone: "pending" },
  in_progress: { label: "In progress", tone: "pending" },
  submitted: { label: "Submitted", tone: "pending" },
  approved: { label: "Approved", tone: "success" },
  released: { label: "Released", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

const chipCss = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    h: "22px",
    px: "8px",
    borderRadius: "999px",
    textStyle: "micro",
    fontWeight: 600,
    whiteSpace: "nowrap",
    flex: "none",
  },
  variants: {
    tone: {
      neutral: { bg: "rgba(0,0,0,0.05)", color: "ink2" },
      pending: { bg: "pendingTint", color: "pendingText" },
      success: { bg: "successTint", color: "successText" },
    },
  },
  defaultVariants: { tone: "neutral" },
});

const chipDot = css({ width: "6px", height: "6px", borderRadius: "50%", bg: "currentcolor" });

export function Chip({ tone = "neutral", children, dot }: { tone?: Tone; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={chipCss({ tone })}>
      {dot && <span className={chipDot} />}
      {children}
    </span>
  );
}

export function MsChip({ status, suffix }: { status: MilestoneStatus; suffix?: string }) {
  const cfg = MS_STATUS[status] ?? MS_STATUS.upcoming;
  return (
    <Chip tone={cfg.tone}>
      {cfg.label}
      {suffix ? ` · ${suffix}` : ""}
    </Chip>
  );
}

/* ── Escrow summary bar (the hero stat strip) ──────────────────────────────── */

const statWrap = css({ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 });
const statHead = css({ display: "flex", alignItems: "center", gap: "6px" });
const statDot = css({ width: "7px", height: "7px", borderRadius: "50%", flex: "none" });
const nowrap = css({ whiteSpace: "nowrap" });

function Stat({ label, value, color = "var(--colors-ink)", dot }: { label: string; value: number; color?: string; dot?: string }) {
  return (
    <div className={statWrap}>
      <div className={statHead}>
        {dot && <span className={statDot} style={{ background: dot }} />}
        <p className={cx(coLabel, nowrap)}>{label}</p>
      </div>
      <Money value={value} size="title" weight={600} color={color} />
    </div>
  );
}

const escrowCard = cva({
  base: {},
  variants: { mobile: { true: { p: "18px" }, false: { p: "22px" } } },
});
const escrowHead = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "12px" });
const escrowPct = css({ textStyle: "micro", color: "ink3" });
const escrowGrid = cva({
  base: { display: "grid" },
  variants: {
    mobile: {
      true: { gridTemplateColumns: "1fr 1fr", gap: "16px", rowGap: "18px", mb: "18px" },
      false: { gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", rowGap: "12px", mb: "18px" },
    },
  },
});
const escrowTrack = css({ height: "8px", borderRadius: "999px", bg: "rgba(0,0,0,0.06)", display: "flex", overflow: "hidden", gap: "2px" });
const escrowBar = css({ height: "100%", transition: "width .5s cubic-bezier(.2,.8,.3,1)" });

export function EscrowSummary({ escrow, mobile = false }: { escrow: CustomOrderEscrow; mobile?: boolean }) {
  const { total_value, released_total, in_escrow_total, unfunded_remaining, percent_released } = escrow;
  const relPct = total_value ? (released_total / total_value) * 100 : 0;
  const escPct = total_value ? (in_escrow_total / total_value) * 100 : 0;

  return (
    <div className={cx(coCard, escrowCard({ mobile }))}>
      <div className={escrowHead}>
        <p className={coLabel}>Escrow summary</p>
        <p className={escrowPct}>{percent_released}% released</p>
      </div>
      <div className={escrowGrid({ mobile })}>
        <Stat label="Project value" value={total_value} />
        <Stat label="Released" value={released_total} color="var(--colors-success-text)" dot="var(--colors-success)" />
        <Stat label="In escrow" value={in_escrow_total} color="var(--colors-pending-text)" dot="var(--colors-pending)" />
        <Stat label="Unfunded" value={unfunded_remaining} color="var(--colors-ink3)" dot="rgba(0,0,0,0.18)" />
      </div>
      <div className={escrowTrack}>
        <div className={escrowBar} style={{ background: "var(--colors-success)", width: `${relPct}%` }} />
        <div className={escrowBar} style={{ background: "var(--colors-pending)", width: `${escPct}%` }} />
      </div>
    </div>
  );
}

/* ── Attachment chip ───────────────────────────────────────────────────────── */

const attachChip = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  h: "32px",
  px: "10px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  borderRadius: "8px",
  bg: "surface",
  fontVariantNumeric: "tabular-nums",
  textStyle: "micro",
  color: "ink2",
  whiteSpace: "nowrap",
});

export function AttachChip({ name, icon }: { name: string; icon?: React.ReactNode }) {
  return (
    <span className={attachChip}>
      {icon}
      {name}
    </span>
  );
}

/* ── Avatar initials helper ────────────────────────────────────────────────── */

export function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}
