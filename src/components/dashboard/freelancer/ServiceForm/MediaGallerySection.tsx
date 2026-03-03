"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Box, Paper, Typography, Button, IconButton, Grid, CircularProgress } from "@mui/material";
import { CloudUploadOutlined, CloseOutlined, ImageOutlined, VideocamOutlined, InsertDriveFileOutlined, StarBorderOutlined, Star } from "@mui/icons-material";
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
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0, 0, 0, 0.1)",
          }}>
          <VideocamOutlined sx={{ fontSize: 32, color: "rgba(0, 0, 0, 0.4)" }} />
        </Box>
      );
    }

    if (item.file_type === "pdf") {
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0, 0, 0, 0.1)",
          }}>
          <InsertDriveFileOutlined sx={{ fontSize: 32, color: "rgba(0, 0, 0, 0.4)" }} />
          <Typography sx={{ fontSize: 9, color: "rgba(0, 0, 0, 0.5)", mt: 0.5, px: 1, textAlign: "center" }} noWrap>
            {item.file_name}
          </Typography>
        </Box>
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
      <Grid size={{ xs: 6, md: 3 }} key={`${keyPrefix}-${item.id}`}>
        <Box
          sx={{
            position: "relative",
            aspectRatio: "1",
            bgcolor: "rgba(0, 0, 0, 0.05)",
            borderRadius: 3,
            overflow: "hidden",
            border: isCover ? "2px solid #0071e3" : "2px solid transparent",
            "&:hover .delete-btn": { opacity: 1 },
            "&:hover .cover-btn": { opacity: 1 },
          }}>
          {renderPreview(item)}

          {/* Cover badge */}
          {isCover && (
            <Box
              sx={{
                position: "absolute",
                bottom: 6,
                left: 6,
                px: 0.75,
                py: 0.25,
                bgcolor: "#0071e3",
                color: "white",
                fontSize: 9,
                fontWeight: 600,
                borderRadius: 1,
                pointerEvents: "none",
              }}>
              COVER
            </Box>
          )}

          {/* Cover toggle button */}
          {coverConfig && (
            isSettingCover ? (
              <Box
                sx={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  width: 26,
                  height: 26,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <CircularProgress size={14} sx={{ color: "white" }} />
              </Box>
            ) : (
              <IconButton
                className="cover-btn"
                onClick={() => coverConfig.onToggle()}
                disabled={disabled}
                title={isCover ? "Remove cover" : "Set as cover"}
                sx={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  p: 0.5,
                  bgcolor: "rgba(0,0,0,0.5)",
                  color: isCover ? "#facc15" : "white",
                  opacity: isCover ? 1 : 0,
                  transition: "opacity 0.2s",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                }}>
                {isCover
                  ? <Star sx={{ fontSize: 14 }} />
                  : <StarBorderOutlined sx={{ fontSize: 14 }} />
                }
              </IconButton>
            )
          )}

          {/* Delete button */}
          {deletingId === item.id ? (
            <Box
              sx={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0, 0, 0, 0.3)",
              }}>
              <CircularProgress size={24} sx={{ color: "white" }} />
            </Box>
          ) : (
            <IconButton
              className="delete-btn"
              onClick={() => onDelete(item.id)}
              disabled={disabled}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                p: 0.75,
                bgcolor: "#ef4444",
                color: "white",
                opacity: 0,
                transition: "opacity 0.3s",
                "&:hover": { bgcolor: "#dc2626" },
              }}>
              <CloseOutlined sx={{ fontSize: 12 }} />
            </IconButton>
          )}
        </Box>
      </Grid>
    );
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
      <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 1 }}>Gallery / Media</Typography>
      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 3 }}>
        Upload images, videos, or PDFs to showcase your work
      </Typography>

      {error && (
        <Typography sx={{ fontSize: 12, color: "#ef4444", mb: 2 }}>
          {error}
        </Typography>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.map(ext => `.${ext}`).join(",")}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <Grid container spacing={2}>
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
        <Grid size={{ xs: 6, md: 3 }}>
          <Button
            onClick={handleUploadClick}
            disabled={disabled || uploading || !canUpload || totalUploads >= MAX_FILES_PER_SERVICE}
            sx={{
              aspectRatio: "1",
              width: "100%",
              bgcolor: "rgba(0, 0, 0, 0.05)",
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textTransform: "none",
              opacity: !canUpload ? 0.5 : 1,
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.08)",
              },
              "&.Mui-disabled": {
                bgcolor: "rgba(0, 0, 0, 0.05)",
              },
            }}>
            {uploading ? (
              <CircularProgress size={24} sx={{ color: "rgba(0, 0, 0, 0.4)" }} />
            ) : (
              <>
                <CloudUploadOutlined sx={{ fontSize: 24, color: "rgba(0, 0, 0, 0.4)", mb: 1 }} />
                <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>Upload Media</Typography>
                <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.4)", mt: 0.5 }}>Image, Video, PDF</Typography>
              </>
            )}
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2, fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ImageOutlined sx={{ fontSize: 14 }} />
          <Typography sx={{ fontSize: 11 }}>Images (5MB)</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <VideocamOutlined sx={{ fontSize: 14 }} />
          <Typography sx={{ fontSize: 11 }}>Videos (50MB)</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <InsertDriveFileOutlined sx={{ fontSize: 14 }} />
          <Typography sx={{ fontSize: 11 }}>PDFs (10MB)</Typography>
        </Box>
        <Typography sx={{ fontSize: 11, ml: "auto" }}>
          {totalUploads}/{MAX_FILES_PER_SERVICE} files
        </Typography>
      </Box>
    </Paper>
  );
}