"use client";

import { useEffect, useRef } from "react";
import { css } from "styled-system/css";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onUnavailable: () => void;
}

const viewportCss = css({ position: "relative", w: "100%", aspectRatio: "1 / 1", bg: "#0b1220", borderRadius: "12px", overflow: "hidden" });
const videoCss = css({ position: "absolute", inset: 0, w: "100%", h: "100%", objectFit: "cover", transform: "scaleX(-1)" });
const guideWrapCss = css({ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" });
const guideCss = css({ w: "66%", aspectRatio: "0.8 / 1", borderRadius: "50%", border: "2.5px dashed rgba(255,255,255,.85)", boxShadow: "0 0 0 1000px rgba(8,12,22,.46)" });
const liveChipCss = css({ position: "absolute", top: "12px", left: "12px", display: "inline-flex", alignItems: "center", gap: "4.8px", h: "22px", px: "8.8px", borderRadius: "7px", bg: "rgba(220,38,38,.92)", color: "#fff", textStyle: "micro", fontWeight: 700 });
const liveDotCss = css({ w: "6px", h: "6px", borderRadius: "50%", bg: "#fff" });
const instructionWrapCss = css({ position: "absolute", top: "12px", left: 0, right: 0, display: "flex", justifyContent: "center", px: "16px" });
// The pill's own `px`/`py` are dropped: globals.css's unlayered `p { padding: 0 }`
// outranks any layered rule, so they never applied here either.
const instructionCss = css({ maxW: "260px", textAlign: "center", color: "#fff", textStyle: "ui", fontWeight: 500, bg: "rgba(8,12,22,.62)", borderRadius: "999px" });
const shutterWrapCss = css({ display: "flex", justifyContent: "center", mt: "16px" });
const shutterCss = css({ w: "72px", h: "72px", boxSizing: "border-box", borderRadius: "50%", border: "4px solid #cbd5e1", bg: "#fff", p: "4.8px", cursor: "pointer", transition: "border-color .15s", _hover: { borderColor: "accent" } });
const shutterInnerCss = css({ w: "100%", h: "100%", borderRadius: "50%", bg: "accent" });

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
    <div>
      <div className={viewportCss}>
        <video ref={videoRef} autoPlay playsInline muted className={videoCss} />
        {/* face-oval guide */}
        <div className={guideWrapCss}>
          <div className={guideCss} />
        </div>
        {/* LIVE chip */}
        <div className={liveChipCss}>
          <span className={liveDotCss} />
          LIVE
        </div>
        {/* instruction */}
        <div className={instructionWrapCss}>
          <p className={instructionCss}>
            Center your face in the oval, then capture
          </p>
        </div>
      </div>
      {/* shutter */}
      <div className={shutterWrapCss}>
        <button onClick={shoot} aria-label="Capture photo" className={shutterCss}>
          <div className={shutterInnerCss} />
        </button>
      </div>
    </div>
  );
}
