"use client";

import { Select } from "@ark-ui/react";
import { Check, ChevronDown } from "lucide-react";
import { css, cx } from "styled-system/css";
import { FieldShell } from "./FieldShell";
import { fieldChip, fieldIndicator, fieldOption, fieldOptionBox, fieldOptionList, fieldPopup, fieldPositioner, fieldRoot, fieldTrigger, fieldTriggerText } from "./field";
import { useOptionCollection, type SelectOption } from "./SelectInput";
import { FieldBaseProps } from "./tokens";

export interface MultiSelectInputProps extends FieldBaseProps {
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  name?: string;
}

const chips = css({ display: "flex", flexWrap: "wrap", gap: "4px", flex: 1, minW: 0, py: "6px" });

export default function MultiSelectInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = [], onChange, options, placeholder = "Select…", id, name,
}: MultiSelectInputProps) {
  const collection = useOptionCollection(options);
  const selected = value.map(String);

  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <Select.Root
        collection={collection}
        multiple
        closeOnSelect={false}
        value={selected}
        onValueChange={(d) => onChange?.(d.items.map((i) => i.raw))}
        disabled={disabled}
        invalid={!!error}
        name={name}
        ids={id ? { trigger: id } : undefined}
        positioning={{ placement: "bottom-start", strategy: "fixed", sameWidth: true, gutter: 4 }}
        lazyMount
        unmountOnExit>
        <Select.Control>
          <Select.Trigger className={cx(fieldRoot({ size }), fieldTrigger)}>
            {selected.length ? (
              <span className={chips}>
                {selected.map((v) => (
                  <span key={v} className={fieldChip}>{collection.items.find((i) => i.value === v)?.label ?? v}</span>
                ))}
              </span>
            ) : (
              <span className={fieldTriggerText} data-placeholder="">{placeholder}</span>
            )}
            <Select.Indicator className={fieldIndicator}><ChevronDown size={18} /></Select.Indicator>
          </Select.Trigger>
        </Select.Control>
        <Select.Positioner className={fieldPositioner}>
          <Select.Content className={cx(fieldPopup, fieldOptionList)}>
            {collection.items.map((item) => (
              <Select.Item key={item.value} item={item} className={fieldOption}>
                <span className={fieldOptionBox} aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
                <Select.ItemText>{item.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
        <Select.HiddenSelect />
      </Select.Root>
    </FieldShell>
  );
}
