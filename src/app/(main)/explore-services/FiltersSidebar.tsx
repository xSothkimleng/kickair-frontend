"use client";

import * as React from "react";
import { Checkbox as ArkCheckbox, Collapsible } from "@ark-ui/react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Slider } from "@/components/ds/Slider";
import { RadioGroupPrimitive, radioControl } from "@/components/ds/RadioGroup";

export type FilterCategory = { id: string; label: string; count?: number };

export type Filters = {
  query: string;
  categories: string[];
  budget: [number, number];
  delivery: "any" | "3" | "7" | "14" | "30";
  rating: "any" | "4.5" | "4.0";
};

interface FiltersSidebarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  categories: FilterCategory[];
  budgetMax?: number;
}

/* ── Section shell ─────────────────────────────────────────────────────────── */

const sectionCss = css({ py: "4px" });
const sectionHeaderCss = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  w: "100%",
  boxSizing: "border-box",
  m: 0,
  p: 0,
  py: "6px",
  border: "none",
  bg: "transparent",
  color: "inherit",
  fontFamily: "inherit",
  textAlign: "left",
  cursor: "pointer",
  userSelect: "none",
});
// MUI `Stack spacing={1}` put a margin-left on the meta, but the unlayered
// `globals.css` `p { margin: 0 }` beat it — so the two labels really do sit flush.
const sectionTitleRowCss = css({ display: "flex", alignItems: "center" });
const sectionTitleCss = css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.5, color: "rgba(0,0,0,0.87)", letterSpacing: "-0.005em" });
const sectionMetaCss = css({ fontSize: "12px", lineHeight: 1.5, color: "rgba(0,0,0,0.38)" });
const sectionChevronCss = css({
  color: "rgba(0,0,0,0.38)",
  flexShrink: 0,
  transform: "rotate(-90deg)",
  transition: "transform 0.2s ease",
  "[data-state=open] > &": { transform: "rotate(0deg)" },
});
const sectionBodyCss = css({ pt: "8px" });
const collapseCss = css({ overflow: "hidden", "&[hidden]": { display: "none" } });

function FilterSection({
  title,
  meta,
  defaultOpen = true,
  children,
}: {
  title: string;
  meta?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={sectionCss}>
      <Collapsible.Root open={open} onOpenChange={d => setOpen(d.open)} lazyMount={false} unmountOnExit={false}>
        <Collapsible.Trigger className={sectionHeaderCss}>
          <span className={sectionTitleRowCss}>
            <span className={sectionTitleCss}>{title}</span>
            {meta && <span className={sectionMetaCss}>{meta}</span>}
          </span>
          <ChevronDown size={18} className={sectionChevronCss} />
        </Collapsible.Trigger>
        <Collapsible.Content className={collapseCss}>
          <div className={sectionBodyCss}>{children}</div>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}

/* ── Field (the old `inputSx` outlined input) ──────────────────────────────── */

const fieldCss = css({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  w: "100%",
  boxSizing: "border-box",
  h: "36px",
  px: "12px",
  bg: "field",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  borderRadius: "8px",
  transition: "border-color .15s, box-shadow .15s",
  _hover: { borderColor: "borderStrong" },
  _focusWithin: { borderColor: "heading", boxShadow: "0 0 0 3px rgba(15, 23, 42, 0.06)" },
});
const fieldSmCss = css({ h: "34px" });
const fieldAdornCss = css({
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
  color: "rgba(0,0,0,0.38)",
  fontSize: "13px",
  lineHeight: 1,
  "& svg": { display: "block" },
});
const fieldInputCss = css({
  flex: 1,
  minW: 0,
  w: "100%",
  boxSizing: "border-box",
  m: 0,
  p: 0,
  border: "none",
  outline: "none",
  bg: "transparent",
  appearance: "none",
  fontFamily: "inherit",
  fontSize: "13px",
  lineHeight: 1.5,
  color: "heading",
  _placeholder: { color: "placeholder", opacity: 1 },
});

/* ── Chips ─────────────────────────────────────────────────────────────────── */

const chipCss = css({
  display: "inline-flex",
  alignItems: "center",
  boxSizing: "border-box",
  h: "26px",
  borderRadius: "pill",
  bg: "fill",
  color: "heading",
  fontSize: "12px",
  fontWeight: 500,
  whiteSpace: "nowrap",
});
const chipLabelCss = css({ px: "10px" });
const chipRemoveCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  ml: "-6px",
  mr: "4px",
  p: 0,
  border: "none",
  bg: "transparent",
  color: "placeholder",
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "color .15s",
  _hover: { color: "heading" },
  "& svg": { display: "block" },
});

/* ── Category rows ─────────────────────────────────────────────────────────── */

const catListCss = css({
  maxH: "240px",
  overflowY: "auto",
  mx: "-8px",
  px: "8px",
  "&::-webkit-scrollbar": { width: "6px" },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "#E2E8F0", borderRadius: "4px" },
});
const rowCss = css({
  display: "flex",
  alignItems: "center",
  m: 0,
  py: "7px",
  px: "8px",
  borderRadius: "6px",
  cursor: "pointer",
  _hover: { bg: "fill" },
});
const catBoxCss = css({
  boxSizing: "border-box",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  w: "18px",
  h: "18px",
  mr: "10px",
  borderRadius: "3px",
  borderWidth: "1.6px",
  borderStyle: "solid",
  borderColor: "borderStrong",
  bg: "transparent",
  color: "white",
  transition: "background-color .12s, border-color .12s",
  "& svg": { display: "block", opacity: 0 },
  "&[data-state=checked]": { bg: "heading", borderColor: "heading", "& svg": { opacity: 1 } },
  "&[data-focus-visible]": { boxShadow: "focusRing" },
});
const catLabelRowCss = css({ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, w: "100%" });
const catLabelCss = css({ fontSize: "13px", lineHeight: 1.5, color: "ink2", fontWeight: 400, "&[data-state=checked]": { color: "rgba(0,0,0,0.87)", fontWeight: 500 } });
const catCountCss = css({ fontSize: "12px", lineHeight: 1.5, color: "rgba(0,0,0,0.38)", fontVariantNumeric: "tabular-nums" });

/* ── Radio rows ────────────────────────────────────────────────────────────── */

const radioGroupCss = css({ display: "flex", flexDirection: "column", gap: "2px" });
const radioRowCss = css({
  display: "flex",
  alignItems: "center",
  m: 0,
  mx: "-8px",
  py: "7px",
  px: "8px",
  borderRadius: "6px",
  cursor: "pointer",
  _hover: { bg: "fill" },
});
const radioControlSpacing = css({ mr: "10px" });
const radioLabelCss = css({ fontSize: "13px", lineHeight: 1.5, color: "ink2", fontWeight: 400, "&[data-state=checked]": { color: "rgba(0,0,0,0.87)", fontWeight: 500 } });

/* ── Budget ────────────────────────────────────────────────────────────────── */

const budgetWrapCss = css({ px: "6px" });
const sliderCss = css({ mt: "8px", mb: "20px" });
const budgetRowCss = css({ display: "flex", alignItems: "flex-end", gap: "8px" });
const budgetFieldCss = css({ flex: 1 });
const budgetLabelCss = css({
  fontSize: "11px",
  lineHeight: 1.5,
  color: "ink2",
  fontWeight: 500,
  mb: "4px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});
const budgetDashCss = css({ pb: "8px", color: "borderStrong" });

/* ── Sidebar shell ─────────────────────────────────────────────────────────── */

const asideCss = css({
  bg: "field",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  borderRadius: "14px",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
  overflow: "hidden",
  md: { position: "sticky", top: "96px" },
});
const padCss = css({ p: "14px 20px", "&[data-expanded]": { p: "20px 20px 24px" } });
const headerCss = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  userSelect: "none",
  cursor: "pointer",
  mb: 0,
  lg: { cursor: "default" },
  "&[data-expanded]": { mb: "16px" },
});
const headerLeftCss = css({ display: "flex", alignItems: "center", gap: "8px" });
const headerTitleCss = css({ fontSize: "15px", fontWeight: 600, lineHeight: 1.5, letterSpacing: "-0.01em" });
const countBadgeCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  h: "18px",
  minW: "18px",
  px: "6px",
  borderRadius: "pill",
  bg: "heading",
  color: "#FFF",
  fontSize: "11px",
  fontWeight: 600,
});
const headerChevronCss = css({
  color: "rgba(0,0,0,0.38)",
  flexShrink: 0,
  ml: "auto",
  transition: "transform 0.2s ease",
  "[data-expanded] > &": { transform: "rotate(180deg)" },
});
const resetBtnCss = css({
  minW: 0,
  m: 0,
  p: "2px 4px",
  border: "none",
  borderRadius: "4px",
  bg: "transparent",
  color: "ink2",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing: "0.02857em",
  cursor: "pointer",
  transition: "color .15s",
  _hover: { color: "rgba(0,0,0,0.87)", bg: "transparent" },
});
const chipsWrapCss = css({ display: "flex", flexWrap: "wrap", gap: "6px", mb: "20px" });
const dividerCss = css({ h: "1px", my: "12px", bg: "fill", border: "none" });

function BudgetField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className={budgetFieldCss}>
      <div className={budgetLabelCss}>{label}</div>
      <div className={cx(fieldCss, fieldSmCss)}>
        <span className={fieldAdornCss}>$</span>
        <input
          className={fieldInputCss}
          value={value.toLocaleString()}
          onChange={e => {
            const n = Number(e.target.value.replace(/[^0-9]/g, ""));
            onChange(Number.isFinite(n) ? n : 0);
          }}
        />
      </div>
    </div>
  );
}

// On small screens the sidebar sits above the results and would otherwise fill
// the whole viewport — collapse it behind the "Filters" header there.
const DESKTOP_MQ = "(min-width: 1024px)";
const subscribeDesktop = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getDesktop = () => window.matchMedia(DESKTOP_MQ).matches;
const getDesktopServer = () => false;

export default function FiltersSidebar({ filters, onChange, categories, budgetMax = 10000 }: FiltersSidebarProps) {
  const [catQuery, setCatQuery] = React.useState("");

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });

  const toggleCategory = (id: string) => {
    const next = filters.categories.includes(id) ? filters.categories.filter(c => c !== id) : [...filters.categories, id];
    set("categories", next);
  };

  const reset = () =>
    onChange({ query: filters.query, categories: [], budget: [0, budgetMax], delivery: "any", rating: "any" });

  const activeCount =
    filters.categories.length +
    (filters.budget[0] !== 0 || filters.budget[1] !== budgetMax ? 1 : 0) +
    (filters.delivery !== "any" ? 1 : 0) +
    (filters.rating !== "any" ? 1 : 0);

  const filteredCats = categories.filter(c => c.label.toLowerCase().includes(catQuery.toLowerCase()));
  const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`);

  const desktop = React.useSyncExternalStore(subscribeDesktop, getDesktop, getDesktopServer);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const expanded = desktop || mobileOpen;

  return (
    <aside className={asideCss}>
      <div className={padCss} data-expanded={expanded ? "" : undefined}>
        {/* Header — tap to expand/collapse on mobile */}
        <div
          className={headerCss}
          data-expanded={expanded ? "" : undefined}
          onClick={() => { if (!desktop) setMobileOpen(v => !v); }}>
          <span className={headerLeftCss}>
            <span className={headerTitleCss}>Filters</span>
            {activeCount > 0 && <span className={countBadgeCss}>{activeCount}</span>}
          </span>
          {!desktop && <ChevronDown size={20} className={headerChevronCss} />}
          {activeCount > 0 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); reset(); }}
              className={resetBtnCss}>
              Reset
            </button>
          )}
        </div>

        <Collapsible.Root open={expanded} lazyMount={false} unmountOnExit={false}>
          <Collapsible.Content className={collapseCss}>
        {/* Active filter chips */}
        {activeCount > 0 && (
          <div className={chipsWrapCss}>
            {filters.categories.map(id => {
              const cat = categories.find(c => c.id === id);
              if (!cat) return null;
              return (
                <span key={id} className={chipCss}>
                  <span className={chipLabelCss}>{cat.label}</span>
                  <button type="button" aria-label={`Remove ${cat.label}`} onClick={() => toggleCategory(id)} className={chipRemoveCss}>
                    <X size={14} />
                  </button>
                </span>
              );
            })}
            {(filters.budget[0] !== 0 || filters.budget[1] !== budgetMax) && (
              <span className={chipCss}>
                <span className={chipLabelCss}>{`${fmt(filters.budget[0])} – ${fmt(filters.budget[1])}`}</span>
                <button type="button" aria-label="Clear budget filter" onClick={() => set("budget", [0, budgetMax])} className={chipRemoveCss}>
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.delivery !== "any" && (
              <span className={chipCss}>
                <span className={chipLabelCss}>{`≤ ${filters.delivery} days`}</span>
                <button type="button" aria-label="Clear delivery filter" onClick={() => set("delivery", "any")} className={chipRemoveCss}>
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.rating !== "any" && (
              <span className={chipCss}>
                <span className={chipLabelCss}>{`${filters.rating}★ & up`}</span>
                <button type="button" aria-label="Clear rating filter" onClick={() => set("rating", "any")} className={chipRemoveCss}>
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Category */}
        <FilterSection title="Category" meta={filters.categories.length > 0 ? `${filters.categories.length} selected` : undefined}>
          <div className={cx(fieldCss, css({ mb: "8px" }))}>
            <span className={fieldAdornCss}>
              <Search size={16} />
            </span>
            <input
              className={fieldInputCss}
              placeholder="Search categories"
              value={catQuery}
              onChange={e => setCatQuery(e.target.value)}
            />
          </div>
          <div className={catListCss}>
            {filteredCats.map(cat => {
              const checked = filters.categories.includes(cat.id);
              return (
                <ArkCheckbox.Root
                  key={cat.id}
                  checked={checked}
                  onCheckedChange={() => toggleCategory(cat.id)}
                  className={rowCss}>
                  <ArkCheckbox.Control className={catBoxCss}>
                    <Check size={13} strokeWidth={3} />
                  </ArkCheckbox.Control>
                  <span className={catLabelRowCss}>
                    <ArkCheckbox.Label className={catLabelCss}>{cat.label}</ArkCheckbox.Label>
                    {cat.count != null && <span className={catCountCss}>{cat.count}</span>}
                  </span>
                  <ArkCheckbox.HiddenInput />
                </ArkCheckbox.Root>
              );
            })}
          </div>
        </FilterSection>

        <hr className={dividerCss} />

        {/* Budget */}
        <FilterSection title="Budget" meta={`${fmt(filters.budget[0])} – ${fmt(filters.budget[1])}`}>
          <div className={budgetWrapCss}>
            <Slider
              className={sliderCss}
              value={filters.budget}
              onValueChange={v => set("budget", [v[0], v[1]] as [number, number])}
              min={0}
              max={budgetMax}
              step={50}
              formatValue={fmt}
              ariaLabels={["Minimum budget", "Maximum budget"]}
            />
            <div className={budgetRowCss}>
              <BudgetField label="Min" value={filters.budget[0]} onChange={v => set("budget", [v, filters.budget[1]])} />
              <div className={budgetDashCss}>–</div>
              <BudgetField label="Max" value={filters.budget[1]} onChange={v => set("budget", [filters.budget[0], v])} />
            </div>
          </div>
        </FilterSection>

        <hr className={dividerCss} />

        {/* Delivery */}
        <FilterSection title="Delivery time" meta={filters.delivery === "any" ? undefined : `≤ ${filters.delivery} days`}>
          <RadioGroupPrimitive.Root
            value={filters.delivery}
            onValueChange={d => { if (d.value) set("delivery", d.value as Filters["delivery"]); }}
            className={radioGroupCss}>
            {(["any", "3", "7", "14", "30"] as const).map(v => {
              const label = v === "any" ? "Any time" : `Up to ${v} days`;
              return (
                <RadioGroupPrimitive.Item key={v} value={v} className={radioRowCss}>
                  <RadioGroupPrimitive.ItemControl className={cx(radioControl, radioControlSpacing)} />
                  <RadioGroupPrimitive.ItemText className={radioLabelCss}>{label}</RadioGroupPrimitive.ItemText>
                  <RadioGroupPrimitive.ItemHiddenInput />
                </RadioGroupPrimitive.Item>
              );
            })}
          </RadioGroupPrimitive.Root>
        </FilterSection>

        <hr className={dividerCss} />

        {/* Rating */}
        <FilterSection title="Freelancer rating" defaultOpen={false} meta={filters.rating === "any" ? undefined : `${filters.rating}★ & up`}>
          <RadioGroupPrimitive.Root
            value={filters.rating}
            onValueChange={d => { if (d.value) set("rating", d.value as Filters["rating"]); }}
            className={radioGroupCss}>
            {([{ v: "any", label: "Any rating" }, { v: "4.5", label: "4.5 & up" }, { v: "4.0", label: "4.0 & up" }] as const).map(opt => (
              <RadioGroupPrimitive.Item key={opt.v} value={opt.v} className={radioRowCss}>
                <RadioGroupPrimitive.ItemControl className={cx(radioControl, radioControlSpacing)} />
                <RadioGroupPrimitive.ItemText className={radioLabelCss}>{opt.label}</RadioGroupPrimitive.ItemText>
                <RadioGroupPrimitive.ItemHiddenInput />
              </RadioGroupPrimitive.Item>
            ))}
          </RadioGroupPrimitive.Root>
        </FilterSection>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    </aside>
  );
}
