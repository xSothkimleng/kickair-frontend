"use client";

import { Menu as Ark, Portal } from "@ark-ui/react";
import { Fragment, type ReactNode } from "react";
import { css, cx } from "styled-system/css";

/**
 * Dropdown menu on Ark UI (accessible: roving focus, typeahead, ESC) styled with
 * Panda. Replaces MUI <Menu>/<MenuItem>. Convenience API takes a `trigger` +
 * `items`; raw Ark parts re-exported as `Menu` for custom content.
 */
export { Ark as MenuPrimitive };

const contentCss = css({
  minW: "200px",
  bg: "surface",
  borderRadius: "cardSm",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
  py: "1.5",
  zIndex: 1400,
  _focus: { outline: "none" },
});

const itemCss = css({
  display: "flex",
  alignItems: "center",
  gap: "2.5",
  px: "3.5",
  py: "2",
  fontSize: "14px",
  color: "body",
  cursor: "pointer",
  userSelect: "none",
  transition: "background-color .12s",
  _hover: { bg: "fill" },
  "&[data-highlighted]": { bg: "fill" },
  "&[data-disabled]": { opacity: 0.45, cursor: "not-allowed" },
});

const dangerCss = css({ color: "error", _hover: { bg: "errorTint" }, "&[data-highlighted]": { bg: "errorTint" } });
const iconCss = css({ display: "inline-flex", color: "muted", flexShrink: 0 });
const sepCss = css({ height: "1px", bg: "border", my: "1.5" });

export interface MenuItemDef {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  danger?: boolean;
  separatorBefore?: boolean;
}

export interface MenuProps {
  trigger: ReactNode;
  items: MenuItemDef[];
}

export function Menu({ trigger, items }: MenuProps) {
  const handlers = new Map(items.map((i) => [i.value, i.onSelect]));
  return (
    <Ark.Root onSelect={(d) => handlers.get(d.value)?.()}>
      <Ark.Trigger asChild>{trigger}</Ark.Trigger>
      <Portal>
        <Ark.Positioner>
          <Ark.Content className={contentCss}>
            {items.map((it) => (
              <Fragment key={it.value}>
                {it.separatorBefore ? <Ark.Separator className={sepCss} /> : null}
                <Ark.Item value={it.value} disabled={it.disabled} className={cx(itemCss, it.danger && dangerCss)}>
                  {it.icon ? <span className={iconCss}>{it.icon}</span> : null}
                  <Ark.ItemText>{it.label}</Ark.ItemText>
                </Ark.Item>
              </Fragment>
            ))}
          </Ark.Content>
        </Ark.Positioner>
      </Portal>
    </Ark.Root>
  );
}
