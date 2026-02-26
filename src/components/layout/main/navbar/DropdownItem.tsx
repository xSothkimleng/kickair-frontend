import Link from "next/link";
import { Box, Button } from "@mui/material";
import { dropdownItemSx } from "./styles";

export interface DropdownItemProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  extra?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export function DropdownItem({ icon, title, description, extra, href, onClick }: DropdownItemProps) {
  const inner = (
    <>
      {icon && <Box sx={{ flexShrink: 0, mt: 0.25 }}>{icon}</Box>}
      <Box>
        <Box sx={{ fontSize: 13, fontWeight: 600 }}>{title}</Box>
        <Box sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)" }}>{description}</Box>
        {extra && <Box sx={{ mt: 1 }}>{extra}</Box>}
      </Box>
    </>
  );

  if (href) {
    return (
      <Button component={Link as React.ElementType} href={href} onClick={onClick} sx={dropdownItemSx}>
        {inner}
      </Button>
    );
  }

  return (
    <Button onClick={onClick} sx={dropdownItemSx}>
      {inner}
    </Button>
  );
}
