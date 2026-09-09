"use client";

import { useEffect, useRef, useState } from "react";
import { CloudUpload, FileText, X } from "lucide-react";
import { css } from "styled-system/css";
import { FieldShell } from "./FieldShell";
import { fieldIconButton } from "./field";

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

const dropzone = css({
  borderWidth: "1.5px",
  borderStyle: "dashed",
  borderColor: "borderStrong",
  borderRadius: "cardSm",
  bg: "field",
  p: "30px 24px",
  textAlign: "center",
  cursor: "pointer",
  transition: "border-color .15s, background-color .15s",
  _hover: { borderColor: "accent" },
  _focusVisible: { outline: "none", borderColor: "accent", boxShadow: "focusRing" },
  "&[data-invalid]": { borderColor: "error" },
  "&[data-over]": { borderColor: "accent", bg: "accentFill" },
});

const dropIcon = css({ display: "flex", justifyContent: "center", color: "muted", mb: "10px", "[data-over] &": { color: "accent" }, "& svg": { display: "block" } });
const dropTitle = css({ fontSize: "14.5px", fontWeight: 500, color: "heading", mb: "4px" });
const dropHint = css({ fontSize: "12.5px", color: "muted" });
const browse = css({ color: "accent" });

const list = css({ display: "flex", flexDirection: "column", gap: "10px", mt: "12px" });
const row = css({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  p: "11px 13px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  borderRadius: "input",
  bg: "field",
});
const thumbImg = css({ w: "40px", h: "40px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 });
const thumbFile = css({ w: "40px", h: "40px", borderRadius: "8px", bg: "fill", display: "flex", alignItems: "center", justifyContent: "center", color: "muted", flexShrink: 0 });
const meta = css({ flex: 1, minW: 0 });
const fileName = css({ fontSize: "14px", fontWeight: 500, color: "heading", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const fileSize = css({ fontSize: "12.5px", color: "muted" });

export default function FileUpload({ label, helper, error, required, onFiles, accept, multiple, hint = "PNG, JPG or PDF · up to 10 MB" }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [over, setOver] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  // Revoke any object URLs on unmount (removal/replacement revoke explicitly below).
  const itemsRef = useRef<Item[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);
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

  const browseFiles = () => inputRef.current?.click();

  return (
    <FieldShell label={label} required={required} helper={helper} error={error} fullWidth>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload files"
        className={dropzone}
        data-over={over ? "" : undefined}
        data-invalid={error ? "" : undefined}
        onClick={browseFiles}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); browseFiles(); } }}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}>
        <div className={dropIcon}><CloudUpload size={26} /></div>
        <div className={dropTitle}>
          {over ? "Drop to upload" : <>Drag files here or <span className={browse}>browse</span></>}
        </div>
        <div className={dropHint}>{hint}</div>
      </div>

      {items.length > 0 && (
        <div className={list}>
          {items.map((it, i) => (
            <div key={i} className={row}>
              {it.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                <img src={it.url} alt={it.file.name} className={thumbImg} />
              ) : (
                <div className={thumbFile}><FileText size={18} /></div>
              )}
              <div className={meta}>
                <div className={fileName}>{it.file.name}</div>
                <div className={fileSize}>{formatSize(it.file.size)}</div>
              </div>
              <button type="button" className={fieldIconButton} onClick={() => remove(i)} aria-label="Remove file"><X size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </FieldShell>
  );
}
