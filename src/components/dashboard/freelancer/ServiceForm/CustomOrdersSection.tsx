import { Box, Paper, Typography, TextField, Switch, Checkbox, FormControlLabel, Grid } from "@mui/material";
import { ServiceFormData, textareaSx } from "../types";

interface CustomOrdersSectionProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
}

export default function CustomOrdersSection({ formData, onFormDataChange }: CustomOrdersSectionProps) {
  const { customOrders } = formData;

  const handleChange = (field: keyof typeof customOrders, value: string | boolean) => {
    onFormDataChange({
      ...formData,
      customOrders: { ...customOrders, [field]: value },
    });
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
      <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 0.5 }}>Custom Orders (Optional)</Typography>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
            Allow clients to request custom quotes with their own budget and requirements
          </Typography>
        </Box>
        <Switch
          checked={customOrders.enabled}
          onChange={e => handleChange("enabled", e.target.checked)}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: "black",
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              bgcolor: "black",
            },
          }}
        />
      </Box>

      {customOrders.enabled && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2, borderTop: "1px solid rgba(0, 0, 0, 0.08)" }}>
          <Box sx={{ p: 2, bgcolor: "rgba(245, 158, 11, 0.05)", borderRadius: 3 }}>
            <Typography sx={{ fontSize: 11, color: "#b45309" }}>
              <strong>How it works:</strong> Clients can send you a custom order request with their budget and specific requirements.
              You can review and accept or decline each request.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={customOrders.acceptHourlyRate}
                    onChange={e => handleChange("acceptHourlyRate", e.target.checked)}
                    sx={{
                      color: "rgba(0, 0, 0, 0.2)",
                      "&.Mui-checked": {
                        color: "black",
                      },
                    }}
                  />
                }
                label={<Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>Accept hourly rate projects</Typography>}
                sx={{ mb: 1.5 }}
              />

              {customOrders.acceptHourlyRate && (
                <Box>
                  <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Hourly Rate (USD/hour) *</Typography>
                  <Box sx={{ position: "relative" }}>
                    <Typography
                      sx={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 12,
                        color: "rgba(0, 0, 0, 0.6)",
                        zIndex: 1,
                      }}>
                      $
                    </Typography>
                    <Typography
                      sx={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 12,
                        color: "rgba(0, 0, 0, 0.4)",
                        zIndex: 1,
                      }}>
                      /hour
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={customOrders.hourlyRate}
                      onChange={e => handleChange("hourlyRate", e.target.value)}
                      placeholder="50"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          height: 40,
                          borderRadius: 2,
                          bgcolor: "white",
                          fontSize: 12,
                          "& input": {
                            pl: 2.5,
                            pr: 5,
                          },
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
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Minimum Budget (USD)</Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)", mb: 1 }}>
                Set a minimum project budget for custom orders
              </Typography>
              <Box sx={{ position: "relative" }}>
                <Typography
                  sx={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 12,
                    color: "rgba(0, 0, 0, 0.6)",
                    zIndex: 1,
                  }}>
                  $
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={customOrders.minimumBudget}
                  onChange={e => handleChange("minimumBudget", e.target.value)}
                  placeholder="100"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "white",
                      fontSize: 12,
                      "& input": {
                        pl: 2.5,
                      },
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
            </Grid>
          </Grid>

          <Box>
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Instructions for Clients</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.4)", mb: 1 }}>
              Tell clients what information they should provide in their custom order request
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={customOrders.customInstructions}
              onChange={e => handleChange("customInstructions", e.target.value)}
              placeholder={`Please provide:\n• Project description\n• Timeline expectations\n• Budget range\n• Any reference materials`}
              sx={textareaSx}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "start", gap: 1.5, p: 2, bgcolor: "rgba(37, 99, 235, 0.05)", borderRadius: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 12, color: "rgb(29, 78, 216)", mb: 1 }}>
                <strong>Benefits of Custom Orders:</strong>
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2, fontSize: 11, color: "rgb(37, 99, 235)" }}>
                <li>Accept projects that don&apos;t fit your standard packages</li>
                <li>Build relationships with clients who have unique needs</li>
                <li>Negotiate pricing based on project scope</li>
                <li>Flexibility in hourly vs. fixed pricing</li>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
