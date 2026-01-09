"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Avatar,
  Stack,
  Paper,
  InputAdornment,
} from "@mui/material";
import { Upload as UploadIcon, LocationOn as MapPinIcon, Language as GlobeIcon, Shield as ShieldIcon } from "@mui/icons-material";

export default function ProfileContent() {
  const [profileData, setProfileData] = useState({
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    name: "Sokha Pheakdey",
    company: "Tech Solutions Cambodia",
    industry: "Technology & Software",
    location: "Phnom Penh, Cambodia",
    bio: "Leading a dynamic tech company focused on delivering innovative solutions to businesses across Cambodia. Passionate about supporting local talent and building great products.",
    website: "https://techsolutions.com.kh",
    companySize: "11-50 employees",
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = () => {
    // Save logic here
    setHasUnsavedChanges(false);
  };

  return (
    <Box maxWidth={800} mx='auto'>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(0,0,0,0.08)",
          mb: 3,
        }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='flex-start' mb={4}>
            <Box>
              <Typography variant='h5' fontWeight={600} mb={0.5}>
                Client Profile
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Build trust with freelancers by completing your profile
              </Typography>
            </Box>
            {hasUnsavedChanges && (
              <Button
                variant='contained'
                onClick={handleSaveChanges}
                sx={{
                  bgcolor: "#0071e3",
                  color: "white",
                  fontSize: 13,
                  textTransform: "none",
                  borderRadius: 10,
                  px: 3,
                  "&:hover": {
                    bgcolor: "#0077ED",
                  },
                }}>
                Save Changes
              </Button>
            )}
          </Stack>

          {/* Profile Picture */}
          <Box mb={4}>
            <Typography variant='body2' fontWeight={500} mb={1.5}>
              Profile Picture
            </Typography>
            <Stack direction='row' spacing={3} alignItems='center'>
              <Avatar src={profileData.profilePicture} alt='Profile' sx={{ width: 100, height: 100 }} />
              <Button
                variant='contained'
                startIcon={<UploadIcon sx={{ fontSize: 14 }} />}
                sx={{
                  bgcolor: "rgba(0,0,0,0.05)",
                  color: "black",
                  fontSize: 12,
                  textTransform: "none",
                  borderRadius: 10,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.1)",
                    boxShadow: "none",
                  },
                }}>
                Change Photo
              </Button>
            </Stack>
            <Typography variant='caption' color='text.secondary' display='block' mt={1}>
              A professional photo helps build trust with freelancers
            </Typography>
          </Box>

          {/* Basic Information */}
          <Stack spacing={3}>
            <TextField
              label='Full Name'
              value={profileData.name}
              onChange={e => handleInputChange("name", e.target.value)}
              placeholder='Your full name'
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                },
              }}
            />

            <TextField
              label='Company Name'
              value={profileData.company}
              onChange={e => handleInputChange("company", e.target.value)}
              placeholder='Your company name'
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: 13 }}>Industry</InputLabel>
              <Select
                value={profileData.industry}
                onChange={e => handleInputChange("industry", e.target.value)}
                label='Industry'
                sx={{
                  borderRadius: 2,
                  fontSize: 13,
                }}>
                <MenuItem value='Technology & Software'>Technology & Software</MenuItem>
                <MenuItem value='E-commerce & Retail'>E-commerce & Retail</MenuItem>
                <MenuItem value='Healthcare'>Healthcare</MenuItem>
                <MenuItem value='Education'>Education</MenuItem>
                <MenuItem value='Finance & Banking'>Finance & Banking</MenuItem>
                <MenuItem value='Marketing & Advertising'>Marketing & Advertising</MenuItem>
                <MenuItem value='Real Estate'>Real Estate</MenuItem>
                <MenuItem value='Other'>Other</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: 13 }}>Company Size</InputLabel>
              <Select
                value={profileData.companySize}
                onChange={e => handleInputChange("companySize", e.target.value)}
                label='Company Size'
                sx={{
                  borderRadius: 2,
                  fontSize: 13,
                }}>
                <MenuItem value='1-10 employees'>1-10 employees</MenuItem>
                <MenuItem value='11-50 employees'>11-50 employees</MenuItem>
                <MenuItem value='51-200 employees'>51-200 employees</MenuItem>
                <MenuItem value='201-500 employees'>201-500 employees</MenuItem>
                <MenuItem value='500+ employees'>500+ employees</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label='Location'
              value={profileData.location}
              onChange={e => handleInputChange("location", e.target.value)}
              placeholder='City, Country'
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <MapPinIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                },
              }}
            />

            <TextField
              label='Website'
              value={profileData.website}
              onChange={e => handleInputChange("website", e.target.value)}
              placeholder='https://yourwebsite.com'
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <GlobeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                },
              }}
            />

            <Box>
              <TextField
                label='About'
                value={profileData.bio}
                onChange={e => handleInputChange("bio", e.target.value)}
                placeholder='Tell freelancers about your company and what kind of projects you work on...'
                multiline
                rows={5}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: 13,
                  },
                }}
              />
              <Typography variant='caption' color='text.secondary' display='block' mt={1}>
                {profileData.bio.length}/500 characters
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Verification Section */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(37, 99, 235, 0.2)",
          p: 3,
        }}>
        <Stack direction='row' spacing={2} alignItems='flex-start'>
          <ShieldIcon sx={{ fontSize: 24, color: "#2563eb", mt: 0.5 }} />
          <Box flex={1}>
            <Typography variant='body1' fontWeight={600} mb={0.5}>
              Verify Your Identity
            </Typography>
            <Typography variant='body2' color='text.secondary' mb={2}>
              Verified clients receive 3x more proposals from top freelancers. Complete verification to build trust and
              credibility.
            </Typography>
            <Button
              variant='contained'
              sx={{
                bgcolor: "#0071e3",
                color: "white",
                fontSize: 12,
                textTransform: "none",
                borderRadius: 10,
                "&:hover": {
                  bgcolor: "#0077ED",
                },
              }}>
              Start Verification
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
