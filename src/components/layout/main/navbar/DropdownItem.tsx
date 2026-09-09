import Link from "next/link";
import { css } from "styled-system/css";
import { dropdownItemCss } from "./styles";

export interface DropdownItemProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  extra?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

const iconCss = css({ flexShrink: 0, mt: "2px" });
const titleCss = css({ fontSize: "13px", fontWeight: 600 });
const descCss = css({ fontSize: "11px", color: "rgba(0,0,0,0.6)" });
const extraCss = css({ mt: "8px" });

export function DropdownItem({ icon, title, description, extra, href, onClick }: DropdownItemProps) {
  const inner = (
    <>
      {icon && <div className={iconCss}>{icon}</div>}
      <div>
        <div className={titleCss}>{title}</div>
        <div className={descCss}>{description}</div>
        {extra && <div className={extraCss}>{extra}</div>}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={dropdownItemCss}>
        {inner}
      </Link>
    );
  }

  return (
    <button type='button' onClick={onClick} className={dropdownItemCss}>
      {inner}
    </button>
  );
}
