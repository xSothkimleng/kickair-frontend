import type { ComponentType, CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { css, cva, cx } from "styled-system/css";

// Any icon component that takes className/style works: lucide icons (size prop) and,
// during the MUI removal, the remaining MUI icon components.
type IconComponent = ComponentType<{ className?: string; style?: CSSProperties; size?: number }>;

interface StatsCardProps {
  icon: IconComponent;
  iconColor: string;
  value: string | number;
  label: string;
  gradient?: boolean;
  gradientColors?: string;
  hasNotification?: boolean;
  onClick?: () => void;
}

const card = cva({
  base: {
    position: "relative",
    borderRadius: "card",
    borderWidth: "1px",
    borderStyle: "solid",
    p: "24px",
    cursor: "default",
    transition: "all 0.3s",
  },
  variants: {
    gradient: {
      true: { bg: "transparent", borderColor: "rgba(34, 197, 94, 0.2)" },
      false: { bg: "white", borderColor: "rgba(0, 0, 0, 0.08)" },
    },
    clickable: {
      true: { cursor: "pointer", _hover: { "& .arrow-icon": { opacity: 1 } } },
      false: {},
    },
  },
  compoundVariants: [
    { gradient: true, clickable: true, css: { _hover: { borderColor: "rgba(34, 197, 94, 0.3)" } } },
    { gradient: false, clickable: true, css: { _hover: { borderColor: "rgba(0, 0, 0, 0.2)" } } },
  ],
});

const topRowCss = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "16px" });
const iconCss = css({ w: "20px", h: "20px", fontSize: "20px" });

const arrow = cva({
  base: { opacity: 0, transition: "opacity 0.3s" },
  variants: {
    gradient: { true: { color: "rgba(22, 163, 74, 0.4)" }, false: { color: "rgba(0, 0, 0, 0.4)" } },
  },
});

const value = cva({
  base: { fontSize: "28px", fontWeight: 600, lineHeight: 1.5 },
  variants: { gradient: { true: { color: "rgb(21, 128, 61)" }, false: { color: "black" } } },
});

const label = cva({
  base: { fontSize: "11px", lineHeight: 1.5 },
  variants: { gradient: { true: { color: "rgba(21, 128, 61, 0.7)" }, false: { color: "rgba(0, 0, 0, 0.6)" } } },
});

const dotCss = css({ position: "absolute", top: "16px", right: "16px", w: "8px", h: "8px", borderRadius: "50%" });

export default function StatsCard({
  icon: Icon,
  iconColor,
  value: valueText,
  label: labelText,
  gradient = false,
  gradientColors,
  hasNotification = false,
  onClick,
}: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      className={card({ gradient, clickable: !!onClick })}
      style={gradient && gradientColors ? { background: gradientColors } : undefined}>
      <div className={topRowCss}>
        <Icon size={20} className={iconCss} style={{ color: iconColor }} />
        <ArrowRight size={16} className={cx("arrow-icon", arrow({ gradient }))} />
      </div>

      <p className={value({ gradient })}>{valueText}</p>

      <p className={label({ gradient })}>{labelText}</p>

      {hasNotification && <span className={dotCss} style={{ background: iconColor }} />}
    </div>
  );
}
