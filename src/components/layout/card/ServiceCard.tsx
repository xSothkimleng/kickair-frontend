"use client";

import { createElement } from "react";
import Link from "next/link";
import { Briefcase, Building2, Code, Palette, Pencil, TrendingUp, Video, type LucideIcon } from "lucide-react";
import { css, cx } from "styled-system/css";

interface ServiceCardProps {
  name: string;
  description: string;
  href: string;
}

// The icon follows the category name, so a group an admin adds later still gets a
// sensible glyph. First match wins; anything else falls back to the briefcase.
const ICON_BY_KEYWORD: [RegExp, LucideIcon][] = [
  [/design|brand|logo|art/i, Palette],
  [/web|develop|software|app|code|program/i, Code],
  [/market|seo|ads|sales/i, TrendingUp],
  [/video|motion|animation|film/i, Video],
  [/writ|content|translat|copy/i, Pencil],
  [/architect|interior|construction|building/i, Building2],
];

function iconFor(name: string): LucideIcon {
  return ICON_BY_KEYWORD.find(([pattern]) => pattern.test(name))?.[1] ?? Briefcase;
}

const cardCss = css({
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  bg: "surface",
  borderRadius: "card",
  p: { base: "32px", md: "40px" },
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "transparent",
  textAlign: "left",
  cursor: "pointer",
  transition: "all 0.3s ease",
  _hover: {
    bg: "white",
    borderColor: "rgba(0, 0, 0, 0.1)",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    "& .icon-wrapper": { bg: "rgba(0, 113, 227, 0.1)" },
    "& .icon": { color: "accent" },
  },
});

const innerCss = css({ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "16px" });

const iconWrapCss = css({
  p: "12px",
  bg: "rgba(0, 0, 0, 0.05)",
  borderRadius: "12px",
  transition: "background-color 0.3s ease",
});

const iconCss = css({ color: "ink2", transition: "color 0.3s ease" });

const textColCss = css({ display: "flex", flexDirection: "column", gap: "4px" });
const titleCss = css({ textStyle: "title", fontWeight: 500, color: "ink" });
const descCss = css({ textStyle: "body", color: "ink2" });

export function ServiceCard({ name, description, href }: ServiceCardProps) {
  return (
    <Link href={href} className={cardCss}>
      <div className={innerCss}>
        <div className={cx("icon-wrapper", iconWrapCss)}>
          {createElement(iconFor(name), { className: cx("icon", iconCss), size: 24 })}
        </div>
        <div className={textColCss}>
          <h3 className={titleCss}>{name}</h3>
          <p className={descCss}>{description}</p>
        </div>
      </div>
    </Link>
  );
}
