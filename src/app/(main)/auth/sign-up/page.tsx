"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Box, Paper, Typography, TextField, Button, Divider, InputAdornment, Grid, Alert, Tabs, Tab } from "@mui/material";
import { useAuth } from "@/components/context/AuthContext";
import { PersonOutline, MailOutline, LockOutlined, ArrowBack, PhoneOutlined, MarkEmailUnread } from "@mui/icons-material";

type UserType = "client" | "freelancer";
type AuthMethod = "email" | "phone";
type Step = 1 | 2 | 3;

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

export default function SignUpPage() {
  const router = useRouter();
  const { registerEmail, registerPhone, resendVerification } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMethodChange = (_: React.SyntheticEvent, value: AuthMethod) => {
    setAuthMethod(value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      if (authMethod === "email") {
        await registerEmail({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          is_client: userType === "client",
          is_freelancer: userType === "freelancer",
        });
        // Show inline "check your email" screen — wall in AuthContext takes over
        // but we also show step 4 as a local confirmation before the wall kicks in
        setStep(3);
      } else {
        await registerPhone({
          name: formData.fullName,
          telephone: formData.phone,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          is_client: userType === "client",
          is_freelancer: userType === "freelancer",
        });
        router.push(userType === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendError("");
    setResendSuccess(false);
    try {
      await resendVerification();
      setResendSuccess(true);
    } catch {
      setResendError("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const selectionCardSx = {
    borderRadius: 6,
    border: 2,
    borderColor: "divider",
    p: { xs: 4, md: 6 },
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": { borderColor: "primary.main", boxShadow: 3 },
  };

  // ─── Step 1: Client vs Freelancer ────────────────────────────────────────────
  if (step === 1) {
    return (
      <Box
        sx={{
          bgcolor: "#F5F5F7",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, sm: 6 },
        }}>
        <Box sx={{ width: "100%", maxWidth: 1024 }}>
          <Link href='/auth/sign-in' style={{ textDecoration: "none" }}>
            <Button
              startIcon={<ArrowBack />}
              sx={{
                color: "text.secondary",
                textTransform: "none",
                mb: 4,
                "&:hover": { color: "text.primary", backgroundColor: "transparent" },
              }}>
              <Typography variant='body2'>Back to Sign In</Typography>
            </Button>
          </Link>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              component='h1'
              sx={{ mb: 1, fontWeight: "bold", color: "text.primary", fontSize: { xs: "1.875rem", md: "2.25rem" } }}>
              Join as a client or freelancer
            </Typography>
            <Typography variant='body1' color='text.secondary' mb={4}>
              Choose how you want to use KickAir
            </Typography>

            <Grid container spacing={3} sx={{ maxWidth: 768, mx: "auto", mb: 4 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  onClick={() => {
                    setUserType("client");
                    setStep(2);
                  }}
                  sx={selectionCardSx}>
                  <Typography variant='h6' sx={{ mb: 1, color: "text.primary" }}>
                    I&apos;m a client
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Find talented freelancers for your next project
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  onClick={() => {
                    setUserType("freelancer");
                    setStep(2);
                  }}
                  sx={selectionCardSx}>
                  <Typography variant='h6' sx={{ mb: 1, color: "text.primary" }}>
                    I&apos;m a freelancer
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Showcase your skills and get hired for amazing projects
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography color='text.secondary'>
              Already have an account?{" "}
              <Link href='/auth/sign-in' style={{ textDecoration: "none" }}>
                <Button
                  sx={{
                    textTransform: "none",
                    fontSize: "1rem",
                    p: 0,
                    minWidth: "auto",
                    verticalAlign: "baseline",
                    fontWeight: "bold",
                    color: "black",
                    "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                  }}>
                  Sign In
                </Button>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // ─── Step 3: Email pending (shown briefly before AuthContext wall takes over) ─
  if (step === 3) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, sm: 6 },
          bgcolor: "background.default",
        }}>
        <Box sx={{ width: "100%", maxWidth: 448, textAlign: "center" }}>
          <Paper elevation={0} sx={{ borderRadius: 6, border: 1, borderColor: "divider", p: { xs: 4, md: 6 } }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}>
              <MarkEmailUnread sx={{ fontSize: 36, color: "primary.contrastText" }} />
            </Box>
            <Typography variant='h5' fontWeight={600} mb={1}>
              Check your inbox
            </Typography>
            <Typography variant='body1' color='text.secondary' mb={1}>
              We sent a verification link to
            </Typography>
            <Typography variant='body1' fontWeight={600} color='text.primary' mb={3}>
              {formData.email}
            </Typography>
            <Typography variant='body2' color='text.secondary' mb={4}>
              Click the link in the email to activate your account. Check your spam folder if you don&apos;t see it.
            </Typography>

            {resendSuccess && (
              <Alert severity='success' sx={{ mb: 3, borderRadius: 2 }}>
                Verification email resent!
              </Alert>
            )}
            {resendError && (
              <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>
                {resendError}
              </Alert>
            )}

            <Button
              variant='contained'
              fullWidth
              onClick={handleResend}
              disabled={resending || resendSuccess}
              sx={{ height: 48, borderRadius: 3, textTransform: "none", fontWeight: 500, mb: 2 }}>
              {resending ? "Sending..." : resendSuccess ? "Email sent" : "Resend verification email"}
            </Button>

            <Link href='/auth/sign-in' style={{ textDecoration: "none" }}>
              <Button
                variant='text'
                fullWidth
                sx={{
                  height: 44,
                  borderRadius: 3,
                  textTransform: "none",
                  color: "text.secondary",
                  "&:hover": { color: "text.primary", bgcolor: "action.hover" },
                }}>
                Back to Sign In
              </Button>
            </Link>
          </Paper>
        </Box>
      </Box>
    );
  }

  // ─── Step 2: Registration form ────────────────────────────────────────────────
  return (
    <Box
      sx={{
        bgcolor: "#F5F5F7",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 3, sm: 6 },
      }}>
      <Box sx={{ width: "100%", maxWidth: 448 }}>
        <Button
          onClick={() => setStep(1)}
          startIcon={<ArrowBack />}
          sx={{
            color: "text.secondary",
            textTransform: "none",
            mb: 1,
            "&:hover": { color: "text.primary", backgroundColor: "transparent" },
          }}>
          <Typography variant='body2'>Back</Typography>
        </Button>

        <Paper elevation={0} sx={{ borderRadius: 6, border: 1, borderColor: "divider", p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 1 }}>
            <Typography variant='h4' component='h1' sx={{ fontWeight: "bold", mb: 1, color: "text.primary" }}>
              {userType === "freelancer" ? "Create Freelancer Account" : "Create Client Account"}
            </Typography>
          </Box>

          <Tabs
            value={authMethod}
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

          <Box component='form' onSubmit={handleSubmit}>
            {error && (
              <Alert severity='error' sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Full Name */}
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
                sx={inputSx}
              />
            </Box>

            {/* Email (email method only) */}
            {authMethod === "email" && (
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
                  sx={inputSx}
                />
              </Box>
            )}

            {/* Phone (phone method only) */}
            {authMethod === "phone" && (
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
                  placeholder='012 345 678'
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
                  sx={inputSx}
                />
              </Box>
            )}

            {/* Password */}
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
                sx={inputSx}
              />
            </Box>

            {/* Confirm Password */}
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
                mt: 3,
                color: "white",
                "&:hover": { backgroundColor: "primary.dark" },
              }}>
              {isLoading ? "Creating Account..." : "Create Account"}
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
                Already have an account?
              </Typography>
            </Box>

            <Link href='/auth/sign-in' style={{ textDecoration: "none" }}>
              <Button
                type='button'
                variant='outlined'
                fullWidth
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
                Sign In Instead
              </Button>
            </Link>
          </Box>
        </Paper>

        <Typography variant='caption' sx={{ display: "block", textAlign: "center", color: "text.secondary", mt: 1 }}>
          By creating an account, you agree to KickAir&apos;s Terms of Service and Privacy Policy
        </Typography>
      </Box>
    </Box>
  );
}
