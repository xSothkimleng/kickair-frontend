"use client";

import { useState } from "react";
import { Box, Typography, Popover, IconButton } from "@mui/material";
import { CalendarTodayOutlined, ChevronLeft, ChevronRight, KeyboardArrowDown } from "@mui/icons-material";
import { FieldShell } from "./FieldShell";
import { FieldBaseProps, tokens, FOCUS_RING } from "./tokens";

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

export default function DatePicker({
  label, helper, error, required, fullWidth = true, disabled, value = null, onChange, placeholder = "Select a date…", id, minDate, maxDate,
}: DatePickerProps) {
  // Guard against an Invalid Date being passed in (e.g. a mis-parsed value) — using it
  // would make the calendar build an array of NaN length and crash the whole page.
  const safeValue = value && !Number.isNaN(value.getTime()) ? value : null;
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [view, setView] = useState(() => {
    const base = safeValue ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const open = Boolean(anchor);

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
  const pick = (d: number) => { onChange?.(new Date(year, month, d)); setAnchor(null); };

  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <Box
        id={id}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={(e) => !disabled && setAnchor(e.currentTarget)}
        onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setAnchor(e.currentTarget); } }}
        sx={{
          display: "flex", alignItems: "center", gap: 1, height: 46, px: 1.75, borderRadius: "10px",
          cursor: disabled ? "not-allowed" : "pointer",
          backgroundColor: disabled ? tokens.fill : "#fff",
          border: `1px solid ${error ? tokens.error : tokens.border}`,
          transition: "border-color .15s, box-shadow .15s",
          "&:hover": { borderColor: disabled ? tokens.border : tokens.borderStrong },
          ...(open ? { borderColor: tokens.accent, boxShadow: FOCUS_RING } : {}),
        }}>
        <Box sx={{ display: "flex", color: tokens.muted }}><CalendarTodayOutlined sx={{ fontSize: 18 }} /></Box>
        <Typography sx={{ flex: 1, fontSize: 15, color: safeValue ? tokens.heading : tokens.placeholder }}>
          {safeValue ? formatDate(safeValue) : placeholder}
        </Typography>
        <Box sx={{ display: "flex", color: tokens.muted }}><KeyboardArrowDown sx={{ fontSize: 20 }} /></Box>
      </Box>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ paper: { sx: { mt: 1, borderRadius: "12px", border: `1px solid ${tokens.border}`, boxShadow: "0 12px 32px rgba(15,23,42,0.14)", p: 1.75, width: 280 } } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <IconButton size="small" onClick={() => setView(new Date(year, month - 1, 1))} aria-label="Previous month"><ChevronLeft fontSize="small" /></IconButton>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: tokens.heading }}>{MONTHS[month]} {year}</Typography>
          <IconButton size="small" onClick={() => setView(new Date(year, month + 1, 1))} aria-label="Next month"><ChevronRight fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.25, mb: 0.5 }}>
          {DOW.map((d, i) => <Box key={i} sx={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: tokens.muted, py: 0.5 }}>{d}</Box>)}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.25, justifyItems: "center" }}>
          {cells.map((d, i) => d === null ? <Box key={i} /> : (() => {
            const date = new Date(year, month, d);
            const selected = sameDay(safeValue, date);
            return (
              <Box
                key={i}
                component="button"
                disabled={isDisabled(d)}
                onClick={() => pick(d)}
                sx={{
                  width: 34, height: 34, border: "none", borderRadius: "8px", fontFamily: "inherit",
                  cursor: isDisabled(d) ? "not-allowed" : "pointer",
                  background: selected ? tokens.accent : "transparent",
                  color: isDisabled(d) ? tokens.placeholder : selected ? "#fff" : tokens.body,
                  fontSize: 13.5, fontWeight: selected ? 500 : 400,
                  boxShadow: sameDay(today, date) && !selected ? `inset 0 0 0 1px ${tokens.borderStrong}` : "none",
                  "&:hover:not(:disabled)": { background: selected ? tokens.accent : tokens.fill },
                }}>
                {d}
              </Box>
            );
          })())}
        </Box>
      </Popover>
    </FieldShell>
  );
}
