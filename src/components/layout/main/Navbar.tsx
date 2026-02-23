"use client";
import { useRef, useState, useEffect } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LanguageIcon from "@mui/icons-material/Language";
import BookOpenIcon from "@mui/icons-material/MenuBook";
import BoltIcon from "@mui/icons-material/Bolt";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShieldIcon from "@mui/icons-material/Shield";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Button,
  Avatar,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { KeyboardArrowDown, Settings as SettingsIcon, HelpOutline, Logout, Work as BriefcaseIcon } from "@mui/icons-material";
import { useAuth } from "@/components/context/AuthContext";
import { api } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

// Type definitions
type DropdownType = "why" | "freelancer" | "client" | "pro" | "language" | "profile" | null;

interface NavigationOptions {
  scrollTo?: string;
  userType?: "freelancer" | "client";
  lang?: string;
  initialTab?: string;
}

export default function MainNavbar() {
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileDialogType, setProfileDialogType] = useState<"freelancer" | "client" | null>(null);
  const [profileDialogLoading, setProfileDialogLoading] = useState(false);
  const [profileDialogError, setProfileDialogError] = useState<string | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Use AuthContext
  const { user, loading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Debug: Log when component renders and user state changes
  // console.log("Navbar render - User:", user, "Loading:", loading);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        if (activeDropdown === "profile") {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  // Handle mode switch - show dialog if profile doesn't exist
  const handleModeSwitch = (mode: "freelancer" | "client") => {
    if (mode === "freelancer" && !isFreelancer) {
      setProfileDialogType("freelancer");
      setProfileDialogOpen(true);
    } else if (mode === "client" && !isClient) {
      setProfileDialogType("client");
      setProfileDialogOpen(true);
    } else {
      // User has the profile, navigate to dashboard
      setActiveDropdown(null);
      router.push(`/dashboard/${mode}`);
    }
  };

  const handleDialogClose = () => {
    if (profileDialogLoading) return;
    setProfileDialogOpen(false);
    setProfileDialogType(null);
    setProfileDialogError(null);
  };

  const handleCreateProfile = async () => {
    if (!profileDialogType) return;
    setProfileDialogLoading(true);
    setProfileDialogError(null);
    try {
      if (profileDialogType === "freelancer") {
        await api.createFreelancerProfile({});
      } else {
        await api.createClientProfile({});
      }
      await refreshUser();
      setProfileDialogOpen(false);
      setProfileDialogType(null);
      setActiveDropdown(null);
      router.push(`/dashboard/${profileDialogType}`);
    } catch (error) {
      setProfileDialogError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setProfileDialogLoading(false);
    }
  };

  const handleNavigateAndClose = (page: string, options?: NavigationOptions): void => {
    console.log("Navigate to:", page, options);
    setActiveDropdown(null);
  };

  const handleDropdownToggle = (dropdown: DropdownType): void => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setActiveDropdown(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Determine user mode based on Laravel user data
  const isFreelancer = user?.is_freelancer || false;
  const isClient = user?.is_client || false;

  // Determine current mode from URL path
  const currentMode = pathname?.includes("/dashboard/client")
    ? "client"
    : pathname?.includes("/dashboard/freelancer")
      ? "freelancer"
      : isFreelancer
        ? "freelancer"
        : "client";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0rem 10rem",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}>
      <div>
        <Link href='/' passHref>
          <Image
            src='/assets/images/kickair-logo.png'
            alt='logo'
            width={100}
            height={38}
            style={{ objectFit: "fill", marginTop: "5px" }}
          />
        </Link>
      </div>
      <Box sx={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Box sx={{ display: "flex", gap: "10px" }}>
          <Link href='/explore-services' passHref>
            <Button
              onClick={() => handleNavigateAndClose("services")}
              onMouseEnter={() => setActiveDropdown(null)}
              sx={{ textTransform: "none", fontSize: "14px" }}>
              Explore Services
            </Button>
          </Link>

          {/* Why KickAir Dropdown */}
          <Box sx={{ position: "relative" }}>
            <Button
              endIcon={<KeyboardArrowDownIcon />}
              onMouseEnter={() => setActiveDropdown("why")}
              sx={{ textTransform: "none", fontSize: "14px" }}>
              Why KickAir
            </Button>

            {activeDropdown === "why" && (
              <Box
                onMouseLeave={() => setActiveDropdown(null)}
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  mt: 0,
                  width: "360px",
                  backgroundColor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  overflow: "hidden",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  zIndex: 1000,
                }}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)", mb: 2 }}>
                    Learn why KickAir is the best platform for freelancing
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Link href='/why-kick-air#how-it-works' scroll={true}>
                      <Button
                        sx={{
                          width: "100%",
                          textAlign: "left",
                          display: "block",
                          p: 2,
                          borderRadius: "12px",
                          textTransform: "none",
                          color: "black",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}>
                        <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>How It Works</Box>
                        <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>
                          Step-by-step guide for clients and freelancers
                        </Box>
                      </Button>
                    </Link>

                    <Link href='/why-kick-air#success-stories' scroll={true}>
                      <Button
                        sx={{
                          width: "100%",
                          textAlign: "left",
                          display: "block",
                          p: 2,
                          borderRadius: "12px",
                          textTransform: "none",
                          color: "black",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}>
                        <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Success Stories</Box>
                        <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>Real results from our community</Box>
                      </Button>
                    </Link>

                    <Link href='/why-kick-air#reviews' scroll={true}>
                      <Button
                        sx={{
                          width: "100%",
                          textAlign: "left",
                          display: "block",
                          p: 2,
                          borderRadius: "12px",
                          textTransform: "none",
                          color: "black",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}>
                        <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Reviews</Box>
                        <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>See what people are saying about us</Box>
                      </Button>
                    </Link>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* For Freelancers Dropdown */}
          <Box sx={{ position: "relative" }}>
            <Button
              endIcon={<KeyboardArrowDownIcon />}
              onMouseEnter={() => setActiveDropdown("freelancer")}
              sx={{ textTransform: "none", fontSize: "14px" }}>
              For Freelancers
            </Button>

            {activeDropdown === "freelancer" && (
              <Box
                onMouseLeave={() => setActiveDropdown(null)}
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  mt: 0,
                  width: "600px",
                  backgroundColor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  overflow: "hidden",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  zIndex: 1000,
                }}>
                <Box sx={{ p: 5 }}>
                  <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)", mb: 3 }}>
                    Learn, earn, and grow your freelance career
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Button
                      onClick={() => handleNavigateAndClose("freelancer-space", { initialTab: "services" })}
                      sx={{
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        p: 2,
                        borderRadius: "12px",
                        textTransform: "none",
                        color: "black",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                        },
                      }}>
                      <BoltIcon sx={{ fontSize: 20, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                      <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Post Your Service</Box>
                      <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>
                        Create your service listing with three-tier pricing
                      </Box>
                    </Button>

                    <Button
                      onClick={() => handleNavigateAndClose("jobs")}
                      sx={{
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        p: 2,
                        borderRadius: "12px",
                        textTransform: "none",
                        color: "black",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                        },
                      }}>
                      <BusinessCenterIcon sx={{ fontSize: 20, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                      <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Opportunities</Box>
                      <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>Find gigs, part-time & full-time work</Box>
                    </Button>

                    <Button
                      onClick={() => handleNavigateAndClose("university", { userType: "freelancer" })}
                      sx={{
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        p: 2,
                        borderRadius: "12px",
                        textTransform: "none",
                        color: "black",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                        },
                      }}>
                      <BookOpenIcon sx={{ fontSize: 20, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                      <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>KickAir University</Box>
                      <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>
                        Master freelancing skills, pricing strategies, and client management
                      </Box>
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* For Client Dropdown */}
          <Box sx={{ position: "relative" }}>
            <Button
              endIcon={<KeyboardArrowDownIcon />}
              onMouseEnter={() => setActiveDropdown("client")}
              sx={{ textTransform: "none", fontSize: "14px" }}>
              For Client
            </Button>

            {activeDropdown === "client" && (
              <Box
                onMouseLeave={() => setActiveDropdown(null)}
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  mt: 0,
                  width: "600px",
                  backgroundColor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  overflow: "hidden",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  zIndex: 1000,
                }}>
                <Box sx={{ p: 5 }}>
                  <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)", mb: 3 }}>Get work done with trusted freelancers</Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                    <Link href='/kick-air-university' scroll={true}>
                      <Button
                        sx={{
                          textAlign: "left",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          p: 2,
                          borderRadius: "12px",
                          textTransform: "none",
                          color: "black",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}>
                        <BookOpenIcon sx={{ fontSize: 20, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                        <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>KickAir University</Box>
                        <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>
                          Learn project management and hiring best practices
                        </Box>
                      </Button>
                    </Link>

                    <Link href='/explore-services' passHref>
                      <Button
                        sx={{
                          textAlign: "left",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          p: 2,
                          borderRadius: "12px",
                          textTransform: "none",
                          color: "black",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}>
                        <SearchIcon sx={{ fontSize: 20, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                        <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Explore Services</Box>
                        <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>Browse freelancer offerings</Box>
                      </Button>
                    </Link>

                    <Link href='/find-freelancer' passHref>
                      <Button
                        sx={{
                          textAlign: "left",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          p: 2,
                          borderRadius: "12px",
                          textTransform: "none",
                          color: "black",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}>
                        <PeopleIcon sx={{ fontSize: 20, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                        <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Find Freelancers</Box>
                        <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>One-off jobs & projects</Box>
                      </Button>
                    </Link>

                    <Button
                      onClick={() => handleNavigateAndClose("client-dashboard")}
                      sx={{
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        p: 2,
                        borderRadius: "12px",
                        textTransform: "none",
                        color: "black",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                        },
                      }}>
                      <BusinessCenterIcon sx={{ fontSize: 20, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                      <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Post Your Gig</Box>
                      <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>Part-time & full-time roles</Box>
                    </Button>

                    <Button
                      onClick={() => handleNavigateAndClose("services")}
                      sx={{
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        p: 2,
                        borderRadius: "12px",
                        textTransform: "none",
                        color: "black",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                        },
                      }}>
                      <EmojiEventsIcon sx={{ fontSize: 20, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                      <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Boost Gig with Ads</Box>
                      <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>Promote with premium placement</Box>
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* KickAir Pro Dropdown */}
          <Box sx={{ position: "relative" }}>
            <Button
              endIcon={<KeyboardArrowDownIcon />}
              onMouseEnter={() => setActiveDropdown("pro")}
              sx={{ textTransform: "none", fontSize: "14px" }}>
              KickAir Pro
            </Button>

            {activeDropdown === "pro" && (
              <Box
                onMouseLeave={() => setActiveDropdown(null)}
                sx={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  mt: 0,
                  width: "520px",
                  backgroundColor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  overflow: "hidden",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  zIndex: 1000,
                }}>
                <Box sx={{ p: 5 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box sx={{ textAlign: "left", p: 2, borderRadius: "12px", backgroundColor: "rgba(0, 0, 0, 0.04)" }}>
                      <EmojiEventsIcon sx={{ fontSize: 24, color: "black", mb: 1 }} />
                      <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Better Visibility with Ads</Box>
                      <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>
                        Priority placement and highlighted listings
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        textAlign: "left",
                        p: 2,
                        borderRadius: "12px",
                        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                        transition: "background-color 0.2s",
                      }}>
                      <TrendingUpIcon sx={{ fontSize: 24, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                      <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Lower Transaction Fees</Box>
                      <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Save more on every transaction</Box>
                      <Box sx={{ display: "flex", gap: 2, fontSize: "11px" }}>
                        <Box sx={{ color: "rgba(0, 0, 0, 0.4)" }}>Standard: 10%</Box>
                        <Box sx={{ fontWeight: 600, color: "black" }}>Pro: 5%</Box>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        textAlign: "left",
                        p: 2,
                        borderRadius: "12px",
                        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                        transition: "background-color 0.2s",
                      }}>
                      <ShieldIcon sx={{ fontSize: 24, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                      <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Exclusive Support & Tools</Box>
                      <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>Priority support and premium features</Box>
                    </Box>

                    <Button
                      onClick={() => handleNavigateAndClose("team-workspace")}
                      sx={{
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        p: 2,
                        borderRadius: "12px",
                        textTransform: "none",
                        color: "black",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                        },
                      }}>
                      <PeopleIcon sx={{ fontSize: 24, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                      <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Client Team Workspace</Box>
                      <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>
                        Organize projects with multiple freelancers
                      </Box>
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* Language Dropdown */}
          <Box sx={{ position: "relative", ml: 1 }}>
            <Button
              onClick={() => handleDropdownToggle("language")}
              sx={{
                textTransform: "none",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}>
              <LanguageIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.6)" }} />
              {selectedLanguage}
            </Button>

            {activeDropdown === "language" && (
              <Box
                sx={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  mt: 1,
                  width: "140px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  overflow: "hidden",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  zIndex: 1000,
                }}>
                <Box sx={{ py: 1 }}>
                  <Button
                    onClick={() => {
                      setSelectedLanguage("English");
                      setActiveDropdown(null);
                    }}
                    sx={{
                      width: "100%",
                      justifyContent: "flex-start",
                      px: 2,
                      py: 1,
                      fontSize: "12px",
                      textTransform: "none",
                      color: selectedLanguage === "English" ? "black" : "rgba(0, 0, 0, 0.6)",
                      fontWeight: selectedLanguage === "English" ? 500 : 400,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                    }}>
                    English
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedLanguage("ខ្មែរ");
                      setActiveDropdown(null);
                    }}
                    sx={{
                      width: "100%",
                      justifyContent: "flex-start",
                      px: 2,
                      py: 1,
                      fontSize: "12px",
                      textTransform: "none",
                      color: selectedLanguage === "ខ្មែរ" ? "black" : "rgba(0, 0, 0, 0.6)",
                      fontWeight: selectedLanguage === "ខ្មែរ" ? 500 : 400,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                    }}>
                    ខ្មែរ
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedLanguage("中文");
                      setActiveDropdown(null);
                    }}
                    sx={{
                      width: "100%",
                      justifyContent: "flex-start",
                      px: 2,
                      py: 1,
                      fontSize: "12px",
                      textTransform: "none",
                      color: selectedLanguage === "中文" ? "black" : "rgba(0, 0, 0, 0.6)",
                      fontWeight: selectedLanguage === "中文" ? 500 : 400,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                    }}>
                    中文
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Show loading spinner while checking auth */}
          {loading ? (
            <CircularProgress size={24} sx={{ color: "rgba(0, 0, 0, 0.6)" }} />
          ) : user ? (
            // Logged in - show profile dropdown
            <Box ref={profileDropdownRef} sx={{ position: "relative", ml: 1 }}>
              <Button
                onClick={() => handleDropdownToggle("profile")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  height: 44,
                  fontSize: 12,
                  color: "rgba(0, 0, 0, 0.8)",
                  textTransform: "none",
                  "&:hover": {
                    color: "black",
                    bgcolor: "transparent",
                  },
                }}>
                <Avatar
                  src={user.profile_image ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${user.profile_image}` : undefined}
                  alt={user.name}
                  sx={{ width: 24, height: 24 }}>
                  {!user.profile_image && user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <span>{user.name}</span>
                <KeyboardArrowDown sx={{ fontSize: 14, opacity: 0.6 }} />
              </Button>
              {activeDropdown === "profile" && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    mt: 1,
                    width: 280,
                    bgcolor: "white",
                    borderRadius: 1.5,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    overflow: "hidden",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    zIndex: 1000,
                  }}>
                  {/* Profile Header */}
                  <Box sx={{ p: 1.5, borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1 }}>
                      <Avatar
                        src={user.profile_image ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${user.profile_image}` : undefined}
                        alt={user.name}
                        sx={{ width: 40, height: 40 }}>
                        {!user.profile_image && user.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{user.name}</Typography>
                        <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", textTransform: "capitalize" }}>
                          {currentMode} mode
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Mode Switcher */}
                  <Box sx={{ p: 2, borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "rgba(0, 0, 0, 0.6)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        mb: 1,
                      }}>
                      Mode
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        onClick={() => handleModeSwitch("freelancer")}
                        sx={{
                          flex: 1,
                          px: 1.5,
                          py: 1,
                          fontSize: 12,
                          borderRadius: 2,
                          textTransform: "none",
                          bgcolor: currentMode === "freelancer" ? "black" : "rgba(0, 0, 0, 0.05)",
                          color: currentMode === "freelancer" ? "white" : "rgba(0, 0, 0, 0.6)",
                          "&:hover": {
                            bgcolor: currentMode === "freelancer" ? "black" : "rgba(0, 0, 0, 0.1)",
                          },
                        }}>
                        Freelancer
                      </Button>
                      <Button
                        onClick={() => handleModeSwitch("client")}
                        sx={{
                          flex: 1,
                          px: 1.5,
                          py: 1,
                          fontSize: 12,
                          borderRadius: 2,
                          textTransform: "none",
                          bgcolor: currentMode === "client" ? "black" : "rgba(0, 0, 0, 0.05)",
                          color: currentMode === "client" ? "white" : "rgba(0, 0, 0, 0.6)",
                          "&:hover": {
                            bgcolor: currentMode === "client" ? "black" : "rgba(0, 0, 0, 0.1)",
                          },
                        }}>
                        Client
                      </Button>
                    </Box>
                  </Box>

                  {/* Menu Items */}
                  <Box sx={{ py: 1 }}>
                    <Link href={currentMode === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client"} passHref>
                      <Button
                        onClick={() => setActiveDropdown(null)}
                        sx={{
                          width: "100%",
                          justifyContent: "flex-start",
                          px: 2,
                          py: 1.25,
                          fontSize: 12,
                          color: "black",
                          textTransform: "none",
                          "&:hover": {
                            bgcolor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}>
                        <BriefcaseIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.6)", mr: 1 }} />
                        {currentMode === "freelancer" ? "Freelancer Profile" : "Client Profile"}
                      </Button>
                    </Link>
                    <Link href='/settings' passHref>
                      <Button
                        onClick={() => setActiveDropdown(null)}
                        sx={{
                          width: "100%",
                          justifyContent: "flex-start",
                          px: 2,
                          py: 1.25,
                          fontSize: 12,
                          color: "black",
                          textTransform: "none",
                          "&:hover": {
                            bgcolor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}>
                        <SettingsIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.6)", mr: 1 }} />
                        Settings
                      </Button>
                    </Link>
                    <Link href='/help' passHref>
                      <Button
                        onClick={() => setActiveDropdown(null)}
                        sx={{
                          width: "100%",
                          justifyContent: "flex-start",
                          px: 2,
                          py: 1.25,
                          fontSize: 12,
                          color: "black",
                          textTransform: "none",
                          "&:hover": {
                            bgcolor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}>
                        <HelpOutline sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.6)", mr: 1 }} />
                        Help & Support
                      </Button>
                    </Link>
                  </Box>

                  {/* Logout */}
                  <Box sx={{ borderTop: "1px solid rgba(0, 0, 0, 0.08)", p: 1 }}>
                    <Button
                      onClick={handleLogout}
                      sx={{
                        width: "100%",
                        justifyContent: "flex-start",
                        px: 2,
                        py: 1.25,
                        fontSize: 12,
                        color: "#dc2626",
                        borderRadius: 1,
                        textTransform: "none",
                        "&:hover": {
                          bgcolor: "#fef2f2",
                        },
                      }}>
                      <Logout sx={{ fontSize: 14, mr: 1 }} />
                      Logout
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            // Not logged in - show Sign In button
            <Link href='/auth/sign-in' passHref>
              <Button
                sx={{
                  ml: 1,
                  px: 2,
                  height: 32,
                  fontSize: 12,
                  color: "white",
                  bgcolor: "black",
                  borderRadius: 25,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.8)",
                  },
                }}>
                Sign In
              </Button>
            </Link>
          )}
        </Box>
      </Box>

      {/* Create Profile Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={handleDialogClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              minWidth: 400,
              p: 1,
            },
          },
        }}>
        <DialogTitle sx={{ fontSize: 18, fontWeight: 600, pb: 1 }}>
          Create {profileDialogType === "freelancer" ? "Freelancer" : "Client"} Profile
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.6)" }}>
            You don&apos;t have a {profileDialogType} profile yet. Would you like to create one?
          </Typography>
          {profileDialogError && (
            <Typography sx={{ fontSize: 13, color: "#dc2626", mt: 1.5 }}>
              {profileDialogError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleDialogClose}
            disabled={profileDialogLoading}
            sx={{
              textTransform: "none",
              fontSize: 13,
              color: "rgba(0, 0, 0, 0.6)",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.04)",
              },
            }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateProfile}
            disabled={profileDialogLoading}
            sx={{
              textTransform: "none",
              fontSize: 13,
              bgcolor: "black",
              color: "white",
              px: 3,
              borderRadius: 2,
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.8)",
              },
            }}>
            {profileDialogLoading ? <CircularProgress size={16} sx={{ color: "white" }} /> : "Create Profile"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
