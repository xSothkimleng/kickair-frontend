import Link from "next/link";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import { Logout } from "@mui/icons-material";
import {
  Box,
  Button,
  Avatar,
  Typography,
  CircularProgress,
  Drawer,
  IconButton,
  Divider,
} from "@mui/material";
import { LANGUAGES, type Language } from "./types";

export interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  user: { name: string; profile_image?: string | null } | null;
  loading: boolean;
  onLogout: () => Promise<void>;
}

const NAV_LINKS = [
  { label: "Explore Services", href: "/explore-services" },
  { label: "Why KickAir", href: "/why-kick-air" },
  { label: "For Freelancers", href: "/kick-air-university" },
  { label: "For Clients", href: "/find-freelancer" },
  { label: "KickAir Pro", href: "/pro" },
];

export function MobileDrawer({
  open,
  onClose,
  selectedLanguage,
  onLanguageChange,
  user,
  loading,
  onLogout,
}: MobileDrawerProps) {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 280 } } }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Link href="/" onClick={onClose}>
            <Image
              src="/assets/images/kickair-logo.png"
              alt="KickAir"
              width={80}
              height={30}
              style={{ objectFit: "contain" }}
            />
          </Link>
          <IconButton onClick={onClose} size="small" aria-label="Close menu">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Nav links */}
        <Box sx={{ py: 1 }}>
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              component={Link as React.ElementType}
              href={link.href}
              onClick={onClose}
              sx={{
                width: "100%",
                justifyContent: "flex-start",
                px: 2.5,
                py: 1.25,
                fontSize: 14,
                textTransform: "none",
                color: "black",
                "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>

        <Divider />

        {/* Language selector */}
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography
            sx={{
              fontSize: 11,
              color: "rgba(0,0,0,0.6)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mb: 1,
            }}
          >
            Language
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang);
                  onClose();
                }}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  fontSize: 12,
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor:
                    selectedLanguage.code === lang.code ? "black" : "rgba(0,0,0,0.05)",
                  color:
                    selectedLanguage.code === lang.code ? "white" : "rgba(0,0,0,0.6)",
                  "&:hover": {
                    bgcolor:
                      selectedLanguage.code === lang.code ? "black" : "rgba(0,0,0,0.1)",
                  },
                }}
              >
                {lang.label}
              </Button>
            ))}
          </Box>
        </Box>

        <Divider />

        {/* Auth */}
        <Box sx={{ px: 2, py: 2, mt: "auto" }}>
          {loading ? (
            <CircularProgress size={20} />
          ) : user ? (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                  {user.name}
                </Typography>
              </Box>
              <Button
                onClick={async () => {
                  await onLogout();
                  onClose();
                }}
                sx={{
                  width: "100%",
                  justifyContent: "flex-start",
                  fontSize: 13,
                  color: "#dc2626",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#fef2f2" },
                }}
              >
                <Logout sx={{ fontSize: 14, mr: 1 }} />
                Logout
              </Button>
            </Box>
          ) : (
            <Button
              component={Link as React.ElementType}
              href="/auth/sign-in"
              onClick={onClose}
              sx={{
                width: "100%",
                bgcolor: "black",
                color: "white",
                borderRadius: 25,
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
