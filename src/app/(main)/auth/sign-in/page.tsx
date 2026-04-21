"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Typography, TextField, Button, Divider, InputAdornment, Alert, Tabs, Tab } from "@mui/material";
import { LockOutlined, ArrowBack, MailOutline, PhoneOutlined } from "@mui/icons-material";
import { useAuth } from "@/components/context/AuthContext";

export default function SignInPage() {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { loginEmail, loginPhone } = useAuth();
  const router = useRouter();

  const handleMethodChange = (_: React.SyntheticEvent, value: "email" | "phone") => {
    setMethod(value);
    setIdentifier("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const loggedInUser = method === "email"
        ? await loginEmail(identifier, password)
        : await loginPhone(identifier, password);

      let destination = "/explore-services";
      if (loggedInUser.is_admin) {
        destination = "/admin";
      } else if (loggedInUser.is_freelancer && !loggedInUser.is_client) {
        destination = "/dashboard/freelancer";
      }

      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputSx = (theme: any) => ({
    "& .MuiOutlinedInput-root": {
      height: 48,
      borderRadius: 3,
      backgroundColor: "background.default",
      "&:hover fieldset": { borderColor: "divider" },
      "&.Mui-focused fieldset": { borderWidth: 2, borderColor: "primary.main" },
    },
    "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus": {
      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.default} inset`,
      WebkitTextFillColor: theme.palette.text.primary,
      caretColor: theme.palette.text.primary,
    },
  });

  return (
    <Box
      sx={{
        minHeight: "95vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 3, sm: 6 },
      }}>
      <Box sx={{ width: "100%", maxWidth: 448 }}>
        <Button
          onClick={() => router.push("/")}
          startIcon={<ArrowBack />}
          sx={{
            color: "text.secondary",
            textTransform: "none",
            mb: 1,
            "&:hover": { color: "text.primary", backgroundColor: "transparent" },
          }}>
          <Typography variant='body2'>Back to Home</Typography>
        </Button>

        <Paper elevation={0} sx={{ borderRadius: 6, border: 1, borderColor: "divider", p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography variant='h4' component='h1' sx={{ fontWeight: "bold", mb: 1, color: "text.primary" }}>
              Welcome Back
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Sign in to continue to KickAir
            </Typography>
          </Box>

          {/* Method toggle */}
          <Tabs
            value={method}
            onChange={handleMethodChange}
            variant='fullWidth'
            sx={{
              mb: 3,
              "& .MuiTabs-indicator": { borderRadius: 2 },
              "& .MuiTab-root": { textTransform: "none", fontWeight: 500 },
            }}>
            <Tab value='email' label='Email' icon={<MailOutline fontSize='small' />} iconPosition='start' />
            <Tab value='phone' label='Phone' icon={<PhoneOutlined fontSize='small' />} iconPosition='start' />
          </Tabs>

          {error && (
            <Alert severity='error' onClose={() => setError("")} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component='form' onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography
                component='label'
                htmlFor='identifier'
                variant='body2'
                sx={{ display: "block", mb: 1, color: "text.primary" }}>
                {method === "email" ? "Email Address" : "Phone Number"}
              </Typography>
              <TextField
                id='identifier'
                type={method === "email" ? "email" : "tel"}
                placeholder={method === "email" ? "you@example.com" : "012 345 678"}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                fullWidth
                required
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      {method === "email" ? (
                        <MailOutline sx={{ color: "text.secondary" }} />
                      ) : (
                        <PhoneOutlined sx={{ color: "text.secondary" }} />
                      )}
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
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
                placeholder='Enter your password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                required
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <LockOutlined sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
            </Box>

            <Box sx={{ textAlign: "right", mb: 3 }}>
              <Button
                type='button'
                onClick={() => router.push("/forgot-password")}
                sx={{
                  textTransform: "none",
                  fontSize: "0.875rem",
                  color: "primary.main",
                  "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                }}>
                Forgot password?
              </Button>
            </Box>

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
                mb: 3,
                color: "common.white",
              }}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

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
                New to KickAir?
              </Typography>
            </Box>

            <Button
              type='button'
              variant='outlined'
              fullWidth
              onClick={() => router.push("/auth/sign-up")}
              disabled={isLoading}
              sx={{
                height: 48,
                borderRadius: 3,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 500,
                borderColor: "divider",
                color: "text.primary",
                "&:hover": { borderColor: "divider", backgroundColor: "action.hover" },
              }}>
              Create an Account
            </Button>
          </Box>
        </Paper>

        <Typography variant='caption' sx={{ display: "block", textAlign: "center", color: "text.secondary", mt: 4 }}>
          By continuing, you agree to KickAir&apos;s Terms of Service and Privacy Policy
        </Typography>
      </Box>
    </Box>
  );
}
