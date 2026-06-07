"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { CloudUploadOutlined, Close, InsertDriveFileOutlined } from "@mui/icons-material";
import { FieldShell } from "./FieldShell";
import { tokens } from "./tokens";

export interface FileUploadProps {
  label?: string;
  helper?: string;
  error?: string | boolean;
  required?: boolean;
  onFiles?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  hint?: string;
}

interface Item {
  file: File;
  url?: string;
}

const formatSize = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`);

export default function FileUpload({ label, helper, error, required, onFiles, accept, multiple, hint = "PNG, JPG or PDF · up to 10 MB" }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [over, setOver] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  // Revoke any object URLs on unmount (removal/replacement revoke explicitly below).
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;
  useEffect(() => () => { itemsRef.current.forEach((i) => i.url && URL.revokeObjectURL(i.url)); }, []);

  const addFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    const incoming: Item[] = Array.from(files).map((f) => ({ file: f, url: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined }));
    if (!multiple) items.forEach((i) => i.url && URL.revokeObjectURL(i.url));
    const next = multiple ? [...items, ...incoming] : incoming.slice(0, 1);
    setItems(next);
    onFiles?.(next.map((i) => i.file));
  };

  const remove = (idx: number) => {
    const target = items[idx];
    if (target?.url) URL.revokeObjectURL(target.url);
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    onFiles?.(next.map((i) => i.file));
  };

  return (
    <FieldShell label={label} required={required} helper={helper} error={error} fullWidth>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}
        sx={{
          border: `1.5px dashed ${over ? tokens.accent : error ? tokens.error : tokens.borderStrong}`,
          borderRadius: "12px",
          background: over ? "rgba(0,113,227,0.05)" : "#fff",
          p: "30px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color .15s, background .15s",
          "&:hover": { borderColor: tokens.accent },
        }}>
        <Box sx={{ display: "flex", justifyContent: "center", color: over ? tokens.accent : tokens.muted, mb: 1.25 }}>
          <CloudUploadOutlined sx={{ fontSize: 26 }} />
        </Box>
        <Typography sx={{ fontSize: 14.5, fontWeight: 500, color: tokens.heading, mb: 0.5 }}>
          {over ? "Drop to upload" : <>Drag files here or <Box component="span" sx={{ color: tokens.accent }}>browse</Box></>}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: tokens.muted }}>{hint}</Typography>
      </Box>

      {items.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mt: 1.5 }}>
          {items.map((it, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: "11px 13px", border: `1px solid ${tokens.border}`, borderRadius: "10px", background: "#fff" }}>
              {it.url ? (
                <Box component="img" src={it.url} alt={it.file.name} sx={{ width: 40, height: 40, borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <Box sx={{ width: 40, height: 40, borderRadius: "8px", background: tokens.fill, display: "flex", alignItems: "center", justifyContent: "center", color: tokens.muted, flexShrink: 0 }}>
                  <InsertDriveFileOutlined fontSize="small" />
                </Box>
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: tokens.heading, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.file.name}</Typography>
                <Typography sx={{ fontSize: 12.5, color: tokens.muted }}>{formatSize(it.file.size)}</Typography>
              </Box>
              <IconButton size="small" onClick={() => remove(i)} aria-label="Remove file" sx={{ color: tokens.muted }}><Close fontSize="small" /></IconButton>
            </Box>
          ))}
        </Box>
      )}
    </FieldShell>
  );
}
