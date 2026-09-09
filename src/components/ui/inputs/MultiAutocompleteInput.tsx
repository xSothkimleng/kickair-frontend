"use client";

import { useMemo, useState } from "react";
import { Combobox, createListCollection } from "@ark-ui/react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { cx } from "styled-system/css";
import { FieldShell } from "./FieldShell";
import { matches } from "./AutocompleteInput";
import { fieldChip, fieldChipArea, fieldChipRemove, fieldControl, fieldEmpty, fieldIconButton, fieldIndicator, fieldOption, fieldOptionBox, fieldOptionCreate, fieldOptionList, fieldPopup, fieldPositioner, fieldRoot } from "./field";
import type { SelectOption } from "./SelectInput";
import { FieldBaseProps } from "./tokens";

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

interface Item {
  label: string;
  value: string;
  raw?: string | number;
  /** Raw typed text when this is the synthetic `Add "xyz"` row. */
  create?: string;
}

const CREATE_PREFIX = "__create__";

export default function MultiAutocompleteInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = [], onChange, options, placeholder = "Search…", id, onCreate,
}: MultiAutocompleteInputProps) {
  const [query, setQuery] = useState<string | null>(null);
  const typed = (query ?? "").trim();

  const items = useMemo<Item[]>(() => {
    const list: Item[] = options
      .filter((o) => !typed || matches(o.label, typed))
      .map((o) => ({ label: o.label, value: String(o.value), raw: o.value }));
    if (onCreate && typed && !options.some((o) => o.label.toLowerCase() === typed.toLowerCase())) {
      list.push({ label: `Add "${typed}"`, value: CREATE_PREFIX + typed, create: typed });
    }
    return list;
  }, [options, typed, onCreate]);
  const collection = useMemo(() => createListCollection<Item>({ items }), [items]);

  const selected = value.map(String);
  const labelOf = (v: string | number) => options.find((o) => o.value === v)?.label ?? String(v);

  /** Free-text Enter: select the case-insensitive match if it exists, else create. */
  const commitTyped = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const match = options.find((o) => o.label.toLowerCase() === t.toLowerCase());
    if (match) {
      if (!value.includes(match.value)) onChange?.([...value, match.value]);
    } else {
      void onCreate?.(t);
    }
    setQuery(null);
  };

  const handleValueChange = (next: string[]) => {
    const out: (string | number)[] = [];
    for (const v of next) {
      if (v.startsWith(CREATE_PREFIX)) { void onCreate?.(v.slice(CREATE_PREFIX.length)); continue; }
      const opt = options.find((o) => String(o.value) === v);
      if (opt) { if (!out.includes(opt.value)) out.push(opt.value); continue; }
      const prev = value.find((x) => String(x) === v); // stale-but-selected value not in options
      if (prev !== undefined && !out.includes(prev)) out.push(prev);
    }
    onChange?.(out);
  };

  const remove = (v: string | number) => onChange?.(value.filter((x) => x !== v));

  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <Combobox.Root
        collection={collection}
        multiple
        closeOnSelect={false}
        selectionBehavior="clear"
        value={selected}
        inputValue={query ?? ""}
        onInputValueChange={(d) => setQuery(d.reason === "input-change" ? d.inputValue : null)}
        onOpenChange={(d) => { if (!d.open) setQuery(null); }}
        onValueChange={(d) => handleValueChange(d.value)}
        allowCustomValue={!!onCreate}
        openOnClick
        disabled={disabled}
        invalid={!!error}
        ids={id ? { input: id } : undefined}
        positioning={{ placement: "bottom-start", strategy: "fixed", sameWidth: true, gutter: 4 }}
        lazyMount
        unmountOnExit>
        <Combobox.Control className={fieldRoot({ size })}>
          <span className={fieldChipArea}>
            {value.map((v) => (
              <span key={String(v)} className={fieldChip}>
                {labelOf(v)}
                <button
                  type="button"
                  className={fieldChipRemove}
                  disabled={disabled}
                  aria-label={`Remove ${labelOf(v)}`}
                  onClick={(e) => { e.stopPropagation(); remove(v); }}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <Combobox.Context>
              {(api) => (
                <Combobox.Input
                  className={fieldControl}
                  placeholder={value.length ? "" : placeholder}
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && typed && !api.highlightedValue) { e.preventDefault(); commitTyped(typed); }
                  }}
                />
              )}
            </Combobox.Context>
          </span>
          <Combobox.Trigger className={cx(fieldIconButton, fieldIndicator)} aria-label="Show options">
            <ChevronDown size={18} />
          </Combobox.Trigger>
        </Combobox.Control>
        <Combobox.Positioner className={fieldPositioner}>
          <Combobox.Content className={cx(fieldPopup, fieldOptionList)}>
            {items.length === 0 && <div className={fieldEmpty}>No matches</div>}
            {items.map((item) => (
              <Combobox.Item key={item.value} item={item} className={cx(fieldOption, item.create !== undefined && fieldOptionCreate)}>
                {item.create !== undefined
                  ? <Plus size={16} />
                  : <span className={fieldOptionBox} aria-hidden="true"><Check size={13} strokeWidth={3} /></span>}
                <Combobox.ItemText>{item.label}</Combobox.ItemText>
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Combobox.Root>
    </FieldShell>
  );
}
