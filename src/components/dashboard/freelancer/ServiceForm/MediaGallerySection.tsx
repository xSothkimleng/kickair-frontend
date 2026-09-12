"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CloudUpload, FileText, Image as ImageIcon, Star, Video, X } from "lucide-react";
import { css, cva, cx } from "styled-system/css";
import { Spinner } from "@/components/ds";
import { ServiceMedia, TemporaryUpload } from "@/types/service";
import { api } from "@/lib/api";

// File validation constants
const FILE_LIMITS = {
  image: { extensions: ["jpg", "jpeg", "png", "gif", "webp"], maxSizeMB: 5 },
  video: { extensions: ["mp4", "webm"], maxSizeMB: 50 },
  pdf: { extensions: ["pdf"], maxSizeMB: 10 },
};

const MAX_FILES_PER_SERVICE = 10;

const ACCEPTED_EXTENSIONS = [
  ...FILE_LIMITS.image.extensions,
  ...FILE_LIMITS.video.extensions,
  ...FILE_LIMITS.pdf.extensions,
];

const sectionCard = css({
  bg: "surface",
  borderRadius: "card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  p: "32px",
});
const sectionTitle = css({ lineHeight: 1.5, fontSize: "17px", fontWeight: 600, color: "ink" });
const requiredMark = css({ color: "#ef4444" });
const sectionSub = css({ lineHeight: 1.5, fontSize: "11px", color: "ink2" });
const errorText = css({ lineHeight: 1.5, fontSize: "12px", color: "#ef4444" });
const hiddenInput = css({ display: "none" });
const mediaGrid = css({
  display: "grid",
  gridTemplateColumns: { base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
  gap: "16px",
});
const mediaTile = cva({
  base: {
    position: "relative",
    aspectRatio: "1",
    bg: "rgba(0, 0, 0, 0.05)",
    borderRadius: "cardSm",
    overflow: "hidden",
    borderWidth: "2px",
    borderStyle: "solid",
    boxSizing: "border-box",
    _hover: { "& .delete-btn": { opacity: 1 }, "& .cover-btn": { opacity: 1 } },
  },
  variants: {
    cover: { true: { borderColor: "accent" }, false: { borderColor: "transparent" } },
  },
});
const filePreview = css({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bg: "rgba(0, 0, 0, 0.1)",
  color: "rgba(0, 0, 0, 0.4)",
});
const pdfPreview = css({ flexDirection: "column" });
const pdfName = css({ lineHeight: 1.5,
  fontSize: "9px",
  color: "rgba(0, 0, 0, 0.5)",
  px: "8px",
  textAlign: "center",
  maxW: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
const coverBadge = css({
  position: "absolute",
  bottom: "6px",
  left: "6px",
  px: "6px",
  py: "2px",
  bg: "accent",
  color: "white",
  fontSize: "9px",
  fontWeight: 600,
  borderRadius: "4px",
  pointerEvents: "none",
});
const coverSpinnerBox = css({
  position: "absolute",
  top: "6px",
  left: "6px",
  width: "26px",
  height: "26px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
});
const iconBtnBase = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  m: 0,
  border: "none",
  borderRadius: "pill",
  fontFamily: "inherit",
  cursor: "pointer",
  _disabled: { pointerEvents: "none", opacity: 0.5 },
  "& svg": { display: "block" },
});
const coverBtn = cva({
  base: {
    top: "6px",
    left: "6px",
    p: "4px",
    bg: "rgba(0,0,0,0.5)",
    transition: "opacity 0.2s",
    _hover: { bg: "rgba(0,0,0,0.7)" },
  },
  variants: {
    active: { true: { color: "#facc15", opacity: 1 }, false: { color: "white", opacity: 0 } },
  },
});
const deleteBtn = css({
  top: "8px",
  right: "8px",
  p: "6px",
  bg: "#ef4444",
  color: "white",
  opacity: 0,
  transition: "opacity 0.3s",
  _hover: { bg: "#dc2626" },
});
const deletingOverlay = css({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bg: "rgba(0, 0, 0, 0.3)",
  color: "white",
});
const uploadBtn = css({
  aspectRatio: "1",
  width: "100%",
  boxSizing: "border-box",
  m: 0,
  p: "6px 8px",
  bg: "rgba(0, 0, 0, 0.05)",
  borderRadius: "cardSm",
  border: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "inherit",
  color: "ink",
  cursor: "pointer",
  transition: "background-color .25s",
  _hover: { bg: "rgba(0, 0, 0, 0.08)" },
  _disabled: { bg: "rgba(0, 0, 0, 0.05)", pointerEvents: "none" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const uploadDimmed = css({ opacity: 0.5 });
const uploadIcon = css({ display: "inline-block", color: "rgba(0, 0, 0, 0.4)", mb: "8px" });
const uploadLabel = css({ lineHeight: 1.5, fontSize: "11px", color: "ink2" });
const uploadHint = css({ lineHeight: 1.5, fontSize: "10px", color: "ink3" });
const limitsRow = css({
  display: "flex",
  alignItems: "center",
  gap: "16px",
  mt: "16px",
  fontSize: "11px",
  color: "ink2",
});
const limitItem = css({ display: "flex", alignItems: "center", gap: "4px" });
const limitText = css({ lineHeight: 1.5, fontSize: "11px" });
/* The old `ml: auto` sat on a <p>, where the unlayered `p { margin: 0 }` killed it — dropped. */
const filesCount = css({ lineHeight: 1.5, fontSize: "11px" });

interface MediaGallerySectionProps {
  serviceId: number | null;
  media: ServiceMedia[];
  onMediaChange: (media: ServiceMedia[]) => void;
  // For new services (upload-before-create flow)
  uploadToken: string | null;
  tempUploads: TemporaryUpload[];
  onTempUploadsChange: (uploads: TemporaryUpload[]) => void;
  featureImageId: number | null;
  onFeatureImageChange: (id: number | null) => void;
  // For new services: local-only selection applied after creation
  desiredCoverTempId: number | null;
  onDesiredCoverTempIdChange: (id: number | null) => void;
  disabled?: boolean;
}

export default function MediaGallerySection({
  serviceId,
  media,
  onMediaChange,
  uploadToken,
  tempUploads,
  onTempUploadsChange,
  featureImageId,
  onFeatureImageChange,
  desiredCoverTempId,
  onDesiredCoverTempIdChange,
  disabled,
}: MediaGallerySectionProps) {
  // Determine which mode we're in
  const isEditingExistingService = !!serviceId;
  const canUpload = isEditingExistingService || !!uploadToken;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingCoverId, setSettingCoverId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getFileType = (fileName: string): "image" | "video" | "pdf" | null => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (!ext) return null;

    if (FILE_LIMITS.image.extensions.includes(ext)) return "image";
    if (FILE_LIMITS.video.extensions.includes(ext)) return "video";
    if (FILE_LIMITS.pdf.extensions.includes(ext)) return "pdf";
    return null;
  };

  // Get combined count of all uploads (existing media + temp uploads)
  const totalUploads = media.length + tempUploads.length;

  const validateFile = (file: File): string | null => {
    const fileType = getFileType(file.name);
    if (!fileType) {
      return `Invalid file type. Accepted: ${ACCEPTED_EXTENSIONS.join(", ")}`;
    }

    const maxSizeMB = FILE_LIMITS[fileType].maxSizeMB;
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > maxSizeMB) {
      return `File too large. Max size for ${fileType}: ${maxSizeMB}MB`;
    }

    if (totalUploads >= MAX_FILES_PER_SERVICE) {
      return `Maximum ${MAX_FILES_PER_SERVICE} files allowed per service`;
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploading(true);
      setError(null);

      if (isEditingExistingService) {
        // Existing service: upload directly to service media endpoint
        const response = await api.uploadFile(`/api/services/${serviceId}/media`, file);
        const newMedia: ServiceMedia = response.data;
        onMediaChange([...media, newMedia]);
      } else if (uploadToken) {
        // New service: upload to temporary uploads with token
        const response = await api.uploadFormData("/api/temporary-uploads", file, {
          upload_token: uploadToken,
        });
        const newTempUpload: TemporaryUpload = response.data;
        onTempUploadsChange([...tempUploads, newTempUpload]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // Delete existing service media
  const handleDeleteMedia = async (mediaId: number) => {
    if (!serviceId) return;

    try {
      setDeletingId(mediaId);
      setError(null);

      await api.delete(`/api/services/${serviceId}/media/${mediaId}`);

      onMediaChange(media.filter(m => m.id !== mediaId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  };

  // Delete temporary upload
  const handleDeleteTempUpload = async (tempUploadId: number) => {
    try {
      setDeletingId(tempUploadId);
      setError(null);

      await api.delete(`/api/temporary-uploads/${tempUploadId}`);

      onTempUploadsChange(tempUploads.filter(t => t.id !== tempUploadId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  };

  // Set or clear the feature (cover) image
  const handleSetCover = async (mediaId: number) => {
    if (!serviceId) return;
    const newId = featureImageId === mediaId ? null : mediaId;

    try {
      setSettingCoverId(mediaId);
      setError(null);
      await api.put(`/api/services/${serviceId}`, { feature_image_id: newId });
      onFeatureImageChange(newId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cover image");
    } finally {
      setSettingCoverId(null);
    }
  };

  const handleUploadClick = () => {
    if (!canUpload) {
      setError("Upload not available. Please try again.");
      return;
    }
    fileInputRef.current?.click();
  };

  // Generic preview renderer that works for both ServiceMedia and TemporaryUpload
  const renderPreview = (item: { id: number; file_type: string; file_url: string; file_name: string }) => {
    const isDeleting = deletingId === item.id;

    if (item.file_type === "video") {
      return (
        <div className={filePreview}>
          <Video size={32} />
        </div>
      );
    }

    if (item.file_type === "pdf") {
      return (
        <div className={cx(filePreview, pdfPreview)}>
          <FileText size={32} />
          <p className={pdfName}>
            {item.file_name}
          </p>
        </div>
      );
    }

    return (
      <Image
        unoptimized={true}
        src={item.file_url}
        alt={item.file_name}
        fill
        sizes="(max-width: 600px) 50vw, 25vw"
        style={{ objectFit: "cover", opacity: isDeleting ? 0.5 : 1 }}
      />
    );
  };

  // Render a media item card with delete button (and optional cover controls for images)
  const renderMediaCard = (
    item: { id: number; file_type: string; file_url: string; file_name: string },
    onDelete: (id: number) => void,
    keyPrefix: string,
    coverConfig?: { isCover: boolean; isSettingCover: boolean; onToggle: () => void }
  ) => {
    const isCover = coverConfig?.isCover ?? false;
    const isSettingCover = coverConfig?.isSettingCover ?? false;

    return (
      <div className={mediaTile({ cover: isCover })} key={`${keyPrefix}-${item.id}`}>
        {renderPreview(item)}

        {/* Cover badge */}
        {isCover && (
          <div className={coverBadge}>
            COVER
          </div>
        )}

        {/* Cover toggle button */}
        {coverConfig && (
          isSettingCover ? (
            <div className={coverSpinnerBox}>
              <Spinner size={14} />
            </div>
          ) : (
            <button
              type="button"
              className={cx("cover-btn", iconBtnBase, coverBtn({ active: isCover }))}
              onClick={() => coverConfig.onToggle()}
              disabled={disabled}
              title={isCover ? "Remove cover" : "Set as cover"}
              aria-label={isCover ? "Remove cover" : "Set as cover"}>
              {isCover
                ? <Star size={14} fill="currentColor" />
                : <Star size={14} />
              }
            </button>
          )
        )}

        {/* Delete button */}
        {deletingId === item.id ? (
          <div className={deletingOverlay}>
            <Spinner size={24} />
          </div>
        ) : (
          <button
            type="button"
            className={cx("delete-btn", iconBtnBase, deleteBtn)}
            onClick={() => onDelete(item.id)}
            disabled={disabled}
            aria-label="Remove file">
            <X size={12} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={sectionCard}>
      <p className={sectionTitle}>
        Gallery / Media <span className={requiredMark}>*</span>
      </p>
      <p className={sectionSub}>
        Upload images, videos, or PDFs to showcase your work — at least one image is required to publish
      </p>

      {error && (
        <p className={errorText}>
          {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.map(ext => `.${ext}`).join(",")}
        onChange={handleFileSelect}
        className={hiddenInput}
      />

      <div className={mediaGrid}>
        {/* Render existing service media (for editing) */}
        {media.map(mediaItem =>
          renderMediaCard(
            mediaItem,
            handleDeleteMedia,
            "media",
            isEditingExistingService && mediaItem.file_type === "image"
              ? {
                  isCover: featureImageId === mediaItem.id,
                  isSettingCover: settingCoverId === mediaItem.id,
                  onToggle: () => handleSetCover(mediaItem.id),
                }
              : undefined
          )
        )}

        {/* Render temporary uploads (for new services) */}
        {tempUploads.map(tempItem =>
          renderMediaCard(
            tempItem,
            handleDeleteTempUpload,
            "temp",
            tempItem.file_type === "image"
              ? {
                  isCover: desiredCoverTempId === tempItem.id,
                  isSettingCover: false,
                  onToggle: () =>
                    onDesiredCoverTempIdChange(desiredCoverTempId === tempItem.id ? null : tempItem.id),
                }
              : undefined
          )
        )}

        {/* Upload button */}
        <div>
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={disabled || uploading || !canUpload || totalUploads >= MAX_FILES_PER_SERVICE}
            className={cx(uploadBtn, !canUpload && uploadDimmed)}>
            {uploading ? (
              <Spinner size={24} className={css({ color: "rgba(0, 0, 0, 0.4)" })} />
            ) : (
              <>
                <CloudUpload size={24} className={uploadIcon} />
                <p className={uploadLabel}>Upload Media</p>
                <p className={uploadHint}>Image, Video, PDF</p>
              </>
            )}
          </button>
        </div>
      </div>

      <div className={limitsRow}>
        <div className={limitItem}>
          <ImageIcon size={14} />
          <p className={limitText}>Images (5MB)</p>
        </div>
        <div className={limitItem}>
          <Video size={14} />
          <p className={limitText}>Videos (50MB)</p>
        </div>
        <div className={limitItem}>
          <FileText size={14} />
          <p className={limitText}>PDFs (10MB)</p>
        </div>
        <p className={filesCount}>
          {totalUploads}/{MAX_FILES_PER_SERVICE} files
        </p>
      </div>
    </div>
  );
}
