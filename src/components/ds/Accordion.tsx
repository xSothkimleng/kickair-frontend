"use client";

import { Accordion as Ark } from "@ark-ui/react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";

/** Accordion on Ark (keyboard nav, aria). Replaces MUI <Accordion>. Raw parts: AccordionPrimitive. */
export { Ark as AccordionPrimitive };

const itemCss = css({ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "border", _last: { borderBottom: "none" } });
const triggerCss = css({
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", w: "100%", py: "14px", px: 0,
  border: "none", bg: "transparent", fontFamily: "inherit", fontSize: "15px", fontWeight: 600, color: "heading", textAlign: "left", cursor: "pointer",
  _focusVisible: { outline: "none", boxShadow: "focusRing", borderRadius: "6px" },
  "& svg": { flexShrink: 0, color: "muted", transition: "transform .2s" },
  "&[data-state=open] svg": { transform: "rotate(180deg)" },
});
const contentCss = css({ pb: "14px", fontSize: "14.5px", color: "body", lineHeight: 1.6, _focus: { outline: "none" } });

export interface AccordionItemDef { value: string; title: ReactNode; content: ReactNode; disabled?: boolean }

export function Accordion({ items, multiple, defaultValue, value, onValueChange, className }: { items: AccordionItemDef[]; multiple?: boolean; defaultValue?: string[]; value?: string[]; onValueChange?: (v: string[]) => void; className?: string }) {
  return (
    <Ark.Root multiple={multiple} collapsible defaultValue={defaultValue} value={value} onValueChange={(d) => onValueChange?.(d.value)} className={className} lazyMount unmountOnExit>
      {items.map((it) => (
        <Ark.Item key={it.value} value={it.value} disabled={it.disabled} className={itemCss}>
          <Ark.ItemTrigger className={triggerCss}>
            {it.title}
            <Ark.ItemIndicator><ChevronDown size={18} /></Ark.ItemIndicator>
          </Ark.ItemTrigger>
          <Ark.ItemContent className={cx(contentCss)}>{it.content}</Ark.ItemContent>
        </Ark.Item>
      ))}
    </Ark.Root>
  );
}
