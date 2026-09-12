"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { css, cva } from "styled-system/css";
import { ServiceCategory } from "@/types/service";
import { Expertise } from "@/types/user";
import { JobPostFilters } from "@/types/job";

interface JobFiltersProps {
  categories: ServiceCategory[]; // category tree (aisles with children)
  expertises: Expertise[];
  filters: JobPostFilters;
  onChange: (filters: JobPostFilters) => void;
}

function findAisleId(tree: ServiceCategory[], categoryId?: number): number | null {
  if (!categoryId) return null;
  for (const a of tree) {
    if (a.id === categoryId) return a.id;
    if ((a.children ?? []).some(c => c.id === categoryId)) return a.id;
  }
  return null;
}

/* ── static styles ── */
const root = css({ display: "flex", flexDirection: "column", gap: "24px" });
const headRow = css({ display: "flex", justifyContent: "space-between", alignItems: "center" });
const headTitle = css({ lineHeight: 1.5, fontSize: "16px", fontWeight: 600, letterSpacing: "-0.01em" });
const clearBtn = css({
  border: "none", bg: "transparent", p: 0, m: 0, cursor: "pointer",
  fontFamily: "inherit", fontSize: "13px", fontWeight: 500, color: "accent",
  _hover: { textDecoration: "underline" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const section = css({ display: "flex", flexDirection: "column", gap: "12px" });
const labelText = css({ lineHeight: 1.5, fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "ink3" });
const tree = css({ display: "flex", flexDirection: "column", gap: "2px" });
const aisleWrap = css({ display: "flex", flexDirection: "column" });
const aisleBtn = css({
  display: "flex", alignItems: "center", gap: "8px",
  border: "none", bg: "transparent", p: "8px 4px", m: 0,
  cursor: "pointer", fontFamily: "inherit", w: "100%", boxSizing: "border-box", textAlign: "left",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const aisleChevron = cva({
  base: { color: "ink3", flexShrink: 0, transition: "transform .15s", "& svg": { display: "block" } },
  variants: { expanded: { true: { transform: "rotate(90deg)" }, false: {} } },
});
const aisleText = css({ lineHeight: 1.5, fontSize: "14px", fontWeight: 500, color: "ink" });
const shelfList = css({ display: "flex", flexDirection: "column", gap: "2px", pl: "22px", pb: "4px" });
const shelfBtn = cva({
  base: {
    display: "flex", alignItems: "center",
    border: "none", p: "7px 10px", m: 0, borderRadius: "8px",
    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
  },
  variants: {
    selected: {
      true: { bg: "#000", color: "#fff" },
      false: { bg: "transparent", color: "ink2", _hover: { bg: "surface2", color: "ink" } },
    },
  },
});
const shelfText = cva({
  base: { lineHeight: 1.5, fontSize: "13.5px" },
  variants: { selected: { true: { fontWeight: 600 }, false: { fontWeight: 500 } } },
});
const emptyShelves = css({ lineHeight: 1.5, fontSize: "12.5px", color: "ink3", pl: "10px", py: "4px" });
const hairlineRow = css({ h: "1px", bg: "hairline" });
const budgetRow = css({ display: "flex", gap: "10px" });
const budgetField = css({ position: "relative", flex: 1 });
const budgetPrefix = css({ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "ink3", pointerEvents: "none" });
const budgetInput = css({
  w: "100%", boxSizing: "border-box", h: "42px", pl: "24px", pr: "10px", m: 0,
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairlineStrong", borderRadius: "input",
  bg: "surface", color: "ink", fontFamily: "mono", fontSize: "14px", outline: "none",
  _placeholder: { color: "ink3", opacity: 1 },
  _focus: { borderColor: "accent", boxShadow: "0 0 0 3px rgba(0, 113, 227, 0.05)" },
});
const chipRow = css({ display: "flex", gap: "8px", flexWrap: "wrap" });
const skillChip = cva({
  base: {
    h: "32px", px: "12px", m: 0, borderRadius: "pill", border: "none",
    cursor: "pointer", fontFamily: "inherit", fontSize: "12.5px", fontWeight: 500,
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
  },
  variants: {
    on: {
      true: { bg: "#000", color: "#fff", _hover: { bg: "#000" } },
      false: { bg: "rgba(0,0,0,0.05)", color: "ink2", _hover: { bg: "rgba(0,0,0,0.09)" } },
    },
  },
});

export default function JobFilters({ categories, expertises, filters, onChange }: JobFiltersProps) {
  const [open, setOpen] = useState<number | null>(findAisleId(categories, filters.category_id) ?? categories[0]?.id ?? null);

  const update = (patch: Partial<JobPostFilters>) => onChange({ ...filters, ...patch, page: 1 });
  const active = !!filters.category_id || !!filters.budget_min || !!filters.budget_max || (filters.skill_ids?.length ?? 0) > 0;
  const skillIds = filters.skill_ids ?? [];

  return (
    <div className={root}>
      <div className={headRow}>
        <p className={headTitle}>Filters</p>
        {active && (
          <button type="button" onClick={() => onChange({ page: 1 })} className={clearBtn}>
            Clear all
          </button>
        )}
      </div>

      {/* Category tree */}
      <div className={section}>
        <Label>Category</Label>
        <div className={tree}>
          {categories.map(aisle => {
            const expanded = open === aisle.id;
            return (
              <div key={aisle.id} className={aisleWrap}>
                <button type="button" onClick={() => setOpen(expanded ? null : aisle.id)} className={aisleBtn}>
                  <span className={aisleChevron({ expanded })}><ChevronRight size={16} /></span>
                  <span className={aisleText}>{aisle.name ?? aisle.category_name}</span>
                </button>
                {expanded && (
                  <div className={shelfList}>
                    {(aisle.children ?? []).map(shelf => {
                      const sel = filters.category_id === shelf.id;
                      return (
                        <button key={shelf.id} type="button" onClick={() => update({ category_id: sel ? undefined : shelf.id })}
                          className={shelfBtn({ selected: sel })}>
                          <span className={shelfText({ selected: sel })}>{shelf.name ?? shelf.category_name}</span>
                        </button>
                      );
                    })}
                    {(aisle.children ?? []).length === 0 && <p className={emptyShelves}>No subcategories yet</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={hairlineRow} />

      {/* Budget */}
      <div className={section}>
        <Label>Budget (USD)</Label>
        <div className={budgetRow}>
          {(["budget_min", "budget_max"] as const).map(k => (
            <div key={k} className={budgetField}>
              <span className={budgetPrefix}>$</span>
              <input
                inputMode="numeric"
                placeholder={k === "budget_min" ? "Min" : "Max"}
                value={filters[k] ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  update({ [k]: v ? Number(v) : undefined });
                }}
                className={budgetInput}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={hairlineRow} />

      {/* Skills */}
      <div className={section}>
        <Label>Required skills</Label>
        <div className={chipRow}>
          {expertises.map(e => {
            const on = skillIds.includes(e.id);
            return (
              <button key={e.id} type="button"
                onClick={() => update({ skill_ids: on ? skillIds.filter(i => i !== e.id) : [...skillIds, e.id] })}
                className={skillChip({ on })}>
                {e.expertise_name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className={labelText}>{children}</p>;
}
