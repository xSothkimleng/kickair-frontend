"use client";

import { useMemo } from "react";
import { Select, createListCollection } from "@ark-ui/react";
import { Check, ChevronDown } from "lucide-react";
import { cx } from "styled-system/css";
import { FieldShell } from "./FieldShell";
import { fieldIndicator, fieldOption, fieldOptionCheck, fieldOptionList, fieldPopup, fieldPositioner, fieldRoot, fieldTrigger, fieldTriggerText } from "./field";
import { FieldBaseProps } from "./tokens";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectInputProps extends FieldBaseProps {
  value?: string | number | "";
  onChange?: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  name?: string;
  /** Extra classes for the outer field wrapper (e.g. a min-width when not fullWidth). */
  className?: string;
}

interface Item { label: string; value: string; raw: string | number }

/** Ark Select needs string values; keep the caller's original (string | number) in `raw`. */
export function useOptionCollection(options: SelectOption[]) {
  return useMemo(
    () => createListCollection<Item>({ items: options.map((o) => ({ label: o.label, value: String(o.value), raw: o.value })) }),
    [options],
  );
}

export default function SelectInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = "", onChange, options, placeholder = "Select…", id, name, className,
}: SelectInputProps) {
  const collection = useOptionCollection(options);
  const selected = value === "" || value == null ? [] : [String(value)];
  const selectedLabel = selected.length ? collection.items.find((i) => i.value === selected[0])?.label ?? String(value) : undefined;

  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth} className={className}>
      <Select.Root
        collection={collection}
        value={selected}
        onValueChange={(d) => { const item = d.items[0]; if (item) onChange?.(item.raw); }}
        disabled={disabled}
        invalid={!!error}
        name={name}
        ids={id ? { trigger: id } : undefined}
        positioning={{ placement: "bottom-start", strategy: "fixed", sameWidth: true, gutter: 4 }}
        lazyMount
        unmountOnExit>
        <Select.Control>
          <Select.Trigger className={cx(fieldRoot({ size }), fieldTrigger)}>
            <span className={fieldTriggerText} data-placeholder={selectedLabel === undefined ? "" : undefined}>
              {selectedLabel ?? placeholder}
            </span>
            <Select.Indicator className={fieldIndicator}><ChevronDown size={18} /></Select.Indicator>
          </Select.Trigger>
        </Select.Control>
        <Select.Positioner className={fieldPositioner}>
          <Select.Content className={cx(fieldPopup, fieldOptionList)}>
            {collection.items.map((item) => (
              <Select.Item key={item.value} item={item} className={fieldOption}>
                <Select.ItemText>{item.label}</Select.ItemText>
                <Select.ItemIndicator className={fieldOptionCheck}><Check size={16} /></Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
        <Select.HiddenSelect />
      </Select.Root>
    </FieldShell>
  );
}
