"use client";

import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { C } from "./tokens";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onUnavailable: () => void;
}

/**
 * Live selfie capture via getUserMedia. Streams the front camera into a mirrored
 * viewport with a face-oval guide; the shutter snapshots a square JPEG File. If the
 * camera can't be accessed (denied / no device / insecure context) it calls
 * onUnavailable so the caller can offer an upload fallback.
 */
export default function CameraCapture({ onCapture, onUnavailable }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    const stop = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        onUnavailable();
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.muted = true;
          video.playsInline = true;
          await video.play().catch(() => {});
        }
      } catch {
        if (!cancelled) onUnavailable();
      }
    }

    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [onUnavailable]);

  const shoot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const size = Math.min(video.videoWidth, video.videoHeight);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    // Mirror so the saved image matches the on-screen (selfie) preview.
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        onCapture(new File([blob], "selfie.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  };

  return (
    <Box>
      <Box sx={{ position: "relative", width: "100%", aspectRatio: "1 / 1", bgcolor: "#0b1220", borderRadius: 3, overflow: "hidden" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
        />
        {/* face-oval guide */}
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box sx={{ width: "66%", aspectRatio: "0.8 / 1", borderRadius: "50%", border: "2.5px dashed rgba(255,255,255,.85)", boxShadow: "0 0 0 1000px rgba(8,12,22,.46)" }} />
        </Box>
        {/* LIVE chip */}
        <Box sx={{ position: "absolute", top: 12, left: 12, display: "inline-flex", alignItems: "center", gap: 0.6, height: 22, px: 1.1, borderRadius: 1.75, bgcolor: "rgba(220,38,38,.92)", color: "#fff", fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em" }}>
          <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#fff" }} />
          LIVE
        </Box>
        {/* instruction */}
        <Box sx={{ position: "absolute", top: 12, left: 0, right: 0, display: "flex", justifyContent: "center", px: 2 }}>
          <Typography sx={{ maxWidth: 260, textAlign: "center", color: "#fff", fontSize: 13.5, fontWeight: 500, bgcolor: "rgba(8,12,22,.62)", px: 1.75, py: 0.9, borderRadius: 999, lineHeight: 1.35 }}>
            Center your face in the oval, then capture
          </Typography>
        </Box>
      </Box>
      {/* shutter */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Box
          component="button"
          onClick={shoot}
          aria-label="Capture photo"
          sx={{ width: 72, height: 72, borderRadius: "50%", border: "4px solid #cbd5e1", bgcolor: "#fff", p: 0.6, cursor: "pointer", transition: "border-color .15s", "&:hover": { borderColor: C.accent } }}
        >
          <Box sx={{ width: "100%", height: "100%", borderRadius: "50%", bgcolor: C.accent }} />
        </Box>
      </Box>
    </Box>
  );
}
