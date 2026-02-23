"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Typography, TextField, Button, Divider, InputAdornment, Alert } from "@mui/material";
import { PersonOutline, LockOutlined, ArrowBack } from "@mui/icons-material";
import { useAuth } from "@/components/context/AuthContext";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      // On successful login, navigate to home or dashboard
      console.log("Login successful");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleCreateAccount = () => {
    router.push("/auth/sign-up"); // Change to your signup route
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 3, sm: 6 },
      }}>
      <Box sx={{ width: "100%", maxWidth: 448 }}>
        {/* Back Button */}
        <Button
          onClick={handleBackToHome}
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
          <Typography variant='body2'>Back to Home</Typography>
        </Button>

        {/* Login Card */}
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
              Welcome Back
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Sign in to continue to KickAir
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity='error' onClose={() => setError("")} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component='form' onSubmit={handleSubmit} sx={{ mt: 4 }}>
            {/* Email Input */}
            <Box sx={{ mb: 3 }}>
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
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                required
                disabled={isLoading}
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

            {/* Password Input */}
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

            {/* Forgot Password */}
            <Box sx={{ textAlign: "right", mb: 3 }}>
              <Button
                type='button'
                onClick={() => router.push("/forgot-password")}
                sx={{
                  textTransform: "none",
                  fontSize: "0.875rem",
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: "transparent",
                    textDecoration: "underline",
                  },
                }}>
                Forgot password?
              </Button>
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
                "&:hover": {
                  backgroundColor: "primary.dark",
                  opacity: 0.9,
                },
                "&:disabled": {
                  backgroundColor: "action.disabledBackground",
                  color: "action.disabled",
                },
                mb: 3,
              }}>
              {isLoading ? "Signing in..." : "Sign In"}
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
                New to KickAir?
              </Typography>
            </Box>

            {/* Sign Up Link */}
            <Button
              type='button'
              variant='outlined'
              fullWidth
              onClick={handleCreateAccount}
              disabled={isLoading}
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
              Create an Account
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
          By continuing, you agree to KickAir&apos;s Terms of Service and Privacy Policy
        </Typography>
      </Box>
    </Box>
  );
}
