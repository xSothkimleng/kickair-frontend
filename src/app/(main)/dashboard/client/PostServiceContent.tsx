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
  Stack,
  Chip,
  InputAdornment,
  Grid,
  Paper,
} from "@mui/material";
import { AttachMoney as DollarSignIcon, UploadFile as UploadIcon } from "@mui/icons-material";

export default function PostProjectContent() {
  const [projectData, setProjectData] = useState({
    title: "",
    category: "",
    budget: "",
    deadline: "",
    description: "",
    skills: [] as string[],
    attachments: [] as string[],
  });

  const categories = [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Graphic Design",
    "Content Writing",
    "Digital Marketing",
    "Video Editing",
    "Data Entry",
    "Virtual Assistant",
  ];

  const popularSkills = [
    "React",
    "Vue.js",
    "Node.js",
    "Python",
    "Figma",
    "Adobe Photoshop",
    "Illustrator",
    "SEO",
    "Content Writing",
    "Social Media Marketing",
  ];

  const toggleSkill = (skill: string) => {
    setProjectData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill],
    }));
  };

  return (
    <Box maxWidth={900} mx='auto'>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(0,0,0,0.08)",
        }}>
        <CardContent sx={{ p: 4 }}>
          <Box mb={4}>
            <Typography variant='h4' fontWeight={600} mb={1}>
              Post a Project Brief
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Tell us about your project and we&apos;ll match you with the right freelancers
            </Typography>
          </Box>

          <Stack spacing={3}>
            {/* Project Title */}
            <TextField
              label='Project Title'
              value={projectData.title}
              onChange={e => setProjectData({ ...projectData, title: e.target.value })}
              placeholder='e.g., Build a modern e-commerce website'
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                },
              }}
            />

            {/* Category */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: 13 }}>Category</InputLabel>
              <Select
                value={projectData.category}
                onChange={e => setProjectData({ ...projectData, category: e.target.value })}
                label='Category'
                sx={{
                  borderRadius: 2,
                  fontSize: 13,
                }}>
                <MenuItem value=''>
                  <em>Select a category</em>
                </MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Budget & Deadline */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label='Budget (USD)'
                  type='number'
                  value={projectData.budget}
                  onChange={e => setProjectData({ ...projectData, budget: e.target.value })}
                  placeholder='500'
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <DollarSignIcon sx={{ fontSize: 16, color: "text.secondary" }} />
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
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label='Deadline'
                  type='date'
                  value={projectData.deadline}
                  onChange={e => setProjectData({ ...projectData, deadline: e.target.value })}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      fontSize: 13,
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Description */}
            <TextField
              label='Project Description'
              value={projectData.description}
              onChange={e => setProjectData({ ...projectData, description: e.target.value })}
              placeholder='Describe your project in detail. What are your goals? What features do you need? Any specific requirements?'
              multiline
              rows={8}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                },
              }}
            />

            {/* Skills */}
            <Box>
              <Typography variant='body2' fontWeight={500} mb={1.5}>
                Required Skills
              </Typography>
              <Stack direction='row' flexWrap='wrap' gap={1}>
                {popularSkills.map(skill => (
                  <Chip
                    key={skill}
                    label={skill}
                    onClick={() => toggleSkill(skill)}
                    sx={{
                      fontSize: 12,
                      height: 32,
                      cursor: "pointer",
                      ...(projectData.skills.includes(skill)
                        ? {
                            bgcolor: "#0071e3",
                            color: "white",
                            "&:hover": { bgcolor: "#0077ED" },
                          }
                        : {
                            bgcolor: "rgba(0,0,0,0.05)",
                            color: "rgba(0,0,0,0.6)",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
                          }),
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* File Attachments */}
            <Box>
              <Typography variant='body2' fontWeight={500} mb={1.5}>
                Attachments (Optional)
              </Typography>
              <Paper
                sx={{
                  border: "2px dashed",
                  borderColor: "rgba(0,0,0,0.2)",
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "#0071e3",
                    bgcolor: "rgba(0, 113, 227, 0.02)",
                  },
                }}>
                <UploadIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                <Typography variant='body2' fontWeight={500} mb={0.5}>
                  Click to upload or drag and drop
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  PDF, DOC, PNG, JPG (max 10MB)
                </Typography>
              </Paper>
            </Box>

            {/* Submit Button */}
            <Stack direction='row' spacing={2} pt={2}>
              <Button
                variant='outlined'
                fullWidth
                sx={{
                  fontSize: 13,
                  textTransform: "none",
                  borderRadius: 10,
                  borderColor: "rgba(0,0,0,0.2)",
                  color: "black",
                  "&:hover": {
                    borderColor: "rgba(0,0,0,0.4)",
                    bgcolor: "transparent",
                  },
                }}>
                Save as Draft
              </Button>
              <Button
                variant='contained'
                fullWidth
                sx={{
                  fontSize: 13,
                  textTransform: "none",
                  borderRadius: 10,
                  bgcolor: "#0071e3",
                  "&:hover": {
                    bgcolor: "#0077ED",
                  },
                }}>
                Post Project
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
