"use client";

import { Tabs as Ark } from "@ark-ui/react";
import type { ReactNode } from "react";
import { css } from "styled-system/css";

/**
 * Tabs on Ark UI (accessible: arrow-key nav, aria-selected) styled with Panda.
 * Replaces MUI <Tabs>/<Tab>. Convenience API takes a `tabs` array; raw Ark parts
 * re-exported as `Tabs`.
 */
export { Ark as TabsPrimitive };

const listCss = css({
  position: "relative",
  display: "flex",
  gap: "1",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: "border",
});

const triggerCss = css({
  position: "relative",
  appearance: "none",
  bg: "transparent",
  border: "none",
  px: "3",
  py: "3",
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: "inherit",
  color: "muted",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "color .15s",
  _hover: { color: "body" },
  "&[data-selected]": { color: "accent" },
  "&[data-disabled]": { opacity: 0.45, cursor: "not-allowed" },
});

const indicatorCss = css({
  height: "2px",
  bg: "accent",
  borderRadius: "pill",
  bottom: "-1px",
});

const contentCss = css({ pt: "5", _focus: { outline: "none" } });

export interface TabDef {
  value: string;
  label: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabDef[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({ tabs, value, defaultValue, onValueChange }: TabsProps) {
  return (
    <Ark.Root
      value={value}
      defaultValue={defaultValue ?? tabs[0]?.value}
      onValueChange={(d) => onValueChange?.(d.value)}
    >
      <Ark.List className={listCss}>
        {tabs.map((t) => (
          <Ark.Trigger key={t.value} value={t.value} disabled={t.disabled} className={triggerCss}>
            {t.label}
          </Ark.Trigger>
        ))}
        <Ark.Indicator className={indicatorCss} />
      </Ark.List>
      {tabs.map((t) =>
        t.content != null ? (
          <Ark.Content key={t.value} value={t.value} className={contentCss}>
            {t.content}
          </Ark.Content>
        ) : null
      )}
    </Ark.Root>
  );
}
