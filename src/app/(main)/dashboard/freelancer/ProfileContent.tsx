import { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Avatar, Chip, IconButton, Select, MenuItem, Grid } from "@mui/material";
import {
  FileUploadOutlined,
  RoomOutlined,
  PublicOutlined,
  AddOutlined,
  CloseOutlined,
  ShareOutlined,
  VerifiedUserOutlined,
  PhoneOutlined,
} from "@mui/icons-material";

export default function ProfileContent() {
  const [profileData, setProfileData] = useState({
    profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    name: "Sokha Chan",
    uniqueId: "@sokhachan",
    tagline: "UI/UX Designer & Brand Specialist",
    location: "Phnom Penh, Cambodia",
    languages: ["English", "ខ្មែរ (Khmer)"],
    bio: "Passionate designer with 5+ years of experience creating beautiful and functional designs for clients worldwide.",
    experienceLevel: "Expert",
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleInputChange = (field: string, value: unknown) => {
    setProfileData({ ...profileData, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = () => {
    // Save logic here
    setHasUnsavedChanges(false);
  };

  const handleRemoveLanguage = (index: number) => {
    const newLanguages = profileData.languages.filter((_, idx) => idx !== index);
    handleInputChange("languages", newLanguages);
  };

  const skills = ["UI/UX Design", "Figma", "Adobe XD", "Branding", "Logo Design", "Web Design"];
  const clients = [
    { name: "Tech Startup Co.", logo: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=100" },
    { name: "Fashion Brand", logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100" },
    { name: "Restaurant Chain", logo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100" },
  ];

  return (
    <Box sx={{ maxWidth: 896, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Profile Picture & Basic Info */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 3 }}>Basic Information</Typography>

        <Box sx={{ display: "flex", alignItems: "start", gap: 3, mb: 3 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar src={profileData.profilePicture} alt='Profile' sx={{ width: 120, height: 120 }} />
            <IconButton
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                bgcolor: "black",
                color: "white",
                width: 36,
                height: 36,
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.8)",
                },
              }}>
              <FileUploadOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Name (can change 3 times/year)</Typography>
              <TextField
                fullWidth
                value={profileData.name}
                onChange={e => handleInputChange("name", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 44,
                    borderRadius: 3,
                    bgcolor: "white",
                    fontSize: 13,
                    "& fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.1)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.2)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.2)",
                      borderWidth: 1,
                    },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Unique ID (cannot be changed)</Typography>
              <TextField
                fullWidth
                value={profileData.uniqueId}
                disabled
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 44,
                    borderRadius: 3,
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                    fontSize: 13,
                    color: "rgba(0, 0, 0, 0.4)",
                    "& fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.1)",
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Short Tagline</Typography>
            <TextField
              fullWidth
              value={profileData.tagline}
              onChange={e => handleInputChange("tagline", e.target.value)}
              placeholder='e.g., Creative Designer Specializing in Branding'
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 44,
                  borderRadius: 3,
                  bgcolor: "white",
                  fontSize: 13,
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.2)",
                    borderWidth: 1,
                  },
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
              <RoomOutlined sx={{ fontSize: 14 }} />
              Location
            </Typography>
            <TextField
              fullWidth
              value={profileData.location}
              onChange={e => handleInputChange("location", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 44,
                  borderRadius: 3,
                  bgcolor: "white",
                  fontSize: 13,
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.2)",
                    borderWidth: 1,
                  },
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
              <PublicOutlined sx={{ fontSize: 14 }} />
              Languages
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
              {profileData.languages.map((lang, idx) => (
                <Chip
                  key={idx}
                  label={lang}
                  onDelete={() => handleRemoveLanguage(idx)}
                  deleteIcon={<CloseOutlined sx={{ fontSize: 12 }} />}
                  sx={{
                    height: 28,
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                    fontSize: 12,
                    color: "black",
                    "& .MuiChip-deleteIcon": {
                      color: "rgba(0, 0, 0, 0.6)",
                      "&:hover": {
                        color: "#ef4444",
                      },
                    },
                  }}
                />
              ))}
            </Box>
            <Button
              startIcon={<AddOutlined sx={{ fontSize: 14 }} />}
              sx={{
                fontSize: 12,
                color: "rgba(0, 0, 0, 0.6)",
                textTransform: "none",
                p: 0,
                minWidth: "auto",
                "&:hover": {
                  color: "black",
                  bgcolor: "transparent",
                },
              }}>
              Add Language
            </Button>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Experience Level</Typography>
            <Select
              fullWidth
              value={profileData.experienceLevel}
              onChange={e => handleInputChange("experienceLevel", e.target.value)}
              sx={{
                height: 44,
                borderRadius: 3,
                bgcolor: "white",
                fontSize: 13,
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.1)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.2)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.2)",
                  borderWidth: 1,
                },
              }}>
              <MenuItem value='Entry Level'>Entry Level</MenuItem>
              <MenuItem value='Intermediate'>Intermediate</MenuItem>
              <MenuItem value='Expert'>Expert</MenuItem>
            </Select>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Bio - About Me</Typography>
            <TextField
              fullWidth
              multiline
              rows={5}
              value={profileData.bio}
              onChange={e => handleInputChange("bio", e.target.value)}
              placeholder='Tell clients about your background, expertise, and what makes you unique...'
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: "white",
                  fontSize: 13,
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.2)",
                    borderWidth: 1,
                  },
                },
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Work Experience / Portfolio */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Work Experience / Portfolio</Typography>
          <Button
            startIcon={<AddOutlined sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: 12,
              color: "rgba(0, 0, 0, 0.6)",
              textTransform: "none",
              "&:hover": {
                color: "black",
                bgcolor: "transparent",
              },
            }}>
            Add Project
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box
            sx={{
              p: 2,
              border: "1px solid rgba(0, 0, 0, 0.1)",
              borderRadius: 3,
              transition: "border-color 0.3s",
              "&:hover": {
                borderColor: "rgba(0, 0, 0, 0.2)",
              },
            }}>
            <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "black" }}>E-commerce Website Redesign</Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>2024</Typography>
            </Box>
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1.5 }}>
              Complete redesign of an e-commerce platform serving 50,000+ customers
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip label='UI/UX' sx={{ height: 24, fontSize: 10, bgcolor: "rgba(0, 0, 0, 0.05)", color: "black" }} />
              <Chip label='Branding' sx={{ height: 24, fontSize: 10, bgcolor: "rgba(0, 0, 0, 0.05)", color: "black" }} />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Skills & Expertise */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Skills & Expertise</Typography>
          <Button
            startIcon={<AddOutlined sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: 12,
              color: "rgba(0, 0, 0, 0.6)",
              textTransform: "none",
              "&:hover": {
                color: "black",
                bgcolor: "transparent",
              },
            }}>
            Add Skill
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {skills.map((skill, idx) => (
            <Chip
              key={idx}
              label={skill}
              onDelete={() => {}}
              deleteIcon={<CloseOutlined sx={{ fontSize: 12 }} />}
              sx={{
                height: 28,
                bgcolor: "rgba(0, 0, 0, 0.05)",
                fontSize: 12,
                color: "black",
                "& .MuiChip-deleteIcon": {
                  color: "rgba(0, 0, 0, 0.6)",
                  "&:hover": {
                    color: "#ef4444",
                  },
                },
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Education */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Education</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mt: 0.5 }}>Optional</Typography>
          </Box>
          <Button
            startIcon={<AddOutlined sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: 12,
              color: "rgba(0, 0, 0, 0.6)",
              textTransform: "none",
              "&:hover": {
                color: "black",
                bgcolor: "transparent",
              },
            }}>
            Add Education
          </Button>
        </Box>

        <Box
          sx={{
            p: 2,
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: 3,
            transition: "border-color 0.3s",
            "&:hover": {
              borderColor: "rgba(0, 0, 0, 0.2)",
            },
          }}>
          <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "black" }}>Bachelor of Arts in Design</Typography>
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>Royal University of Phnom Penh</Typography>
            </Box>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>2015 - 2019</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Certifications */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Certifications</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mt: 0.5 }}>Optional</Typography>
          </Box>
          <Button
            startIcon={<AddOutlined sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: 12,
              color: "rgba(0, 0, 0, 0.6)",
              textTransform: "none",
              "&:hover": {
                color: "black",
                bgcolor: "transparent",
              },
            }}>
            Add Certificate
          </Button>
        </Box>

        <Box
          sx={{
            p: 2,
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: 3,
            transition: "border-color 0.3s",
            "&:hover": {
              borderColor: "rgba(0, 0, 0, 0.2)",
            },
          }}>
          <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "black" }}>
                Google UX Design Professional Certificate
              </Typography>
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>Google</Typography>
            </Box>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>2023</Typography>
          </Box>
          <Button
            sx={{
              fontSize: 11,
              color: "#0071e3",
              textTransform: "none",
              p: 0,
              minWidth: "auto",
              "&:hover": {
                bgcolor: "transparent",
                textDecoration: "underline",
              },
            }}>
            View Certificate
          </Button>
        </Box>
      </Paper>

      {/* About My Clients */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>About My Clients</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mt: 0.5 }}>
              Optional - Showcase clients you&apos;ve worked with
            </Typography>
          </Box>
          <Button
            startIcon={<AddOutlined sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: 12,
              color: "rgba(0, 0, 0, 0.6)",
              textTransform: "none",
              "&:hover": {
                color: "black",
                bgcolor: "transparent",
              },
            }}>
            Add Client
          </Button>
        </Box>

        <Grid container spacing={2}>
          {clients.map((client, idx) => (
            <Grid size={{ xs: 6, sm: 3 }} key={idx}>
              <Box
                sx={{
                  position: "relative",
                  "&:hover .delete-btn": {
                    opacity: 1,
                  },
                }}>
                <Box
                  sx={{
                    aspectRatio: "1",
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                    borderRadius: 3,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                    transition: "background-color 0.3s",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.08)",
                    },
                  }}>
                  <img
                    src={client.logo}
                    alt={client.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", textAlign: "center", mt: 1 }}>
                  {client.name}
                </Typography>
                <IconButton
                  className='delete-btn'
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 24,
                    height: 24,
                    bgcolor: "#ef4444",
                    color: "white",
                    opacity: 0,
                    transition: "opacity 0.3s",
                    "&:hover": {
                      bgcolor: "#dc2626",
                    },
                  }}>
                  <CloseOutlined sx={{ fontSize: 12 }} />
                </IconButton>
              </Box>
            </Grid>
          ))}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Button
              sx={{
                aspectRatio: "1",
                width: "100%",
                bgcolor: "rgba(0, 0, 0, 0.05)",
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.3s",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.08)",
                },
              }}>
              <AddOutlined sx={{ fontSize: 24, color: "rgba(0, 0, 0, 0.4)" }} />
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Verification */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 1 }}>Verification</Typography>
        <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 3 }}>
          Optional, but obtain a badge of verification to build trust with your clients
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "start",
              justifyContent: "space-between",
              p: 2,
              bgcolor: "rgba(34, 197, 94, 0.05)",
              borderRadius: 3,
            }}>
            <Box sx={{ display: "flex", alignItems: "start", gap: 1.5 }}>
              <VerifiedUserOutlined sx={{ fontSize: 20, color: "#16a34a", mt: 0.25 }} />
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: "rgb(21, 128, 61)", mb: 0.5 }}>
                  Identity Verified
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#16a34a" }}>Your ID has been verified</Typography>
              </Box>
            </Box>
            <Chip
              label='VERIFIED'
              sx={{
                height: 24,
                bgcolor: "#16a34a",
                color: "white",
                fontSize: 10,
                fontWeight: 500,
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "start",
              justifyContent: "space-between",
              p: 2,
              bgcolor: "rgba(34, 197, 94, 0.05)",
              borderRadius: 3,
            }}>
            <Box sx={{ display: "flex", alignItems: "start", gap: 1.5 }}>
              <PhoneOutlined sx={{ fontSize: 20, color: "#16a34a", mt: 0.25 }} />
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: "rgb(21, 128, 61)", mb: 0.5 }}>Phone Verified</Typography>
                <Typography sx={{ fontSize: 11, color: "#16a34a" }}>+855 12 345 678</Typography>
              </Box>
            </Box>
            <Chip
              label='VERIFIED'
              sx={{
                height: 24,
                bgcolor: "#16a34a",
                color: "white",
                fontSize: 10,
                fontWeight: 500,
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "rgba(37, 99, 235, 0.05)",
            borderRadius: 3,
          }}>
          <Typography sx={{ fontSize: 12, color: "rgb(29, 78, 216)" }}>
            <strong>Note:</strong> Verification is required to accept service requests from clients.
          </Typography>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          bgcolor: "white",
          borderTop: "1px solid rgba(0, 0, 0, 0.08)",
          p: 3,
          mx: -4,
          mb: -4,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}>
        <Button
          onClick={handleSaveChanges}
          disabled={!hasUnsavedChanges}
          sx={{
            px: 3,
            height: 40,
            fontSize: 13,
            color: "white",
            borderRadius: 10,
            textTransform: "none",
            bgcolor: hasUnsavedChanges ? "black" : "rgba(0, 0, 0, 0.2)",
            cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
            "&:hover": {
              bgcolor: hasUnsavedChanges ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.2)",
            },
            "&.Mui-disabled": {
              color: "white",
            },
          }}>
          Save Changes
        </Button>
        <Button
          disabled={hasUnsavedChanges}
          startIcon={<ShareOutlined sx={{ fontSize: 14 }} />}
          sx={{
            px: 3,
            height: 40,
            fontSize: 13,
            borderRadius: 10,
            textTransform: "none",
            bgcolor: hasUnsavedChanges ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.05)",
            color: hasUnsavedChanges ? "rgba(0, 0, 0, 0.4)" : "black",
            cursor: hasUnsavedChanges ? "not-allowed" : "pointer",
            "&:hover": {
              bgcolor: hasUnsavedChanges ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.1)",
            },
            "&.Mui-disabled": {
              color: "rgba(0, 0, 0, 0.4)",
            },
          }}>
          Share Profile
        </Button>
        {hasUnsavedChanges && <Typography sx={{ fontSize: 11, color: "#f59e0b", ml: 1 }}>You have unsaved changes</Typography>}
      </Box>
    </Box>
  );
}
