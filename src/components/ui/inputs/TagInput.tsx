"use client";

import { useId } from "react";
import { TagsInput } from "@ark-ui/react";
import { X } from "lucide-react";
import { FieldShell } from "./FieldShell";
import { fieldChip, fieldChipArea, fieldChipRemove, fieldControl, fieldRoot } from "./field";
import { FieldBaseProps } from "./tokens";

export interface TagInputProps extends FieldBaseProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  /** Optional native autocomplete suggestions (rendered as a <datalist>). */
  suggestions?: string[];
  placeholder?: string;
  id?: string;
}

export default function TagInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = [], onChange, suggestions = [], placeholder = "Add a tag…", id,
}: TagInputProps) {
  const listId = useId();
  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <TagsInput.Root
        value={value}
        onValueChange={(d) => onChange?.(d.value)}
        disabled={disabled}
        invalid={!!error}
        editable={false}
        addOnPaste
        delimiter=","
        ids={id ? { input: id } : undefined}>
        <TagsInput.Control className={fieldRoot({ size })}>
          <span className={fieldChipArea}>
            {value.map((tag, index) => (
              <TagsInput.Item key={`${tag}-${index}`} index={index} value={tag}>
                <TagsInput.ItemPreview className={fieldChip}>
                  <TagsInput.ItemText>{tag}</TagsInput.ItemText>
                  <TagsInput.ItemDeleteTrigger className={fieldChipRemove} aria-label={`Remove ${tag}`}><X size={12} /></TagsInput.ItemDeleteTrigger>
                </TagsInput.ItemPreview>
                <TagsInput.ItemInput />
              </TagsInput.Item>
            ))}
            <TagsInput.Input className={fieldControl} placeholder={value.length ? "" : placeholder} list={suggestions.length ? listId : undefined} autoComplete="off" />
          </span>
        </TagsInput.Control>
        <TagsInput.HiddenInput />
        {suggestions.length > 0 && (
          <datalist id={listId}>
            {suggestions.map((s) => <option key={s} value={s} />)}
          </datalist>
        )}
      </TagsInput.Root>
    </FieldShell>
  );
}
