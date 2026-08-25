"use client";

/**
 * Shared kit for the email-verification screens (the in-app wall and the
 * /email-verified landing page): one square white card on the grey canvas,
 * logo top-left, editorial headline, square surfaces, black square buttons.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import { tokens } from "@/theme";

export function VerifyCard({ children, minHeight = "100vh" }: { children: ReactNode; minHeight?: string }) {
  return (
    <Box
      sx={{
        minHeight,
        bgcolor: tokens.canvas,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 4, md: 6 },
      }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 560,
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.borderStrong}`,
          borderRadius: 0,
          p: { xs: "28px 24px 32px", md: "40px 48px 44px" },
          display: "flex",
          flexDirection: "column",
        }}>
        <Box
          component="img"
          src="/assets/images/kickair-logo.png"
          alt="KickAir"
          sx={{ height: 32, width: "auto", display: "block", alignSelf: "flex-start", userSelect: "none" }}
        />
        <Box sx={{ mt: { xs: 4, md: 5 } }}>{children}</Box>
      </Box>
    </Box>
  );
}

export function VerifyOverline({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="div"
      sx={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, color: tokens.text3, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

export function VerifyHeadline({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="h1"
      sx={{ fontSize: { xs: 30, md: 36 }, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.08, color: tokens.text }}>
      {children}
    </Typography>
  );
}

export function VerifyBody({ children, sx }: { children: ReactNode; sx?: object }) {
  return <Typography sx={{ fontSize: 15, lineHeight: 1.65, color: tokens.text2, ...sx }}>{children}</Typography>;
}

export function VerifyTag({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  const isError = tone === "error";
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1.25,
        py: 0.5,
        bgcolor: isError ? tokens.errorTint : tokens.successTint,
        color: isError ? tokens.errorText : tokens.successText,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.02em",
        mb: 2,
      }}>
      {children}
    </Box>
  );
}

export function VerifyNotice({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  const isError = tone === "error";
  return (
    <Box
      role={isError ? "alert" : "status"}
      sx={{
        mt: 2.5,
        px: 2,
        py: 1.5,
        bgcolor: isError ? tokens.errorTint : tokens.successTint,
        borderLeft: `2px solid ${isError ? tokens.error : tokens.success}`,
      }}>
      <Typography sx={{ fontSize: 13.5, color: isError ? tokens.errorText : tokens.successText }}>{children}</Typography>
    </Box>
  );
}

type VerifyButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
  type?: "button" | "submit";
};

export function VerifyButton({ children, variant = "primary", onClick, disabled, href, type = "button" }: VerifyButtonProps) {
  const primary = variant === "primary";
  const sx = {
    height: 48,
    px: 3,
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "inherit",
    borderRadius: 0,
    bgcolor: primary ? tokens.text : "transparent",
    // !important: globals.css has an unlayered `a { color: inherit }` that beats MUI's layered styles on <a> buttons
    color: primary ? "#fff !important" : `${tokens.text} !important`,
    border: primary ? `1px solid ${tokens.text}` : `1px solid ${tokens.borderStrong}`,
    transition: "background-color .15s, border-color .15s, opacity .15s",
    "&:hover": { bgcolor: primary ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.04)", borderColor: primary ? "rgba(0,0,0,0.8)" : tokens.text },
    "&.Mui-disabled": { opacity: 0.45 },
  } as const;
  if (href) {
    return (
      <ButtonBase component={Link} href={href} sx={sx} disabled={disabled}>
        {children}
      </ButtonBase>
    );
  }
  return (
    <ButtonBase type={type} onClick={onClick} disabled={disabled} sx={sx}>
      {children}
    </ButtonBase>
  );
}
