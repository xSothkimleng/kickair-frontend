"use client";

import { useState } from "react";
import { Box, Paper, Typography, Stack, Chip, CircularProgress } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import DownloadIcon from "@mui/icons-material/Download";
import { downloadOrderAttachment } from "@/lib/downloadFile";

type Attachment = { url: string; file_name: string; file_type: string };
type DeliveryEntry = { note: string | null; attachments: Attachment[]; submitted_at: string };
type RevisionEntry = { note: string | null; requested_at: string };

interface TimelineEntry {
  kind: "delivery" | "revision";
  index: number;
  note: string | null;
  attachments: Attachment[];
  at: string;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function AttachmentLink({ file, orderId }: { file: Attachment; orderId: number }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);

  const handleDownload = async () => {
    setDownloading(true); setError(false);
    try { await downloadOrderAttachment(orderId, file.url, file.file_name); }
    catch { setError(true); }
    finally { setDownloading(false); }
  };

  return (
    <Box
      sx={{
        display: "flex", alignItems: "center", gap: 1, p: 1,
        border: "1px solid", borderColor: "rgba(0,0,0,0.12)", borderRadius: 1.5,
      }}>
      {file.file_type === "image" ? <ImageIcon fontSize="small" color="action" /> : <InsertDriveFileIcon fontSize="small" color="action" />}
      <Typography variant="caption" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.file_name}</Typography>
      {error && <Typography variant="caption" color="error">Unavailable</Typography>}
      <Typography component="a" href={file.url} target="_blank" rel="noopener noreferrer" variant="caption" color="primary" sx={{ textDecoration: "none" }}>
        Open
      </Typography>
      <Box
        onClick={downloading ? undefined : handleDownload}
        sx={{ display: "flex", alignItems: "center", gap: 0.4, cursor: "pointer", color: "primary.main", "&:hover": { textDecoration: "underline" } }}>
        {downloading ? <CircularProgress size={11} /> : <DownloadIcon sx={{ fontSize: 13 }} />}
        <Typography variant="caption" color="primary">Download</Typography>
      </Box>
    </Box>
  );
}

/**
 * A persistent, status-independent record of every delivery and revision request on an order.
 * Stays visible after completion/dispute so all parties (and admins) can review the actual work.
 */
export default function DeliverablesReference({
  orderId,
  deliveryHistory,
  revisionHistory,
}: {
  orderId: number;
  deliveryHistory?: DeliveryEntry[];
  revisionHistory?: RevisionEntry[];
}) {
  const deliveries = deliveryHistory ?? [];
  const revisions = revisionHistory ?? [];

  const entries: TimelineEntry[] = [
    ...deliveries.map((d, i) => ({
      kind: "delivery" as const,
      index: i + 1,
      note: d.note,
      attachments: d.attachments ?? [],
      at: d.submitted_at,
    })),
    ...revisions.map((r, i) => ({
      kind: "revision" as const,
      index: i + 1,
      note: r.note,
      attachments: [] as Attachment[],
      at: r.requested_at,
    })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  if (entries.length === 0) return null;

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
      <Typography fontWeight={700} fontSize={15} mb={0.5}>Deliverables &amp; revisions</Typography>
      <Typography variant="caption" color="text.secondary">
        A permanent record of all delivered work and revision requests for this order.
      </Typography>

      <Stack spacing={2} mt={2}>
        {entries.map((e, i) => {
          const isDelivery = e.kind === "delivery";
          return (
            <Box
              key={`${e.kind}-${e.index}-${i}`}
              sx={{
                pl: 2, py: 0.5,
                borderLeft: "3px solid",
                borderColor: isDelivery ? "success.main" : "warning.main",
              }}>
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" mb={0.75}>
                {isDelivery
                  ? <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: "success.main" }} />
                  : <ReplayIcon sx={{ fontSize: 18, color: "warning.main" }} />}
                <Typography fontWeight={600} fontSize={13}>
                  {isDelivery ? `Delivery #${e.index}` : `Revision requested #${e.index}`}
                </Typography>
                <Chip
                  label={isDelivery ? "Freelancer" : "Client"}
                  size="small"
                  sx={{ height: 18, fontSize: 10 }}
                  color={isDelivery ? "success" : "warning"}
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                  {formatDateTime(e.at)}
                </Typography>
              </Stack>

              {e.note
                ? <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{e.note}</Typography>
                : <Typography variant="body2" color="text.disabled">{isDelivery ? "No note provided." : "No revision note provided."}</Typography>}

              {e.attachments.length > 0 && (
                <Stack spacing={1} mt={1.25}>
                  {e.attachments.map((f, fi) => <AttachmentLink key={fi} file={f} orderId={orderId} />)}
                </Stack>
              )}
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
