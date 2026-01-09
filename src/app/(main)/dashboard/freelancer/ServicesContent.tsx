"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  Chip,
  Switch,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Close,
  Edit,
  Delete,
  Visibility,
  ChevronLeft,
  Upload as UploadIcon,
  LocationOn,
  Image as ImageIcon,
  VideoLibrary,
  InsertDriveFile,
  HelpOutline,
  Description,
  BusinessCenter,
} from "@mui/icons-material";

interface Service {
  id: number;
  title: string;
  category: string;
  status: string;
  orders?: number;
  pricing?: {
    basic: number;
    standard: number;
    premium: number;
  };
  lastEdited?: string;
}

export default function ServicesContent() {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingService, setEditingService] = useState<Service | null>(null);

  const mockServices: Service[] = [
    {
      id: 1,
      title: "Modern Logo Design",
      category: "Graphics & Design",
      status: "Published",
      orders: 12,
      pricing: { basic: 50, standard: 100, premium: 200 },
    },
    {
      id: 2,
      title: "Website Development",
      category: "Web Development",
      status: "Published",
      orders: 5,
      pricing: { basic: 300, standard: 600, premium: 1200 },
    },
  ];

  const mockDrafts: Service[] = [
    {
      id: 3,
      title: "Social Media Management",
      category: "Digital Marketing",
      status: "Draft",
      lastEdited: "2 days ago",
    },
  ];

  if (view === "create" || view === "edit") {
    return (
      <ServiceCreateEditForm
        service={editingService}
        onBack={() => {
          setView("list");
          setEditingService(null);
        }}
      />
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 600, mb: 0.5 }}>My Services</Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)" }}>Create and manage your service offerings</Typography>
        </Box>
        <Button
          onClick={() => setView("create")}
          startIcon={<Add />}
          sx={{
            px: 3,
            height: 44,
            fontSize: 13,
            color: "white",
            bgcolor: "black",
            borderRadius: 25,
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
          }}>
          Create Service
        </Button>
      </Box>

      {/* Active Services */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          p: 3,
        }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, mb: 2 }}>Active Services</Typography>

        {mockServices.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {mockServices.map(service => (
              <Box
                key={service.id}
                sx={{
                  p: 2,
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: 1.5,
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: "rgba(0, 0, 0, 0.2)" },
                }}>
                <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 500, mb: 0.5 }}>{service.title}</Typography>
                    <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1.5 }}>{service.category}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
                      <span>{service.orders} orders</span>
                      <span>•</span>
                      <span>
                        ${service.pricing?.basic} - ${service.pricing?.premium}
                      </span>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      onClick={() => {
                        setEditingService(service);
                        setView("edit");
                      }}
                      sx={{
                        color: "rgba(0, 0, 0, 0.6)",
                        "&:hover": { color: "black", bgcolor: "rgba(0, 0, 0, 0.05)" },
                      }}>
                      <Edit sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      sx={{
                        color: "rgba(0, 0, 0, 0.6)",
                        "&:hover": { color: "black", bgcolor: "rgba(0, 0, 0, 0.05)" },
                      }}>
                      <Visibility sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      sx={{
                        color: "rgba(220, 38, 38, 0.6)",
                        "&:hover": { color: "#dc2626", bgcolor: "#fef2f2" },
                      }}>
                      <Delete sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <BusinessCenter sx={{ fontSize: 48, color: "rgba(0, 0, 0, 0.2)", mb: 2 }} />
            <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)" }}>No active services yet</Typography>
          </Box>
        )}
      </Box>

      {/* Drafts */}
      {mockDrafts.length > 0 && (
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            border: "1px solid rgba(0, 0, 0, 0.08)",
            p: 3,
          }}>
          <Typography sx={{ fontSize: 17, fontWeight: 600, mb: 2 }}>Drafts</Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {mockDrafts.map(draft => (
              <Box
                key={draft.id}
                sx={{
                  p: 2,
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: 1.5,
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: "rgba(0, 0, 0, 0.2)" },
                }}>
                <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between" }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{draft.title}</Typography>
                      <Chip
                        label='DRAFT'
                        size='small'
                        sx={{
                          bgcolor: "rgba(245, 158, 11, 0.1)",
                          color: "#b45309",
                          fontSize: 10,
                          height: 20,
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>{draft.category}</Typography>
                    <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)" }}>Last edited {draft.lastEdited}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      onClick={() => {
                        setEditingService(draft);
                        setView("edit");
                      }}
                      sx={{
                        px: 2,
                        height: 32,
                        fontSize: 12,
                        color: "black",
                        bgcolor: "rgba(0, 0, 0, 0.05)",
                        borderRadius: 1,
                        textTransform: "none",
                        "&:hover": { bgcolor: "rgba(0, 0, 0, 0.1)" },
                      }}>
                      Continue Editing
                    </Button>
                    <IconButton
                      sx={{
                        color: "rgba(220, 38, 38, 0.6)",
                        "&:hover": { color: "#dc2626", bgcolor: "#fef2f2" },
                      }}>
                      <Delete sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function ServiceCreateEditForm({ service, onBack }: { service?: Service | null; onBack: () => void }) {
  const isEditing = !!service;

  const [formData, setFormData] = useState({
    title: service?.title || "",
    category: service?.category || "",
    searchTags: ["", "", "", "", ""],
    description: "",
    location: "Phnom Penh, Cambodia",
    pricing: {
      basic: {
        name: "Basic",
        description: "",
        revisions: "1",
        deliveryTime: "3",
        price: "",
      },
      standard: {
        name: "Standard",
        description: "",
        revisions: "3",
        deliveryTime: "5",
        price: "",
      },
      premium: {
        name: "Premium",
        description: "",
        revisions: "Unlimited",
        deliveryTime: "7",
        price: "",
      },
    },
    customOrders: {
      enabled: false,
      acceptHourlyRate: false,
      hourlyRate: "",
      minimumBudget: "",
      customInstructions: "",
    },
    requirements: [] as Array<{ question: string; type: string; required: boolean }>,
    faqs: [] as Array<{ question: string; answer: string }>,
    agreeToTerms: false,
  });

  const [uploadedMedia] = useState<any[]>([]);

  const categories = [
    "Graphics & Design",
    "Web Development",
    "Mobile Development",
    "Digital Marketing",
    "Writing & Translation",
    "Video & Animation",
    "Music & Audio",
    "Business & Consulting",
  ];

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.searchTags];
    newTags[index] = value;
    setFormData({ ...formData, searchTags: newTags });
  };

  const handleAddRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, { question: "", type: "text", required: false }],
    });
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const handleAddFAQ = () => {
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { question: "", answer: "" }],
    });
  };

  const handleRemoveFAQ = (index: number) => {
    setFormData({
      ...formData,
      faqs: formData.faqs.filter((_, i) => i !== index),
    });
  };

  const handleSaveDraft = () => {
    alert("Service saved as draft!");
  };

  const handlePublish = () => {
    if (!formData.agreeToTerms) {
      alert("Please agree to the Terms of Service");
      return;
    }
    alert("Service published successfully!");
    onBack();
  };

  return (
    <Box sx={{ maxWidth: 1024, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Button
          onClick={onBack}
          startIcon={<ChevronLeft />}
          sx={{
            fontSize: 12,
            color: "rgba(0, 0, 0, 0.6)",
            textTransform: "none",
            mb: 2,
            "&:hover": { color: "black", bgcolor: "transparent" },
          }}>
          Back to Services
        </Button>
        <Typography sx={{ fontSize: 28, fontWeight: 600, mb: 0.5 }}>
          {isEditing ? "Edit Service" : "Create New Service"}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)" }}>
          Fill in the details about your service offering
        </Typography>
      </Box>

      {/* Basic Information */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          p: 4,
        }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, mb: 3 }}>Basic Information</Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Service Title *</Typography>
            <TextField
              fullWidth
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder='e.g., I will create a modern logo design for your brand'
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: 13,
                  "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                  "&:hover fieldset": { borderColor: "rgba(0, 0, 0, 0.2)" },
                },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Category *</Typography>
            <Select
              fullWidth
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              displayEmpty
              sx={{
                fontSize: 13,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.1)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.2)" },
              }}>
              <MenuItem value='' disabled sx={{ fontSize: 13 }}>
                Select a category
              </MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat} value={cat} sx={{ fontSize: 13 }}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Search Tags * (up to 5 keywords)</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)", mb: 1.5 }}>
              Add keywords that buyers might search for. Our search engine will match these with buyer searches.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {formData.searchTags.map((tag, index) => (
                <TextField
                  key={index}
                  fullWidth
                  value={tag}
                  onChange={e => handleTagChange(index, e.target.value)}
                  placeholder={`Keyword ${index + 1}`}
                  size='small'
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: 13,
                      "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography
              sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 14 }} />
              Location
            </Typography>
            <TextField
              fullWidth
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: 13,
                  "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Service Description *</Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder='Describe your service in detail. What will you deliver? What makes your service unique?'
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: 13,
                  "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Pricing Options */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          p: 4,
        }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, mb: 0.5 }}>Pricing Options</Typography>
        <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 3 }}>
          Offer three pricing tiers to give clients flexibility
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
          }}>
          {(["basic", "standard", "premium"] as const).map(tier => (
            <Box
              key={tier}
              sx={{
                p: 2,
                border: "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: 1.5,
              }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 2, textTransform: "capitalize" }}>{tier}</Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Name</Typography>
                  <TextField
                    fullWidth
                    size='small'
                    value={formData.pricing[tier].name}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          [tier]: { ...formData.pricing[tier], name: e.target.value },
                        },
                      })
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: 12,
                        "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Description</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size='small'
                    value={formData.pricing[tier].description}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          [tier]: { ...formData.pricing[tier], description: e.target.value },
                        },
                      })
                    }
                    placeholder="What's included?"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: 12,
                        "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Revisions</Typography>
                  <TextField
                    fullWidth
                    size='small'
                    value={formData.pricing[tier].revisions}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          [tier]: { ...formData.pricing[tier], revisions: e.target.value },
                        },
                      })
                    }
                    placeholder='e.g., 3 or Unlimited'
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: 12,
                        "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Delivery Time (days)</Typography>
                  <TextField
                    fullWidth
                    type='number'
                    size='small'
                    value={formData.pricing[tier].deliveryTime}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          [tier]: { ...formData.pricing[tier], deliveryTime: e.target.value },
                        },
                      })
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: 12,
                        "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Price (USD) *</Typography>
                  <TextField
                    fullWidth
                    type='number'
                    size='small'
                    value={formData.pricing[tier].price}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          [tier]: { ...formData.pricing[tier], price: e.target.value },
                        },
                      })
                    }
                    InputProps={{
                      startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: 12,
                        "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(59, 130, 246, 0.05)", borderRadius: 1.5 }}>
          <Typography sx={{ fontSize: 11, color: "#1d4ed8" }}>
            <strong>Note:</strong> Once published, customers who purchase at a certain price will keep that price even if you edit
            it later.
          </Typography>
        </Box>
      </Box>

      {/* Custom Orders */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          p: 4,
        }}>
        <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 600, mb: 0.5 }}>Custom Orders (Optional)</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
              Allow clients to request custom quotes with their own budget and requirements
            </Typography>
          </Box>
          <Switch
            checked={formData.customOrders.enabled}
            onChange={e =>
              setFormData({
                ...formData,
                customOrders: { ...formData.customOrders, enabled: e.target.checked },
              })
            }
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "white",
                "& + .MuiSwitch-track": { bgcolor: "black" },
              },
            }}
          />
        </Box>

        {formData.customOrders.enabled && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2, borderTop: "1px solid rgba(0, 0, 0, 0.08)" }}>
            <Box sx={{ p: 2, bgcolor: "rgba(245, 158, 11, 0.05)", borderRadius: 1.5 }}>
              <Typography sx={{ fontSize: 11, color: "#b45309" }}>
                <strong>How it works:</strong> Clients can send you a custom order request with their budget and specific
                requirements. You can review and accept or decline each request.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 2,
              }}>
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.customOrders.acceptHourlyRate}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          customOrders: {
                            ...formData.customOrders,
                            acceptHourlyRate: e.target.checked,
                          },
                        })
                      }
                      size='small'
                    />
                  }
                  label={<Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>Accept hourly rate projects</Typography>}
                  sx={{ mb: 1.5 }}
                />

                {formData.customOrders.acceptHourlyRate && (
                  <Box>
                    <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Hourly Rate (USD/hour) *</Typography>
                    <TextField
                      fullWidth
                      type='number'
                      size='small'
                      value={formData.customOrders.hourlyRate}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          customOrders: {
                            ...formData.customOrders,
                            hourlyRate: e.target.value,
                          },
                        })
                      }
                      placeholder='50'
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                        endAdornment: <InputAdornment position='end'>/hour</InputAdornment>,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: 12,
                          "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>

              <Box>
                <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Minimum Budget (USD)</Typography>
                <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)", mb: 1 }}>
                  Set a minimum project budget for custom orders
                </Typography>
                <TextField
                  fullWidth
                  type='number'
                  size='small'
                  value={formData.customOrders.minimumBudget}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      customOrders: {
                        ...formData.customOrders,
                        minimumBudget: e.target.value,
                      },
                    })
                  }
                  placeholder='100'
                  InputProps={{
                    startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: 12,
                      "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                    },
                  }}
                />
              </Box>
            </Box>

            <Box>
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Instructions for Clients</Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)", mb: 1 }}>
                Tell clients what information they should provide in their custom order request
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.customOrders.customInstructions}
                onChange={e =>
                  setFormData({
                    ...formData,
                    customOrders: {
                      ...formData.customOrders,
                      customInstructions: e.target.value,
                    },
                  })
                }
                placeholder='Please provide: 
• Project description
• Timeline expectations
• Budget range
• Any reference materials'
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: 13,
                    "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, p: 2, bgcolor: "rgba(59, 130, 246, 0.05)", borderRadius: 1.5 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 12, color: "#1d4ed8", mb: 1, fontWeight: 600 }}>
                  Benefits of Custom Orders:
                </Typography>
                <Box component='ul' sx={{ fontSize: 11, color: "#2563eb", pl: 2.5, m: 0, "& li": { mb: 0.5 } }}>
                  <li>Accept projects that don't fit your standard packages</li>
                  <li>Build relationships with clients who have unique needs</li>
                  <li>Negotiate pricing based on project scope</li>
                  <li>Flexibility in hourly vs. fixed pricing</li>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Gallery / Media */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          p: 4,
        }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, mb: 0.5 }}>Gallery / Media</Typography>
        <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 3 }}>
          Upload images, videos, or PDFs to showcase your work
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 2,
          }}>
          {uploadedMedia.map((media, idx) => (
            <Box
              key={idx}
              sx={{
                position: "relative",
                aspectRatio: "1",
                bgcolor: "rgba(0, 0, 0, 0.05)",
                borderRadius: 1.5,
                overflow: "hidden",
                "&:hover .delete-button": { opacity: 1 },
              }}>
              <img src={media.url} alt='' style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <IconButton
                className='delete-button'
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "#ef4444",
                  color: "white",
                  p: 0.75,
                  opacity: 0,
                  transition: "opacity 0.2s",
                  "&:hover": { bgcolor: "#dc2626" },
                }}>
                <Close sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
          ))}

          <Button
            sx={{
              aspectRatio: "1",
              bgcolor: "rgba(0, 0, 0, 0.05)",
              borderRadius: 1.5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(0, 0, 0, 0.08)" },
            }}>
            <UploadIcon sx={{ fontSize: 24, color: "rgba(0, 0, 0, 0.4)", mb: 1 }} />
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Upload Media</Typography>
            <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.4)", mt: 0.5 }}>Image, Video, PDF</Typography>
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 2, fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ImageIcon sx={{ fontSize: 14 }} />
            <span>Images</span>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <VideoLibrary sx={{ fontSize: 14 }} />
            <span>Videos</span>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <InsertDriveFile sx={{ fontSize: 14 }} />
            <span>PDFs</span>
          </Box>
        </Box>
      </Box>

      {/* Requirements */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          p: 4,
        }}>
        <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 600, mb: 0.5 }}>Requirements (Optional)</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
              Questions for buyers to answer before ordering. Helps you gather necessary information.
            </Typography>
          </Box>
          <Button
            onClick={handleAddRequirement}
            startIcon={<Add sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: 12,
              color: "rgba(0, 0, 0, 0.6)",
              textTransform: "none",
              "&:hover": { color: "black", bgcolor: "transparent" },
            }}>
            Add Question
          </Button>
        </Box>

        {formData.requirements.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {formData.requirements.map((req, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: 1.5,
                }}>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <TextField
                      fullWidth
                      size='small'
                      value={req.question}
                      onChange={e => {
                        const newReqs = [...formData.requirements];
                        newReqs[index].question = e.target.value;
                        setFormData({ ...formData, requirements: newReqs });
                      }}
                      placeholder='Enter your question'
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: 13,
                          "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                        },
                      }}
                    />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Select
                        value={req.type}
                        onChange={e => {
                          const newReqs = [...formData.requirements];
                          newReqs[index].type = e.target.value;
                          setFormData({ ...formData, requirements: newReqs });
                        }}
                        size='small'
                        sx={{
                          fontSize: 12,
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.1)" },
                        }}>
                        <MenuItem value='text' sx={{ fontSize: 12 }}>
                          Free Text
                        </MenuItem>
                        <MenuItem value='multiple' sx={{ fontSize: 12 }}>
                          Multiple Choice
                        </MenuItem>
                        <MenuItem value='attachment' sx={{ fontSize: 12 }}>
                          Attachment
                        </MenuItem>
                      </Select>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={req.required}
                            onChange={e => {
                              const newReqs = [...formData.requirements];
                              newReqs[index].required = e.target.checked;
                              setFormData({ ...formData, requirements: newReqs });
                            }}
                            size='small'
                          />
                        }
                        label={<Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>Required</Typography>}
                      />
                    </Box>
                  </Box>

                  <IconButton
                    onClick={() => handleRemoveRequirement(index)}
                    sx={{
                      color: "rgba(220, 38, 38, 0.6)",
                      "&:hover": { color: "#dc2626", bgcolor: "#fef2f2" },
                    }}>
                    <Close sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 4, bgcolor: "rgba(0, 0, 0, 0.02)", borderRadius: 1.5 }}>
            <HelpOutline sx={{ fontSize: 32, color: "rgba(0, 0, 0, 0.2)", mb: 1 }} />
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>No requirements added yet</Typography>
          </Box>
        )}
      </Box>

      {/* FAQs */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          p: 4,
        }}>
        <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 600, mb: 0.5 }}>FAQs (Optional)</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Answer common questions about your service</Typography>
          </Box>
          <Button
            onClick={handleAddFAQ}
            startIcon={<Add sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: 12,
              color: "rgba(0, 0, 0, 0.6)",
              textTransform: "none",
              "&:hover": { color: "black", bgcolor: "transparent" },
            }}>
            Add FAQ
          </Button>
        </Box>

        {formData.faqs.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {formData.faqs.map((faq, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: 1.5,
                }}>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <TextField
                      fullWidth
                      size='small'
                      value={faq.question}
                      onChange={e => {
                        const newFaqs = [...formData.faqs];
                        newFaqs[index].question = e.target.value;
                        setFormData({ ...formData, faqs: newFaqs });
                      }}
                      placeholder='Question'
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: 13,
                          "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={faq.answer}
                      onChange={e => {
                        const newFaqs = [...formData.faqs];
                        newFaqs[index].answer = e.target.value;
                        setFormData({ ...formData, faqs: newFaqs });
                      }}
                      placeholder='Answer'
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: 13,
                          "& fieldset": { borderColor: "rgba(0, 0, 0, 0.1)" },
                        },
                      }}
                    />
                  </Box>

                  <IconButton
                    onClick={() => handleRemoveFAQ(index)}
                    sx={{
                      color: "rgba(220, 38, 38, 0.6)",
                      "&:hover": { color: "#dc2626", bgcolor: "#fef2f2" },
                    }}>
                    <Close sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 4, bgcolor: "rgba(0, 0, 0, 0.02)", borderRadius: 1.5 }}>
            <Description sx={{ fontSize: 32, color: "rgba(0, 0, 0, 0.2)", mb: 1 }} />
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>No FAQs added yet</Typography>
          </Box>
        )}
      </Box>

      {/* Terms & Actions */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          p: 4,
        }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.agreeToTerms}
              onChange={e => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              size='small'
            />
          }
          label={
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
              I agree to the{" "}
              <Button
                sx={{
                  fontSize: 11,
                  color: "#0071e3",
                  textTransform: "none",
                  p: 0,
                  minWidth: "auto",
                  verticalAlign: "baseline",
                  "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                }}>
                Terms of Service
              </Button>{" "}
              and confirm that all information provided is accurate
            </Typography>
          }
          sx={{ mb: 3, alignItems: "flex-start" }}
        />

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={handlePublish}
            disabled={!formData.agreeToTerms}
            sx={{
              px: 3,
              height: 44,
              fontSize: 13,
              borderRadius: 25,
              textTransform: "none",
              bgcolor: formData.agreeToTerms ? "black" : "rgba(0, 0, 0, 0.2)",
              color: "white",
              "&:hover": {
                bgcolor: formData.agreeToTerms ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.2)",
              },
              "&.Mui-disabled": {
                color: "white",
                cursor: "not-allowed",
              },
            }}>
            {isEditing ? "Save Changes" : "Publish Service"}
          </Button>

          <Button
            onClick={handleSaveDraft}
            sx={{
              px: 3,
              height: 44,
              fontSize: 13,
              color: "black",
              bgcolor: "rgba(0, 0, 0, 0.05)",
              borderRadius: 25,
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(0, 0, 0, 0.1)" },
            }}>
            Save as Draft
          </Button>

          <Button
            onClick={onBack}
            sx={{
              px: 3,
              height: 44,
              fontSize: 13,
              color: "rgba(0, 0, 0, 0.6)",
              textTransform: "none",
              "&:hover": { color: "black", bgcolor: "transparent" },
            }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
