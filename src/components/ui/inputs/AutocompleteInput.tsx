"use client";

import { useMemo, useState } from "react";
import { Combobox, createListCollection } from "@ark-ui/react";
import { ChevronDown, X } from "lucide-react";
import { cx } from "styled-system/css";
import { FieldShell } from "./FieldShell";
import { fieldControl, fieldEmpty, fieldIconButton, fieldIndicator, fieldOption, fieldOptionList, fieldPopup, fieldPositioner, fieldRoot } from "./field";
import { FieldBaseProps } from "./tokens";

export interface AutocompleteInputProps extends FieldBaseProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  options: string[];
  placeholder?: string;
  id?: string;
  /** Free text is a valid value (reported on every keystroke), not just the listed options. */
  freeSolo?: boolean;
}

interface Item { label: string; value: string }

export const matches = (label: string, query: string) => label.toLowerCase().includes(query.trim().toLowerCase());

export default function AutocompleteInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = null, onChange, options, placeholder, id, freeSolo,
}: AutocompleteInputProps) {
  // `query` is what the user is currently typing; null means "show the committed value".
  const [query, setQuery] = useState<string | null>(null);
  const inputValue = query ?? value ?? "";

  const items = useMemo<Item[]>(() => {
    const q = query ?? "";
    return options.filter((o) => !q || matches(o, q)).map((o) => ({ label: o, value: o }));
  }, [options, query]);
  const collection = useMemo(() => createListCollection<Item>({ items }), [items]);
  const selected = value && options.includes(value) ? [value] : [];

  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <Combobox.Root
        collection={collection}
        value={selected}
        inputValue={inputValue}
        onInputValueChange={(d) => {
          if (d.reason === "input-change") {
            setQuery(d.inputValue);
            if (freeSolo) onChange?.(d.inputValue || null);
          } else {
            setQuery(null);
          }
        }}
        onOpenChange={(d) => { if (!d.open) setQuery(null); }}
        onValueChange={(d) => { const v = d.value[0]; if (v !== undefined) onChange?.(v); }}
        allowCustomValue={!!freeSolo}
        openOnClick
        disabled={disabled}
        invalid={!!error}
        ids={id ? { input: id } : undefined}
        positioning={{ placement: "bottom-start", strategy: "fixed", sameWidth: true, gutter: 4 }}
        lazyMount
        unmountOnExit>
        <Combobox.Control className={fieldRoot({ size })}>
          <Combobox.Input className={fieldControl} placeholder={placeholder} autoComplete="off" />
          {value && !disabled && (
            <Combobox.ClearTrigger className={fieldIconButton} aria-label="Clear" onClick={() => { setQuery(null); onChange?.(null); }}>
              <X size={15} />
            </Combobox.ClearTrigger>
          )}
          <Combobox.Trigger className={cx(fieldIconButton, fieldIndicator)} aria-label="Show options">
            <ChevronDown size={18} />
          </Combobox.Trigger>
        </Combobox.Control>
        {(items.length > 0 || !freeSolo) && (
          <Combobox.Positioner className={fieldPositioner}>
            <Combobox.Content className={cx(fieldPopup, fieldOptionList)}>
              {items.length === 0 && <div className={fieldEmpty}>No matches</div>}
              {items.map((item) => (
                <Combobox.Item key={item.value} item={item} className={fieldOption}>
                  <Combobox.ItemText>{item.label}</Combobox.ItemText>
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Positioner>
        )}
      </Combobox.Root>
    </FieldShell>
  );
}
