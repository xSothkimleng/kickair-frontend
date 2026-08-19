"use client";

import { Tooltip as Ark, Portal } from "@ark-ui/react";
import type { ReactNode } from "react";
import { css } from "styled-system/css";

/**
 * Tooltip on Ark UI (accessible: hover/focus, delay, aria) styled with Panda.
 * Replaces MUI <Tooltip>. `children` is the trigger; `content` is the bubble.
 */
export { Ark as TooltipPrimitive };

const contentCss = css({
  bg: "heading",
  color: "white",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: 1.4,
  px: "2.5",
  py: "1.5",
  borderRadius: "8px",
  maxW: "240px",
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.18)",
  zIndex: 1500,
});

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  openDelay?: number;
  closeDelay?: number;
}

export function Tooltip({ content, children, openDelay = 300, closeDelay = 100 }: TooltipProps) {
  return (
    <Ark.Root openDelay={openDelay} closeDelay={closeDelay}>
      <Ark.Trigger asChild>{children}</Ark.Trigger>
      <Portal>
        <Ark.Positioner>
          <Ark.Content className={contentCss}>{content}</Ark.Content>
        </Ark.Positioner>
      </Portal>
    </Ark.Root>
  );
}
