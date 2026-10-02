"use client";

import { useMemo, useState } from "react";
import { Combobox, createListCollection } from "@ark-ui/react";
import { ChevronDown, Plus, X } from "lucide-react";
import { css, cx } from "styled-system/css";
import { FieldShell } from "./FieldShell";
import { fieldControl, fieldEmpty, fieldIconButton, fieldIndicator, fieldOption, fieldOptionCreate, fieldOptionList, fieldPopup, fieldPositioner, fieldRoot } from "./field";
import { FieldBaseProps } from "./tokens";

export interface AutocompleteInputProps extends FieldBaseProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  options: string[];
  placeholder?: string;
  id?: string;
  /**
   * Free text is a valid value (reported on every keystroke), not just the listed options.
   * Text that isn't listed also gets an `Add "xyz"` row, so it is plain that it is accepted.
   */
  freeSolo?: boolean;
}

interface Item {
  label: string;
  value: string;
  /** Typed text when this is the synthetic `Add "xyz"` row. */
  create?: string;
}

const CREATE_PREFIX = "__create__";

export const matches = (label: string, query: string) => label.toLowerCase().includes(query.trim().toLowerCase());

const popupHidden = css({ display: "none" });

export default function AutocompleteInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = null, onChange, options, placeholder, id, freeSolo,
}: AutocompleteInputProps) {
  // `query` is what the user is currently typing; null means "show the committed value".
  const [query, setQuery] = useState<string | null>(null);
  const inputValue = query ?? value ?? "";

  const typed = (query ?? "").trim();

  const items = useMemo<Item[]>(() => {
    const list: Item[] = options.filter((o) => !typed || matches(o, typed)).map((o) => ({ label: o, value: o }));
    if (freeSolo && typed && !options.some((o) => o.toLowerCase() === typed.toLowerCase())) {
      list.push({ label: `Add "${typed}"`, value: CREATE_PREFIX + typed, create: typed });
    }
    return list;
  }, [options, typed, freeSolo]);
  const collection = useMemo(() => createListCollection<Item>({ items, itemToString: (item) => item.create ?? item.label }), [items]);
  // A free-text field has no "selected option": its value is whatever is typed, and the
  // list is only suggestions. Marking the current text as selected (when it happened to
  // match a suggestion) made the first keystroke of an edit deselect it, which cleared
  // the field and swallowed the key.
  const selected = !freeSolo && value && options.includes(value) ? [value] : [];

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
        onValueChange={(d) => { const item = d.items[0]; if (item) onChange?.(item.create ?? item.value); }}
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
        {/* A free-text field with no suggestions hides the popup rather than unmounting it:
            Ark positions the popup once, on open, so a remounted one lands at the window's top-left. */}
        <Combobox.Positioner className={fieldPositioner}>
          <Combobox.Content className={cx(fieldPopup, fieldOptionList, freeSolo && items.length === 0 && popupHidden)}>
            {items.length === 0 && <div className={fieldEmpty}>No matches</div>}
            {items.map((item) => (
              <Combobox.Item key={item.value} item={item} className={cx(fieldOption, item.create !== undefined && fieldOptionCreate)}>
                {item.create !== undefined && <Plus size={16} />}
                <Combobox.ItemText>{item.label}</Combobox.ItemText>
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Combobox.Root>
    </FieldShell>
  );
}
