"use client";

import { useState } from "react";
import { Popover } from "@ark-ui/react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { css, cva, cx } from "styled-system/css";
import { FieldShell } from "./FieldShell";
import { fieldAdornment, fieldIndicator, fieldPopup, fieldPositioner, fieldRoot, fieldTrigger, fieldTriggerText } from "./field";
import { FieldBaseProps } from "./tokens";

export interface DatePickerProps extends Omit<FieldBaseProps, "size"> {
  value?: Date | null;
  onChange?: (date: Date) => void;
  placeholder?: string;
  id?: string;
  minDate?: Date;
  maxDate?: Date;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["S", "M", "T", "W", "T", "F", "S"];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date | null | undefined, b: Date) =>
  !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const formatDate = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

type Pane = "days" | "months" | "years";

const panel = css({ w: "280px", p: "14px" });
const headerRow = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "8px" });

const navBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  w: "28px",
  h: "28px",
  p: 0,
  border: "none",
  borderRadius: "pill",
  bg: "transparent",
  color: "body",
  cursor: "pointer",
  fontFamily: "inherit",
  _hover: { bg: "fill" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block" },
});

const headerBtn = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2px",
  px: "8px",
  py: "4px",
  border: "none",
  borderRadius: "8px",
  bg: "transparent",
  fontFamily: "inherit",
  fontSize: "14px",
  fontWeight: 600,
  color: "heading",
  cursor: "pointer",
  _hover: { bg: "fill" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block", color: "muted", transition: "transform .15s" },
  "&[data-open] svg": { transform: "rotate(180deg)" },
});

const grid3 = css({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" });
const grid7 = css({ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", justifyItems: "center" });
const dowCell = css({ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "muted", py: "4px", w: "100%" });

const cell = cva({
  base: {
    h: "34px",
    p: 0,
    border: "none",
    borderRadius: "8px",
    bg: "transparent",
    fontFamily: "inherit",
    fontSize: "13.5px",
    fontWeight: 400,
    color: "body",
    cursor: "pointer",
    transition: "background-color .12s",
    _hover: { bg: "fill" },
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
    _disabled: { color: "placeholder", cursor: "not-allowed", _hover: { bg: "transparent" } },
  },
  variants: {
    shape: { day: { w: "34px" }, wide: { w: "100%" } },
    selected: { true: { bg: "accent", color: "white", fontWeight: 500, _hover: { bg: "accent" } } },
    today: { true: { boxShadow: "inset 0 0 0 1px token(colors.borderStrong)" } },
  },
  defaultVariants: { shape: "wide" },
});

export default function DatePicker({
  label, helper, error, required, fullWidth = true, disabled, value = null, onChange, placeholder = "Select a date…", id, minDate, maxDate,
}: DatePickerProps) {
  // Guard against an Invalid Date being passed in (e.g. a mis-parsed value) — using it
  // would make the calendar build an array of NaN length and crash the whole page.
  const safeValue = value && !Number.isNaN(value.getTime()) ? value : null;
  const [open, setOpen] = useState(false);
  const [pane, setPane] = useState<Pane>("days");
  const [view, setView] = useState(() => {
    const base = safeValue ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const min = minDate ? startOfDay(minDate) : null;
  const max = maxDate ? startOfDay(maxDate) : null;
  const today = startOfDay(new Date());

  const isDisabled = (d: number) => {
    const date = new Date(year, month, d);
    return (min != null && date < min) || (max != null && date > max);
  };
  const pick = (d: number) => { onChange?.(new Date(year, month, d)); setOpen(false); };

  // Years pane shows a stable 12-year page (e.g. 2016–2027); arrows jump a page.
  const yearPageStart = year - (year % 12);
  const yearCells = Array.from({ length: 12 }, (_, i) => yearPageStart + i);

  const headerLabel = pane === "years" ? `${yearPageStart} – ${yearPageStart + 11}` : `${MONTHS[month]} ${year}`;
  const onPrev = () => (pane === "years" ? setView(new Date(year - 12, month, 1)) : setView(new Date(year, month - 1, 1)));
  const onNext = () => (pane === "years" ? setView(new Date(year + 12, month, 1)) : setView(new Date(year, month + 1, 1)));

  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <Popover.Root
        open={open}
        onOpenChange={(d) => { if (d.open) setPane("days"); setOpen(d.open); }}
        ids={id ? { trigger: id } : undefined}
        positioning={{ placement: "bottom-start", strategy: "fixed", gutter: 6 }}
        portalled={false}
        lazyMount
        unmountOnExit>
        <Popover.Trigger
          className={cx(fieldRoot({ size: "md" }), fieldTrigger)}
          disabled={disabled}
          data-invalid={error ? "" : undefined}
          data-disabled={disabled ? "" : undefined}>
          <span className={fieldAdornment}><Calendar size={18} /></span>
          <span className={fieldTriggerText} data-placeholder={safeValue ? undefined : ""}>
            {safeValue ? formatDate(safeValue) : placeholder}
          </span>
          <Popover.Indicator className={fieldIndicator}><ChevronDown size={18} /></Popover.Indicator>
        </Popover.Trigger>

        <Popover.Positioner className={fieldPositioner}>
          <Popover.Content className={cx(fieldPopup, panel)}>
            <div className={headerRow}>
              <button type="button" className={navBtn} onClick={onPrev} aria-label={pane === "years" ? "Previous years" : "Previous month"}><ChevronLeft size={16} /></button>
              {/* Clickable header: days → years → (pick year) → months → (pick month) → days */}
              <button
                type="button"
                className={headerBtn}
                data-open={pane === "days" ? undefined : ""}
                onClick={() => setPane(pane === "days" ? "years" : "days")}
                aria-label="Choose month and year">
                {headerLabel}
                <ChevronDown size={14} />
              </button>
              <button type="button" className={navBtn} onClick={onNext} aria-label={pane === "years" ? "Next years" : "Next month"}><ChevronRight size={16} /></button>
            </div>

            {pane === "years" && (
              <div className={grid3}>
                {yearCells.map((y) => (
                  <button
                    key={y}
                    type="button"
                    className={cell({ selected: y === (safeValue?.getFullYear() ?? year) })}
                    onClick={() => { setView(new Date(y, month, 1)); setPane("months"); }}>
                    {y}
                  </button>
                ))}
              </div>
            )}

            {pane === "months" && (
              <div className={grid3}>
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    className={cell({ selected: i === month })}
                    onClick={() => { setView(new Date(year, i, 1)); setPane("days"); }}>
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            )}

            {pane === "days" && (
              <>
                <div className={cx(grid7, css({ mb: "4px" }))}>
                  {DOW.map((d, i) => <div key={i} className={dowCell}>{d}</div>)}
                </div>
                <div className={grid7}>
                  {cells.map((d, i) => {
                    if (d === null) return <div key={i} />;
                    const date = new Date(year, month, d);
                    const selected = sameDay(safeValue, date);
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isDisabled(d)}
                        onClick={() => pick(d)}
                        className={cell({ shape: "day", selected, today: sameDay(today, date) && !selected })}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    </FieldShell>
  );
}
