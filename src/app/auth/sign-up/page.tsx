"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Typography, TextField, Button, Divider, InputAdornment, Grid, Alert } from "@mui/material";
import { useAuth } from "@/components/context/AuthContext";
import {
  PersonOutline,
  MailOutline,
  LockOutlined,
  ArrowBack,
  PhoneOutlined,
  BusinessCenterOutlined,
  ShoppingBagOutlined,
} from "@mui/icons-material";

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [userType, setUserType] = useState<"client" | "freelancer" | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        is_client: userType === "client",
        is_freelancer: userType === "freelancer",
        telephone: formData.phone || undefined,
      });

      // Navigate to appropriate dashboard based on user type
      if (userType === "freelancer") {
        router.push("/dashboard/freelancer");
      } else {
        router.push("/dashboard/client");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Select user type
  if (!userType) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, sm: 6 },
        }}>
        <Box sx={{ width: "100%", maxWidth: 1024 }}>
          {/* Back Button */}
          <Button
            startIcon={<ArrowBack />}
            sx={{
              color: "text.secondary",
              textTransform: "none",
              mb: 4,
              "&:hover": {
                color: "text.primary",
                backgroundColor: "transparent",
              },
            }}>
            <Typography variant='body2'>Back to Sign In</Typography>
          </Button>

          {/* User Type Selection */}
          <Box sx={{ textAlign: "center" }}>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant='h3'
                component='h1'
                sx={{
                  fontWeight: 500,
                  mb: 1,
                  fontSize: { xs: "1.875rem", md: "2.25rem" },
                  color: "text.primary",
                }}>
                Join as a client or freelancer
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Choose how you want to use KickAir
              </Typography>
            </Box>

            <Grid
              container
              spacing={3}
              sx={{
                maxWidth: 768,
                mx: "auto",
                mb: 4,
              }}>
              {/* Client Card */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  onClick={() => setUserType("client")}
                  elevation={0}
                  sx={{
                    borderRadius: 6,
                    border: 2,
                    borderColor: "divider",
                    p: { xs: 4, md: 6 },
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: 3,
                      "& .icon-container": {
                        backgroundColor: "primary.light",
                      },
                    },
                  }}>
                  {/* <Box
                    className='icon-container'
                    sx={{
                      width: 64,
                      height: 64,
                      backgroundColor: "primary.light",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                      transition: "background-color 0.3s",
                      opacity: 0.1,
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 4,
                        backgroundColor: "primary.main",
                        opacity: 0.1,
                      },
                    }}>
                    <ShoppingBagOutlined
                      sx={{
                        fontSize: 32,
                        color: "black",
                        position: "relative",
                        zIndex: 1,
                      }}
                    />
                  </Box> */}
                  <Typography variant='h6' sx={{ mb: 2, color: "text.primary" }}>
                    I&apos;m a client, hiring for a project
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Find talented freelancers for your next project
                  </Typography>
                </Paper>
              </Grid>

              {/* Freelancer Card */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  onClick={() => setUserType("freelancer")}
                  elevation={0}
                  sx={{
                    borderRadius: 6,
                    border: 2,
                    borderColor: "divider",
                    p: { xs: 4, md: 6 },
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: 3,
                      "& .icon-container": {
                        backgroundColor: "primary.light",
                      },
                    },
                  }}>
                  {/* <Box
                    className='icon-container'
                    sx={{
                      width: 64,
                      height: 64,
                      backgroundColor: "primary.light",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                      transition: "background-color 0.3s",
                      opacity: 0.1,
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 4,
                        backgroundColor: "primary.main",
                        opacity: 0.1,
                      },
                    }}>
                    <BusinessCenterOutlined
                      sx={{
                        fontSize: 62,
                        color: "text.primary",
                        position: "relative",
                        zIndex: 1,
                      }}
                    />
                  </Box> */}
                  <Typography variant='h6' sx={{ mb: 2, color: "text.primary" }}>
                    I&apos;m a freelancer, looking for work
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Showcase your skills and get hired for amazing projects
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant='caption' color='text.secondary'>
              Already have an account?{" "}
              <Button
                // onClick={() => onNavigate("login")}
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  p: 0,
                  minWidth: "auto",
                  color: "primary.main",
                  verticalAlign: "baseline",
                  "&:hover": {
                    backgroundColor: "transparent",
                    textDecoration: "underline",
                  },
                }}>
                Sign In
              </Button>
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // Step 2: Registration form
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 3, sm: 6 },
        py: 12,
      }}>
      <Box sx={{ width: "100%", maxWidth: 448 }}>
        {/* Back Button */}
        <Button
          onClick={() => setUserType(null)}
          startIcon={<ArrowBack />}
          sx={{
            color: "text.secondary",
            textTransform: "none",
            mb: 4,
            "&:hover": {
              color: "text.primary",
              backgroundColor: "transparent",
            },
          }}>
          <Typography variant='body2'>Back</Typography>
        </Button>

        {/* Register Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 6,
            border: 1,
            borderColor: "divider",
            p: { xs: 4, md: 6 },
          }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant='h4'
              component='h1'
              sx={{
                fontWeight: 500,
                mb: 1,
                color: "text.primary",
              }}>
              {userType === "freelancer" ? "Create Freelancer Account" : "Create Client Account"}
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              {userType === "freelancer" ? "Start your freelancing journey with KickAir" : "Find and hire top talent in Cambodia"}
            </Typography>
          </Box>

          {/* Form */}
          <Box component='form' onSubmit={handleSubmit} sx={{ mt: 4 }}>
            {/* Error Alert */}
            {error && (
              <Alert severity='error' sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Full Name Input */}
            <Box sx={{ mb: 2.5 }}>
              <Typography
                component='label'
                htmlFor='fullName'
                variant='body2'
                sx={{ display: "block", mb: 1, color: "text.primary" }}>
                Full Name
              </Typography>
              <TextField
                id='fullName'
                type='text'
                placeholder='John Doe'
                value={formData.fullName}
                onChange={e => handleChange("fullName", e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <PersonOutline sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 48,
                    borderRadius: 3,
                    backgroundColor: "background.default",
                    "&:hover fieldset": {
                      borderColor: "divider",
                    },
                    "&.Mui-focused fieldset": {
                      borderWidth: 2,
                      borderColor: "primary.main",
                    },
                  },
                }}
              />
            </Box>

            {/* Email Input */}
            <Box sx={{ mb: 2.5 }}>
              <Typography
                component='label'
                htmlFor='email'
                variant='body2'
                sx={{ display: "block", mb: 1, color: "text.primary" }}>
                Email Address
              </Typography>
              <TextField
                id='email'
                type='email'
                placeholder='you@example.com'
                value={formData.email}
                onChange={e => handleChange("email", e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <MailOutline sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 48,
                    borderRadius: 3,
                    backgroundColor: "background.default",
                    "&:hover fieldset": {
                      borderColor: "divider",
                    },
                    "&.Mui-focused fieldset": {
                      borderWidth: 2,
                      borderColor: "primary.main",
                    },
                  },
                }}
              />
            </Box>

            {/* Phone Input */}
            <Box sx={{ mb: 2.5 }}>
              <Typography
                component='label'
                htmlFor='phone'
                variant='body2'
                sx={{ display: "block", mb: 1, color: "text.primary" }}>
                Phone Number
              </Typography>
              <TextField
                id='phone'
                type='tel'
                placeholder='123-456-7890'
                value={formData.phone}
                onChange={e => handleChange("phone", e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <PhoneOutlined sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 48,
                    borderRadius: 3,
                    backgroundColor: "background.default",
                    "&:hover fieldset": {
                      borderColor: "divider",
                    },
                    "&.Mui-focused fieldset": {
                      borderWidth: 2,
                      borderColor: "primary.main",
                    },
                  },
                }}
              />
            </Box>

            {/* Password Input */}
            <Box sx={{ mb: 2.5 }}>
              <Typography
                component='label'
                htmlFor='password'
                variant='body2'
                sx={{ display: "block", mb: 1, color: "text.primary" }}>
                Password
              </Typography>
              <TextField
                id='password'
                type='password'
                placeholder='Create a strong password'
                value={formData.password}
                onChange={e => handleChange("password", e.target.value)}
                fullWidth
                required
                inputProps={{ minLength: 8 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <LockOutlined sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 48,
                    borderRadius: 3,
                    backgroundColor: "background.default",
                    "&:hover fieldset": {
                      borderColor: "divider",
                    },
                    "&.Mui-focused fieldset": {
                      borderWidth: 2,
                      borderColor: "primary.main",
                    },
                  },
                }}
              />
            </Box>

            {/* Confirm Password Input */}
            <Box sx={{ mb: 2.5 }}>
              <Typography
                component='label'
                htmlFor='confirmPassword'
                variant='body2'
                sx={{ display: "block", mb: 1, color: "text.primary" }}>
                Confirm Password
              </Typography>
              <TextField
                id='confirmPassword'
                type='password'
                placeholder='Re-enter your password'
                value={formData.confirmPassword}
                onChange={e => handleChange("confirmPassword", e.target.value)}
                fullWidth
                required
                inputProps={{ minLength: 8 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <LockOutlined sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 48,
                    borderRadius: 3,
                    backgroundColor: "background.default",
                    "&:hover fieldset": {
                      borderColor: "divider",
                    },
                    "&.Mui-focused fieldset": {
                      borderWidth: 2,
                      borderColor: "primary.main",
                    },
                  },
                }}
              />
            </Box>

            {/* Submit Button */}
            <Button
              type='submit'
              variant='contained'
              fullWidth
              disabled={isLoading}
              sx={{
                height: 48,
                borderRadius: 3,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 500,
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                mt: 3,
                "&:hover": {
                  backgroundColor: "primary.dark",
                  opacity: 0.9,
                },
              }}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Divider */}
            <Box sx={{ position: "relative", my: 4 }}>
              <Divider />
              <Typography
                variant='body2'
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  px: 2,
                  backgroundColor: "background.paper",
                  color: "text.secondary",
                }}>
                Already have an account?
              </Typography>
            </Box>

            {/* Login Link */}
            <Button
              type='button'
              variant='outlined'
              fullWidth
              //   onClick={() => onNavigate("login")}
              sx={{
                height: 48,
                borderRadius: 3,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 500,
                borderColor: "divider",
                color: "text.primary",
                "&:hover": {
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                },
              }}>
              Sign In Instead
            </Button>
          </Box>
        </Paper>

        {/* Footer Note */}
        <Typography
          variant='caption'
          sx={{
            display: "block",
            textAlign: "center",
            color: "text.secondary",
            mt: 4,
          }}>
          By creating an account, you agree to KickAir&apos;s Terms of Service and Privacy Policy
        </Typography>
      </Box>
    </Box>
  );
}
