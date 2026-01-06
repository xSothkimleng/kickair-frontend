"use client";
import { useState } from "react";
import { Box, Button } from "@mui/material";
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

// Type definitions
type DropdownType = "why" | "freelancer" | "client" | "pro" | "language" | null;

interface NavigationOptions {
  scrollTo?: string;
  userType?: "freelancer" | "client";
  lang?: string;
}

function MainNavbar() {
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");

  const handleNavigateAndClose = (page: string, options?: NavigationOptions): void => {
    console.log("Navigate to:", page, options);
    setActiveDropdown(null);
  };

  const handleDropdownToggle = (dropdown: DropdownType): void => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.5rem 10rem",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}>
      <div>
        <Link href='/' passHref>
          <Image src='/assets/images/kickair-logo.png' alt='logo' width={100} height={38} style={{ objectFit: "fill" }} />
        </Link>
      </div>
      <Box sx={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Box sx={{ display: "flex", gap: "10px" }}>
          <Button
            onClick={() => handleNavigateAndClose("services")}
            onMouseEnter={() => setActiveDropdown(null)}
            sx={{ textTransform: "none", fontSize: "14px" }}>
            Explore Services
          </Button>

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
                    <Link href='/whykickair#how-it-works' scroll={true}>
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

                    <Link href='/whykickair#success-stories' scroll={true}>
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

                    <Link href='/whykickair#reviews' scroll={true}>
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

                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                    <Link href='/kickairuniversity' scroll={true}>
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
                          Master freelancing skills, pricing strategies, and client management
                        </Box>
                      </Button>
                    </Link>

                    <Button
                      onClick={() => handleNavigateAndClose("freelancer-dashboard")}
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
                      <BusinessCenterIcon sx={{ fontSize: 20, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                      <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Find Stable Jobs</Box>
                      <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>Browse part-time & full-time opportunities</Box>
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
                      <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Boost Profile with Ads</Box>
                      <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>Increase visibility with premium placement</Box>
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
                    <Link href='/kickairuniversity' scroll={true}>
                      <Button
                        onClick={() => handleNavigateAndClose("university", { userType: "client" })}
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
                      <SearchIcon sx={{ fontSize: 20, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                      <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Explore Services</Box>
                      <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>Browse freelancer offerings</Box>
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
                      <PeopleIcon sx={{ fontSize: 20, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                      <Box sx={{ fontSize: "13px", fontWeight: 600, mb: 0.5 }}>Find Freelancers</Box>
                      <Box sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>One-off jobs & projects</Box>
                    </Button>

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

        <Box sx={{ display: "flex", gap: "10px" }}>
          <Button
            sx={{
              textTransform: "none",
              fontSize: "12px",
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 1)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                color: "black",
              },
            }}>
            Sign In
          </Button>
          <Button
            sx={{
              textTransform: "none",
              fontSize: "12px",
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 1)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                color: "black",
              },
            }}>
            Sign Up
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default MainNavbar;
