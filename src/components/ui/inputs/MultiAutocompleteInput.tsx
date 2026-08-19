"use client";

import { useMemo } from "react";
import { Autocomplete, TextField, Chip, Box, createFilterOptions } from "@mui/material";
import { AddOutlined } from "@mui/icons-material";
import { FieldShell } from "./FieldShell";
import { fieldSx, FieldBaseProps, tokens } from "./tokens";
import type { SelectOption } from "./SelectInput";

interface InternalOption {
  value: string | number;
  label: string;
  /** Raw typed text when this is the synthetic `Add "xyz"` option. */
  createLabel?: string;
}

const filter = createFilterOptions<InternalOption>({ stringify: (o) => o.label });

export interface MultiAutocompleteInputProps extends FieldBaseProps {
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  /**
   * When provided, unknown entries show an `Add "xyz"` option (and Enter on free
   * text creates too). Called with the typed label — the parent is expected to
   * create the option (e.g. via API), append it to `options` and select it.
   */
  onCreate?: (label: string) => void | Promise<void>;
}

export default function MultiAutocompleteInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = [], onChange, options, placeholder = "Search…", id, onCreate,
}: MultiAutocompleteInputProps) {
  const selected = useMemo<InternalOption[]>(
    () => value.map((v) => {
      const match = options.find((o) => o.value === v);
      return match ? { value: match.value, label: match.label } : { value: v, label: String(v) };
    }),
    [value, options],
  );

  const handleChange = (items: (InternalOption | string)[]) => {
    const next: (string | number)[] = [];
    for (const item of items) {
      if (typeof item === "string") {
        // Free-text Enter: select the case-insensitive match if it exists, else create.
        const typed = item.trim();
        if (!typed) continue;
        const match = options.find((o) => o.label.toLowerCase() === typed.toLowerCase());
        if (match) {
          if (!next.includes(match.value)) next.push(match.value);
        } else {
          void onCreate?.(typed);
        }
      } else if (item.createLabel !== undefined) {
        void onCreate?.(item.createLabel);
      } else if (!next.includes(item.value)) {
        next.push(item.value);
      }
    }
    onChange?.(next);
  };

  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <Autocomplete<InternalOption, true, false, boolean>
        id={id}
        multiple
        freeSolo={!!onCreate}
        disableCloseOnSelect
        options={options.map((o) => ({ value: o.value, label: o.label }))}
        value={selected}
        disabled={disabled}
        fullWidth
        isOptionEqualToValue={(o, v) => o.value === v.value}
        getOptionLabel={(o) => (typeof o === "string" ? o : o.label)}
        filterOptions={(opts, params) => {
          const filtered = filter(opts, params);
          const typed = params.inputValue.trim();
          if (onCreate && typed) {
            const exists = opts.some((o) => o.label.toLowerCase() === typed.toLowerCase());
            if (!exists) filtered.push({ value: `__create__${typed}`, label: `Add "${typed}"`, createLabel: typed });
          }
          return filtered;
        }}
        onChange={(_, v) => handleChange(v as (InternalOption | string)[])}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props as { key: string } & React.HTMLAttributes<HTMLLIElement>;
          return (
            <Box component="li" key={key} {...optionProps}
              sx={{ fontSize: 14.5, ...(option.createLabel !== undefined && { color: tokens.accent, fontWeight: 600, display: "flex", alignItems: "center", gap: 0.75 }) }}>
              {option.createLabel !== undefined && <AddOutlined sx={{ fontSize: 16 }} />}
              {option.label}
            </Box>
          );
        }}
        renderTags={(vals, getTagProps) =>
          vals.map((opt, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip
                key={key}
                label={typeof opt === "string" ? opt : opt.label}
                size="small"
                {...tagProps}
                sx={{ backgroundColor: tokens.fill, border: `1px solid ${tokens.border}`, borderRadius: "7px", color: tokens.heading }}
              />
            );
          })
        }
        slotProps={{ paper: { sx: { borderRadius: "11px", mt: 0.5, boxShadow: "0 12px 32px rgba(15,23,42,0.14)" } } }}
        renderInput={(params) => (
          <TextField {...params} placeholder={value.length ? "" : placeholder} error={!!error} sx={fieldSx(size)} />
        )}
      />
    </FieldShell>
  );
}
