"use client";

import { Box, TextField, Typography, TextFieldProps } from "@mui/material";

type AdminInputProps = TextFieldProps & {
  label?: string;
  helperText?: string;
};

export default function AdminInput({ label, helperText, sx, ...props }: AdminInputProps) {
  return (
    <Box sx={{ width: props.fullWidth ? "100%" : "auto" }}>
      {label && (
        <Typography
          component="label"
          variant="body2"
          fontWeight={500}
          color="grey.700"
          display="block"
          mb={0.75}
        >
          {label}
        </Typography>
      )}
      <TextField
        {...props}
        label={undefined}
        sx={{
          width: "100%",
          "& .MuiOutlinedInput-root": {
            bgcolor: "white",
            borderRadius: 1.5,
            "& fieldset": { borderColor: "grey.300" },
            "&:hover fieldset": { borderColor: "grey.400" },
            "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: "2px" },
          },
          "& .MuiInputBase-input": {
            py: 1.25,
            px: 1.75,
            fontSize: 14,
          },
          "& .MuiSelect-select": {
            py: 1.25,
            px: 1.75,
            fontSize: 14,
          },
          ...sx,
        }}
      />
      {helperText && (
        <Typography variant="caption" color="grey.500" display="block" mt={0.5}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
