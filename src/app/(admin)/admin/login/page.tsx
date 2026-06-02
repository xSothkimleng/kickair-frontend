"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Typography, TextField, Button, InputAdornment, Alert } from "@mui/material";
import { LockOutlined, MailOutline, AdminPanelSettingsOutlined } from "@mui/icons-material";
import { useAuth } from "@/components/context/AuthContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { loginEmail, logout } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const loggedInUser = await loginEmail(email, password);

      if (!loggedInUser.is_admin) {
        // A valid non-admin account — don't leave them authenticated here.
        await logout();
        setError("This account doesn't have admin access.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputSx = (theme: { palette: { background: { default: string }; text: { primary: string } } }) => ({
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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.50",
        px: { xs: 3, sm: 6 },
      }}>
      <Box sx={{ width: "100%", maxWidth: 420 }}>
        <Paper elevation={0} sx={{ borderRadius: 6, border: 1, borderColor: "divider", p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "primary.50",
                color: "primary.main",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}>
              <AdminPanelSettingsOutlined sx={{ fontSize: 30 }} />
            </Box>
            <Typography variant='h5' component='h1' sx={{ fontWeight: "bold", mb: 0.5, color: "text.primary" }}>
              Admin Sign In
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              KickAir administration panel
            </Typography>
          </Box>

          {error && (
            <Alert severity='error' onClose={() => setError("")} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component='form' onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography
                component='label'
                htmlFor='admin-email'
                variant='body2'
                sx={{ display: "block", mb: 1, color: "text.primary" }}>
                Email Address
              </Typography>
              <TextField
                id='admin-email'
                type='email'
                placeholder='admin@kickair.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                required
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <MailOutline sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                component='label'
                htmlFor='admin-password'
                variant='body2'
                sx={{ display: "block", mb: 1, color: "text.primary" }}>
                Password
              </Typography>
              <TextField
                id='admin-password'
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
                color: "common.white",
              }}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>
        </Paper>

        <Typography variant='caption' sx={{ display: "block", textAlign: "center", color: "text.secondary", mt: 3 }}>
          Authorized personnel only
        </Typography>
      </Box>
    </Box>
  );
}
