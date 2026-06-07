"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBackIosNew,
  MailOutline,
  PhoneOutlined,
  CalendarTodayOutlined,
  PlaceOutlined,
  LanguageOutlined,
  BusinessCenterOutlined,
  EditOutlined,
  PauseCircleOutline,
  BlockOutlined,
  PersonOutline,
  AccessTimeOutlined,
  ShieldOutlined,
  CheckCircle,
  CancelOutlined,
  ZoomOutMapOutlined,
  Inbox,
  StarRounded,
  Close,
  DescriptionOutlined,
} from "@mui/icons-material";
import { api, AdminUserDetail, AdminUserKyc, AdminUserKycDocument } from "@/lib/api";
import { TextArea } from "@/components/ui/inputs";

// ─── Design tokens (match KickAir auth / input system) ──────────────────────────
const C = {
  accent: "#0071e3",
  heading: "#0F172A",
  body: "#334155",
  muted: "#64748B",
  ph: "#94A3B8",
  border: "#E2E8F0",
  borderH: "#CBD5E1",
  page: "#F5F5F7",
  fill: "#F1F5F9",
  green: "#047857",
  amber: "#B45309",
  red: "#DC2626",
  greenBg: "#ECFDF5",
  amberBg: "#FFFBEB",
  redBg: "#FEF2F2",
  slateBg: "#F1F5F9",
};

type KycState = "none" | "pending" | "approved" | "rejected";

const PILL: Record<KycState, { c: string; bg: string; dot: string; t: string }> = {
  approved: { c: C.green, bg: C.greenBg, dot: "#10B981", t: "Approved" },
  pending: { c: C.amber, bg: C.amberBg, dot: "#F59E0B", t: "Pending review" },
  rejected: { c: C.red, bg: C.redBg, dot: "#EF4444", t: "Rejected" },
  none: { c: C.muted, bg: C.slateBg, dot: "#94A3B8", t: "Not submitted" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Active now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return formatDate(iso);
}

function money(v: number | undefined): string {
  return "$" + (v ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// ─── Small presentational pieces ────────────────────────────────────────────────

function StatusPill({ state, big }: { state: KycState; big?: boolean }) {
  const s = PILL[state];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.9,
        height: big ? 30 : 26,
        px: big ? 1.6 : 1.4,
        borderRadius: 999,
        bgcolor: s.bg,
        color: s.c,
        fontSize: big ? 13.5 : 12.5,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: s.dot }} />
      {s.t}
    </Box>
  );
}

function VerifyBadge({ ok }: { ok: boolean }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        height: 20,
        px: 1,
        borderRadius: 1.5,
        bgcolor: ok ? C.greenBg : C.amberBg,
        color: ok ? C.green : C.amber,
        fontSize: 11.5,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {ok ? "Verified" : "Unverified"}
    </Box>
  );
}

function RoleChip({ label }: { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        height: 24,
        px: 1.4,
        borderRadius: 1.75,
        bgcolor: C.fill,
        border: `1px solid ${C.border}`,
        fontSize: 12.5,
        fontWeight: 600,
        color: C.body,
      }}
    >
      {label}
    </Box>
  );
}

function SoftChip({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "center", height: 28, px: 1.4, borderRadius: 2, bgcolor: C.fill, color: C.body, fontSize: 13, fontWeight: 500 }}
    >
      {children}
    </Box>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", color: "#F59E0B" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <StarRounded key={i} sx={{ fontSize: 18, opacity: i < full || (i === full && half) ? 1 : 0.28 }} />
      ))}
    </Box>
  );
}

function Card({
  title,
  icon,
  action,
  children,
  pad = true,
}: {
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  pad?: boolean;
}) {
  return (
    <Box sx={{ bgcolor: "#fff", border: `1px solid ${C.border}`, borderRadius: 3.5, boxShadow: "0 1px 2px rgba(15,23,42,.04)", overflow: "hidden" }}>
      {title && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 2, borderBottom: `1px solid ${C.border}` }}>
          <Stack direction="row" alignItems="center" gap={1.1}>
            {icon && <Box sx={{ display: "flex", color: C.muted }}>{icon}</Box>}
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.heading, letterSpacing: "-.01em" }}>{title}</Typography>
          </Stack>
          {action}
        </Box>
      )}
      <Box sx={{ p: pad ? 2.5 : 0 }}>{children}</Box>
    </Box>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: C.muted, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

function DefRow({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "132px 1fr", gap: 2, alignItems: "baseline", py: 1.25, borderBottom: `1px solid ${C.border}` }}>
      <Stack direction="row" alignItems="center" gap={0.9} sx={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>
        {icon && <Box sx={{ display: "flex", color: C.ph }}>{icon}</Box>}
        {label}
      </Stack>
      <Box sx={{ fontSize: 14, color: C.heading, lineHeight: 1.5 }}>{children}</Box>
    </Box>
  );
}

function StatTile({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <Box sx={{ p: 2, borderRadius: 2.75, border: `1px solid ${C.border}`, bgcolor: "#fff" }}>
      <Typography sx={{ fontSize: 11.5, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: C.muted, mb: 1 }}>{label}</Typography>
      <Typography sx={{ fontSize: 24, fontWeight: 700, color: C.heading, letterSpacing: "-.02em", lineHeight: 1 }}>{value}</Typography>
      {sub && <Typography sx={{ fontSize: 12, color: C.ph, mt: 0.75 }}>{sub}</Typography>}
    </Box>
  );
}

function disabledBtnSx() {
  return {
    justifyContent: "flex-start",
    gap: 1,
    height: 40,
    px: 2,
    borderRadius: 2,
    fontSize: 14,
    fontWeight: 600,
    textTransform: "none",
    bgcolor: "#fff",
    color: C.body,
    border: `1px solid ${C.borderH}`,
    "&.Mui-disabled": { color: C.ph, borderColor: C.border },
  } as const;
}

// ─── KYC document tile + lightbox ───────────────────────────────────────────────

function DocTile({ doc, onOpen }: { doc: AdminUserKycDocument; onOpen: () => void }) {
  const isSelfie = doc.kind === "selfie";
  return (
    <Box
      component="button"
      onClick={onOpen}
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: isSelfie ? "1.1 / 1" : "1.55 / 1",
        borderRadius: 2.75,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        cursor: "pointer",
        p: 0,
        bgcolor: C.fill,
        fontFamily: "inherit",
        transition: "box-shadow .15s, transform .15s",
        "&:hover": { boxShadow: "0 6px 18px rgba(15,23,42,.12)", transform: "translateY(-1px)" },
        "&:hover .zoom": { opacity: 1 },
      }}
    >
      <Box component="img" src={doc.url} alt={doc.label} sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {isSelfie && (
        <Box component="span" sx={{ position: "absolute", top: 8, left: 8, display: "inline-flex", alignItems: "center", gap: 0.5, height: 20, px: 1, borderRadius: 1.5, bgcolor: "rgba(220,38,38,.92)", color: "#fff", fontSize: 10.5, fontWeight: 700, letterSpacing: ".03em" }}>
          <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#fff" }} />
          LIVE
        </Box>
      )}
      <Box component="span" sx={{ position: "absolute", bottom: 9, left: 9, fontFamily: "monospace", fontSize: 10.5, color: C.muted, bgcolor: "rgba(255,255,255,.82)", px: 0.9, py: 0.4, borderRadius: 1 }}>
        {doc.label}
      </Box>
      <Box className="zoom" sx={{ position: "absolute", top: 8, right: 8, display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 2, bgcolor: "rgba(255,255,255,.92)", color: C.body, boxShadow: "0 1px 3px rgba(15,23,42,.16)", opacity: 0, transition: "opacity .15s" }}>
        <ZoomOutMapOutlined sx={{ fontSize: 17 }} />
      </Box>
    </Box>
  );
}

function Lightbox({ doc, onClose }: { doc: AdminUserKycDocument; onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: "#0f172a" } }}>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
            <DescriptionOutlined sx={{ fontSize: 18, opacity: 0.8 }} />
            {doc.label}
          </Stack>
          <Button onClick={onClose} sx={{ minWidth: 0, width: 34, height: 34, borderRadius: 2, color: "#fff", bgcolor: "rgba(255,255,255,.14)", "&:hover": { bgcolor: "rgba(255,255,255,.24)" } }}>
            <Close sx={{ fontSize: 18 }} />
          </Button>
        </Stack>
        <Box component="img" src={doc.url} alt={doc.label} sx={{ width: "100%", borderRadius: 2, display: "block", maxHeight: "70vh", objectFit: "contain", bgcolor: "#000" }} />
      </Box>
    </Dialog>
  );
}

// ─── KYC section ────────────────────────────────────────────────────────────────

function KycSection({ kyc, state, onAction }: { kyc: AdminUserKyc | null; state: KycState; onAction: () => void }) {
  const [open, setOpen] = useState<AdminUserKycDocument | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (state === "none" || !kyc) {
    return (
      <Card title="Identity verification" icon={<ShieldOutlined sx={{ fontSize: 18 }} />} action={<StatusPill state="none" />}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", py: 4.5, px: 2 }}>
          <Box sx={{ width: 60, height: 60, borderRadius: 3.5, bgcolor: C.fill, color: C.ph, display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
            <Inbox sx={{ fontSize: 28 }} />
          </Box>
          <Typography sx={{ fontSize: 15.5, fontWeight: 600, color: C.heading, mb: 0.75 }}>This user hasn&apos;t submitted KYC yet</Typography>
          <Typography sx={{ maxWidth: 380, fontSize: 13.5, color: C.muted, lineHeight: 1.55 }}>
            No identity documents are on file. They can complete verification from their account settings — you&apos;ll be able to review it here once submitted.
          </Typography>
        </Box>
      </Card>
    );
  }

  const showReviewed = state !== "pending";

  const approve = async () => {
    setBusy(true);
    setErr("");
    try {
      await api.approveKyc(kyc.id);
      onAction();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to approve.");
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!reason.trim()) {
      setErr("Please provide a reason.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await api.rejectKyc(kyc.id, reason.trim());
      onAction();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to reject.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Identity verification" icon={<ShieldOutlined sx={{ fontSize: 18 }} />} action={<StatusPill state={state} big />}>
      {/* meta grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "18px 20px", pb: 2.5, borderBottom: `1px solid ${C.border}` }}>
        {kyc.document_type && <MetaItem label="Document type" value={kyc.document_type} icon={<DescriptionOutlined sx={{ fontSize: 15 }} />} />}
        <MetaItem label="Submitted" value={formatDate(kyc.submitted_at)} icon={<CalendarTodayOutlined sx={{ fontSize: 14 }} />} />
        {showReviewed && <MetaItem label="Reviewed" value={formatDate(kyc.reviewed_at)} icon={<CalendarTodayOutlined sx={{ fontSize: 14 }} />} />}
        {showReviewed ? (
          <MetaItem label="Reviewed by" value={kyc.reviewer ?? "—"} />
        ) : (
          <MetaItem label="Waiting" value="In review queue" icon={<AccessTimeOutlined sx={{ fontSize: 14 }} />} />
        )}
      </Box>

      {/* documents */}
      <Box sx={{ mt: 2.5 }}>
        <SubHead>Submitted documents</SubHead>
        {kyc.documents.length > 0 ? (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(kyc.documents.length, 3)}, 1fr)`, gap: 1.5, maxWidth: 540 }}>
              {kyc.documents.map((d) => (
                <DocTile key={d.label} doc={d} onOpen={() => setOpen(d)} />
              ))}
            </Box>
            <Typography sx={{ fontSize: 12, color: C.ph, mt: 1.1 }}>Click any document to enlarge.</Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: 13, color: C.muted }}>No document images on file.</Typography>
        )}
      </Box>

      {/* rejection note */}
      {state === "rejected" && kyc.admin_note && (
        <Box sx={{ mt: 2.5, p: "14px 16px", borderRadius: 2.75, bgcolor: C.redBg, border: "1px solid #FBD2D2", display: "flex", gap: 1.4 }}>
          <CancelOutlined sx={{ fontSize: 18, color: C.red, mt: "1px", flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#B91C1C", mb: 0.5 }}>Rejected{kyc.reviewer ? ` by ${kyc.reviewer}` : ""}</Typography>
            <Typography sx={{ fontSize: 13.5, color: "#7F1D1D", lineHeight: 1.55 }}>{kyc.admin_note}</Typography>
          </Box>
        </Box>
      )}

      {/* approved strip */}
      {state === "approved" && (
        <Box sx={{ mt: 2.5, p: "12px 16px", borderRadius: 2.75, bgcolor: C.greenBg, border: "1px solid #BBF7D0", display: "flex", alignItems: "center", gap: 1.25 }}>
          <CheckCircle sx={{ fontSize: 18, color: C.green }} />
          <Typography sx={{ fontSize: 13.5, color: "#065F46", fontWeight: 500 }}>Identity confirmed — this user is verified and can transact without limits.</Typography>
        </Box>
      )}

      {/* pending actions */}
      {state === "pending" && (
        <Box sx={{ mt: 2.5, pt: 2.5, borderTop: `1px solid ${C.border}` }}>
          {!rejecting ? (
            <Stack direction="row" alignItems="center" gap={1.4} flexWrap="wrap">
              <Button
                onClick={approve}
                disabled={busy}
                startIcon={busy ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <CheckCircle sx={{ fontSize: 18 }} />}
                sx={{ height: 40, px: 2.25, borderRadius: 2, fontSize: 14, fontWeight: 600, textTransform: "none", bgcolor: C.green, color: "#fff", "&:hover": { bgcolor: "#03694A" } }}
              >
                Approve verification
              </Button>
              <Button
                onClick={() => { setRejecting(true); setErr(""); }}
                disabled={busy}
                sx={{ height: 40, px: 2.25, borderRadius: 2, fontSize: 14, fontWeight: 600, textTransform: "none", bgcolor: "#fff", color: C.red, border: "1px solid #FBCFCF", "&:hover": { bgcolor: C.redBg } }}
              >
                Reject…
              </Button>
              <Typography sx={{ fontSize: 12.5, color: C.muted }}>Review the documents above before deciding.</Typography>
            </Stack>
          ) : (
            <Box sx={{ p: 2, borderRadius: 2.75, bgcolor: C.redBg, border: "1px solid #FBD2D2" }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.heading, mb: 1.1 }}>Reason for rejection</Typography>
              <TextArea
                value={reason}
                onChange={(v) => { setReason(v); setErr(""); }}
                minRows={3}
                placeholder="Explain what's wrong so the user can re-submit (e.g. document is blurred, name doesn't match)…"
                error={err || undefined}
              />
              <Stack direction="row" gap={1.25} sx={{ mt: 1.5 }}>
                <Button
                  onClick={reject}
                  disabled={busy || !reason.trim()}
                  sx={{ height: 34, px: 2, borderRadius: 2, fontSize: 13.5, fontWeight: 600, textTransform: "none", bgcolor: C.red, color: "#fff", "&:hover": { bgcolor: "#BE1D1D" }, "&.Mui-disabled": { bgcolor: "#fca5a5", color: "#fff" } }}
                >
                  {busy ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : "Confirm rejection"}
                </Button>
                <Button onClick={() => { setRejecting(false); setReason(""); setErr(""); }} disabled={busy} sx={{ height: 34, px: 2, borderRadius: 2, fontSize: 13.5, fontWeight: 600, textTransform: "none", color: C.body }}>
                  Cancel
                </Button>
              </Stack>
            </Box>
          )}
          {err && !rejecting && <Typography sx={{ fontSize: 12.5, color: C.red, mt: 1 }}>{err}</Typography>}
        </Box>
      )}

      {open && <Lightbox doc={open} onClose={() => setOpen(null)} />}
    </Card>
  );
}

function MetaItem({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: C.ph, mb: 0.6 }}>{label}</Typography>
      <Stack direction="row" alignItems="center" gap={0.75} sx={{ fontSize: 13.5, color: C.heading, fontWeight: 500 }}>
        {icon && <Box sx={{ display: "flex", color: C.muted }}>{icon}</Box>}
        {value}
      </Stack>
    </Box>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function UserDetailPage({ userId }: { userId: number }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdminUser(userId);
      setUser(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load user.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography sx={{ color: C.muted, mb: 2 }}>{error ?? "User not found."}</Typography>
        <Button onClick={() => router.push("/admin/users")} sx={{ textTransform: "none" }}>Back to users</Button>
      </Box>
    );
  }

  const f = user.freelancer_profile;
  const c = user.client_profile;
  const a = user.activity;
  const kycState: KycState = user.is_verified_id ? "approved" : ((user.kyc?.status as KycState) ?? "none");
  const roles = [user.is_client && "Client", user.is_freelancer && "Freelancer"].filter(Boolean) as string[];
  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const tiles: { label: string; value: React.ReactNode; sub?: string }[] = [];
  if (c) {
    tiles.push({ label: "Orders placed", value: a.orders_placed ?? 0 });
    tiles.push({ label: "Completed", value: a.orders_completed_as_client ?? 0, sub: "as client" });
    tiles.push({ label: "Job posts", value: a.job_posts ?? 0 });
    tiles.push({ label: "Total spent", value: money(a.total_spent), sub: "gross" });
  }
  if (f) {
    tiles.push({ label: "Orders completed", value: a.orders_completed ?? 0, sub: "as freelancer" });
    tiles.push({ label: "Active listings", value: a.services ?? 0, sub: "services" });
    tiles.push({ label: "Rating", value: a.rating != null ? a.rating.toFixed(1) : "—", sub: `${a.reviews ?? 0} reviews` });
    tiles.push({ label: "Total earned", value: money(a.total_earned), sub: "gross" });
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: C.page }}>
      <Box sx={{ maxWidth: 1080, mx: "auto", px: { xs: 2.5, sm: 3.5 }, py: 3, pb: 10 }}>
        {/* back link */}
        <Button
          onClick={() => router.push("/admin/users")}
          startIcon={<ArrowBackIosNew sx={{ fontSize: 13 }} />}
          sx={{ mb: 2, pl: 0, textTransform: "none", fontSize: 13.5, fontWeight: 500, color: C.muted, "&:hover": { color: C.accent, bgcolor: "transparent" } }}
        >
          Back to users
        </Button>

        {/* breadcrumb */}
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2, fontSize: 12.5, color: C.ph }}>
          <span>Users</span>
          <span>/</span>
          <Box component="span" sx={{ color: C.body, fontWeight: 500 }}>{user.name}</Box>
        </Stack>

        {/* header card */}
        <Card pad={false}>
          <Box sx={{ p: "24px 24px 22px", display: "flex", gap: 2.75, flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Stack direction="row" gap={2.5} sx={{ minWidth: 280, flex: "1 1 420px" }}>
              <Avatar src={user.avatar_url ?? undefined} sx={{ width: 84, height: 84, bgcolor: "#DBEAFE", color: "#1D4ED8", fontSize: 30, fontWeight: 700 }}>
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" alignItems="center" gap={1.4} flexWrap="wrap" sx={{ mb: 1.25 }}>
                  <Typography component="h1" sx={{ m: 0, fontSize: 23, fontWeight: 700, color: C.heading, letterSpacing: "-.02em" }}>{user.name}</Typography>
                  <StatusPill state={kycState} />
                </Stack>
                <Stack gap={0.9} sx={{ mb: 1.6 }}>
                  <Stack direction="row" alignItems="center" gap={1.1} flexWrap="wrap">
                    <MailOutline sx={{ fontSize: 15, color: C.muted }} />
                    <Typography sx={{ fontSize: 14, color: C.body }}>{user.email ?? "—"}</Typography>
                    {user.email && <VerifyBadge ok={!!user.email_verified_at} />}
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={1.1} flexWrap="wrap">
                    <PhoneOutlined sx={{ fontSize: 15, color: C.muted }} />
                    <Typography sx={{ fontSize: 14, color: C.body }}>{user.telephone ?? "—"}</Typography>
                    {user.telephone && <VerifyBadge ok={user.is_verified_phone} />}
                  </Stack>
                </Stack>
                <Stack direction="row" alignItems="center" gap={1.25} flexWrap="wrap">
                  {roles.length === 2 ? <RoleChip label="Client & Freelancer" /> : roles.map((r) => <RoleChip key={r} label={r} />)}
                  <Stack direction="row" alignItems="center" gap={0.75} sx={{ fontSize: 12.5, color: C.muted }}>
                    <CalendarTodayOutlined sx={{ fontSize: 14, color: C.ph }} />
                    Joined {formatDate(user.created_at)}
                  </Stack>
                </Stack>
              </Box>
            </Stack>
            {/* header actions */}
            <Stack alignItems="flex-end" gap={1.25}>
              <Button disabled startIcon={<EditOutlined sx={{ fontSize: 16 }} />} sx={{ height: 40, px: 2.25, borderRadius: 2, fontSize: 14, fontWeight: 600, textTransform: "none", bgcolor: C.accent, color: "#fff", "&.Mui-disabled": { bgcolor: C.fill, color: C.ph } }}>
                Edit user
              </Button>
              <Stack direction="row" gap={1}>
                <Button disabled startIcon={<PauseCircleOutline sx={{ fontSize: 16 }} />} sx={{ height: 34, px: 1.75, borderRadius: 2, fontSize: 13, fontWeight: 600, textTransform: "none", "&.Mui-disabled": { color: C.ph, border: `1px solid ${C.border}` } }}>Suspend</Button>
                <Button disabled startIcon={<BlockOutlined sx={{ fontSize: 16 }} />} sx={{ height: 34, px: 1.75, borderRadius: 2, fontSize: 13, fontWeight: 600, textTransform: "none", "&.Mui-disabled": { color: C.ph, border: `1px solid ${C.border}` } }}>Ban</Button>
              </Stack>
              <Typography sx={{ fontSize: 11.5, color: C.ph }}>Suspend &amp; ban — coming soon</Typography>
            </Stack>
          </Box>
        </Card>

        {/* two-column body */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 320px" }, gap: 2.5, mt: 2.5, alignItems: "start" }}>
          {/* main */}
          <Stack gap={2.5} sx={{ minWidth: 0 }}>
            {/* profile */}
            {(f || c) && (
              <Card title="Profile" icon={<PersonOutline sx={{ fontSize: 18 }} />}>
                {f && (
                  <Box>
                    <SubHead>Freelancer profile</SubHead>
                    {f.tagline && <Typography sx={{ fontSize: 15, fontWeight: 600, color: C.heading, mb: 0.75 }}>{f.tagline}</Typography>}
                    {f.about && <Typography sx={{ m: 0, mb: 2.25, fontSize: 14, color: C.body, lineHeight: 1.6, maxWidth: 660 }}>{f.about}</Typography>}
                    <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap" sx={{ mb: 2.25, p: "12px 14px", borderRadius: 2.5, bgcolor: C.fill, width: "fit-content" }}>
                      <Stars value={f.rating ?? 0} />
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.heading }}>{f.rating != null ? f.rating.toFixed(1) : "—"}</Typography>
                      <Typography sx={{ fontSize: 13, color: C.muted }}>· {f.rating_count} reviews · {f.completed_orders} orders completed</Typography>
                    </Stack>
                    {f.skills.length > 0 && (
                      <>
                        <SubHead>Skills</SubHead>
                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2.25 }}>{f.skills.map((s) => <SoftChip key={s}>{s}</SoftChip>)}</Stack>
                      </>
                    )}
                    {f.languages.length > 0 && (
                      <>
                        <SubHead>Languages</SubHead>
                        <Stack direction="row" flexWrap="wrap" gap={1}>{f.languages.map((l) => <SoftChip key={l.name}>{l.name} ({l.proficiency})</SoftChip>)}</Stack>
                      </>
                    )}
                  </Box>
                )}
                {f && c && <Box sx={{ height: "1px", bgcolor: C.border, my: 2.75 }} />}
                {c && (
                  <Box>
                    <SubHead>Client profile</SubHead>
                    <Box sx={{ maxWidth: 680 }}>
                      <DefRow label="Company" icon={<BusinessCenterOutlined sx={{ fontSize: 15 }} />}>{c.company_name ?? "—"}</DefRow>
                      <DefRow label="Industry">{c.industry ?? "—"}</DefRow>
                      <DefRow label="Location" icon={<PlaceOutlined sx={{ fontSize: 15 }} />}>{c.location ?? "—"}</DefRow>
                      <DefRow label="Website" icon={<LanguageOutlined sx={{ fontSize: 15 }} />}>
                        {c.website ? <Box component="a" href={c.website.startsWith("http") ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" sx={{ color: C.accent, textDecoration: "none", fontWeight: 500 }}>{c.website}</Box> : "—"}
                      </DefRow>
                    </Box>
                    {c.about && <Typography sx={{ mt: 2, fontSize: 14, color: C.body, lineHeight: 1.6, maxWidth: 660 }}>{c.about}</Typography>}
                  </Box>
                )}
              </Card>
            )}

            {/* activity */}
            <Card title="Activity" icon={<AccessTimeOutlined sx={{ fontSize: 18 }} />}>
              {tiles.length > 0 ? (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 1.5 }}>
                  {tiles.map((t) => <StatTile key={t.label + (t.sub ?? "")} {...t} />)}
                </Box>
              ) : (
                <Typography sx={{ fontSize: 13, color: C.muted }}>No activity yet.</Typography>
              )}
            </Card>

            {/* KYC */}
            <KycSection kyc={user.kyc} state={kycState} onAction={fetchUser} />
          </Stack>

          {/* side column */}
          <Stack gap={2.5} sx={{ minWidth: 0 }}>
            <Card title="Account actions" icon={<ShieldOutlined sx={{ fontSize: 18 }} />}>
              <Stack gap={1.5}>
                <Button disabled fullWidth startIcon={<MailOutline sx={{ fontSize: 16 }} />} sx={disabledBtnSx()}>Send email</Button>
                <Box sx={{ height: "1px", bgcolor: C.border, my: 0.25 }} />
                <Button disabled fullWidth startIcon={<PauseCircleOutline sx={{ fontSize: 16 }} />} sx={disabledBtnSx()}>Suspend user</Button>
                <Button disabled fullWidth startIcon={<BlockOutlined sx={{ fontSize: 16 }} />} sx={disabledBtnSx()}>Ban user</Button>
                <Stack direction="row" gap={0.9} sx={{ fontSize: 12, color: C.ph, lineHeight: 1.5, mt: 0.5 }}>
                  <AccessTimeOutlined sx={{ fontSize: 14, mt: "1px", flexShrink: 0 }} />
                  <span>Suspend and ban are coming soon. Until then, escalate to a senior admin to action a user.</span>
                </Stack>
              </Stack>
            </Card>

            <Card title="Account" icon={<PersonOutline sx={{ fontSize: 18 }} />}>
              <Box>
                <DefRow label="User ID"><Box component="span" sx={{ fontFamily: "monospace", fontSize: 13 }}>#{user.id}</Box></DefRow>
                <DefRow label="Location" icon={<PlaceOutlined sx={{ fontSize: 15 }} />}>{user.location ?? "—"}</DefRow>
                <DefRow label="Last active" icon={<AccessTimeOutlined sx={{ fontSize: 15 }} />}>{timeAgo(user.last_active_at)}</DefRow>
                <Box sx={{ display: "grid", gridTemplateColumns: "132px 1fr", gap: 2, alignItems: "baseline", py: 1.25 }}>
                  <Box sx={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>Roles</Box>
                  <Stack direction="row" gap={0.75} flexWrap="wrap">{roles.length ? roles.map((r) => <RoleChip key={r} label={r} />) : "—"}</Stack>
                </Box>
              </Box>
            </Card>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
