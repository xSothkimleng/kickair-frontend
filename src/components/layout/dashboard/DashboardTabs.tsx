"use client";

import { Tabs } from "@ark-ui/react";
import { css } from "styled-system/css";

interface FreelancerTabsProps {
  activeTab: string;
  onTabChange: (tab: unknown) => void;
  tabs?: { value: string; label: string; badge?: number }[];
}

const bar = css({ bg: "white", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline" });
const container = css({ w: "100%", maxW: "1200px", mx: "auto", boxSizing: "border-box", px: "24px" });
const list = css({ position: "relative", display: "flex", minH: "48px", overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } });
const trigger = css({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  minH: "48px",
  minW: "90px",
  px: "16px",
  border: "none",
  bg: "transparent",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 400,
  lineHeight: 1.25,
  color: "ink2",
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "color .15s",
  _hover: { color: "ink" },
  _focusVisible: { outline: "none", boxShadow: "inset 0 0 0 2px token(colors.accentFill)" },
  "&[data-selected]": { color: "ink", fontWeight: 500 },
});
const indicator = css({ h: "2px", bg: "ink", bottom: 0 });
const badge = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minW: "16px", h: "16px", px: "4px", borderRadius: "pill",
  bg: "error", color: "white", fontSize: "10px", fontWeight: 600, lineHeight: 1,
});

export default function FreelancerTabs({ activeTab, onTabChange, tabs }: FreelancerTabsProps) {
  return (
    <div className={bar}>
      <div className={container}>
        <Tabs.Root value={activeTab} onValueChange={(d) => onTabChange(d.value)}>
          <Tabs.List className={list}>
            {tabs?.map((tab) => (
              <Tabs.Trigger key={tab.value} value={tab.value} className={trigger}>
                {tab.label}
                {tab.badge ? <span className={badge}>{tab.badge > 99 ? "99+" : tab.badge}</span> : null}
              </Tabs.Trigger>
            ))}
            <Tabs.Indicator className={indicator} />
          </Tabs.List>
        </Tabs.Root>
      </div>
    </div>
  );
}
