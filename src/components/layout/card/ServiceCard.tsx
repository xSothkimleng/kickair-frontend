"use client";

import { Briefcase, Code, Palette, Pencil, TrendingUp, Video, type LucideIcon } from "lucide-react";
import { css, cx } from "styled-system/css";

interface ServiceCardProps {
  name: string;
  description: string;
  icon: string;
}

// Keys are the icon names stored on the category data; values are the nearest lucide
// glyphs to the MUI icons used before (Edit → Pencil, BusinessCenter → Briefcase,
// VideoLibrary → Video).
const iconMap: Record<string, LucideIcon> = {
  Palette,
  Code,
  TrendingUp,
  Video,
  PenTool: Pencil,
  Briefcase,
};

const cardCss = css({
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
  fontFamily: "inherit",
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

const iconCss = css({ color: "rgba(0, 0, 0, 0.7)", transition: "color 0.3s ease" });

const textColCss = css({ display: "flex", flexDirection: "column", gap: "4px" });
const titleCss = css({ fontSize: "20px", fontWeight: 500, lineHeight: 1.5, color: "ink" });
const descCss = css({ fontSize: "14px", lineHeight: 1.5, color: "ink2" });

export function ServiceCard({ name, description, icon }: ServiceCardProps) {
  const IconComponent = iconMap[icon] || Palette;

  return (
    <button
      type="button"
      //   onClick={onClick}
      className={cardCss}
    >
      <div className={innerCss}>
        <div className={cx("icon-wrapper", iconWrapCss)}>
          <IconComponent className={cx("icon", iconCss)} size={24} />
        </div>
        <div className={textColCss}>
          <h3 className={titleCss}>{name}</h3>
          <p className={descCss}>{description}</p>
        </div>
      </div>
    </button>
  );
}
