"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Plus } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Spinner } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import { Service } from "@/types/service";
import ServiceCard from "@/components/dashboard/freelancer/ServiceCard";
import DraftCard from "@/components/dashboard/freelancer/DraftCard";
import ServiceForm from "@/components/dashboard/freelancer/ServiceForm";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { useRouter } from "next/navigation";

const page = css({ display: "flex", flexDirection: "column", gap: "24px" });
const loadingBlock = css({ display: "flex", justifyContent: "center", alignItems: "center", minH: "300px" });
const header = css({ display: "flex", alignItems: "center", justifyContent: "space-between" });
const pageTitle = css({ lineHeight: 1.5, fontSize: "28px", fontWeight: 600, color: "ink" });
const pageSub = css({ lineHeight: 1.5, fontSize: "13px", color: "ink2" });
const createBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxSizing: "border-box",
  m: 0,
  px: "24px",
  h: "44px",
  minW: "64px",
  border: "none",
  borderRadius: "40px",
  bg: "ink",
  color: "white",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 500,
  lineHeight: 1.75,
  cursor: "pointer",
  transition: "background-color .25s",
  _hover: { bg: "rgba(0, 0, 0, 0.8)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { flexShrink: 0 },
});
const sectionCard = css({
  bg: "surface",
  borderRadius: "card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  p: "24px",
});
/* globals.css zeroes p margins outside any layer, so the old Typography `mb` never applied — dropped. */
const sectionTitle = css({ lineHeight: 1.5, fontSize: "17px", fontWeight: 600, color: "ink" });
const centreBlock = css({ textAlign: "center", py: "48px" });
const errorText = css({ lineHeight: 1.5, fontSize: "13px", color: "rgba(239, 68, 68, 0.8)" });
const retryBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  m: 0,
  p: "6px 8px",
  minW: "64px",
  border: "none",
  borderRadius: "4px",
  bg: "transparent",
  color: "ink",
  fontFamily: "inherit",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: 1.75,
  cursor: "pointer",
  transition: "background-color .25s",
  _hover: { bg: "rgba(0, 0, 0, 0.04)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const cardList = css({ display: "flex", flexDirection: "column", gap: "12px" });
const emptyIcon = css({ display: "inline-block", color: "rgba(0, 0, 0, 0.2)", mb: "16px" });
const emptyText = css({ lineHeight: 1.5, fontSize: "13px", color: "ink2" });
const draftsHeader = css({ display: "flex", alignItems: "center", gap: "8px", mb: "4px" });
const draftsTitle = css({ lineHeight: 1.5, fontSize: "17px", fontWeight: 600, color: "ink" });
const draftsCount = css({
  px: "8px",
  py: "2px",
  bg: "rgba(0,0,0,0.05)",
  color: "ink2",
  fontSize: "11px",
  fontWeight: 600,
  borderRadius: "4px",
});
const draftsSub = css({ lineHeight: 1.5, fontSize: "12px", color: "rgba(0, 0, 0, 0.5)" });

/* Delete confirmation — MUI `Dialog` (default `sm`) with DialogContent/DialogActions padding. */
const dialogBody = css({ p: "20px 24px", overflowY: "auto", flex: 1 });
const dialogTitle = css({ lineHeight: 1.5, fontSize: "16px", fontWeight: 600, color: "ink" });
const dialogText = css({ lineHeight: 1.5, fontSize: "13px", color: "ink2" });
const dialogActions = css({ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", p: "8px", flex: "0 0 auto" });
const dialogBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  m: 0,
  p: "6px 8px",
  minW: "64px",
  border: "none",
  borderRadius: "4px",
  bg: "transparent",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 500,
  lineHeight: 1.75,
  cursor: "pointer",
  transition: "background-color .25s",
  _hover: { bg: "rgba(0, 0, 0, 0.04)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  _disabled: { pointerEvents: "none", opacity: 0.5 },
});
const dialogCancel = css({ color: "ink2" });
const dialogDelete = css({ color: "#ef4444" });

export default function ServicesContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: services = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: qk.services.mine(),
    queryFn: async () => {
      const response = await api.get("/api/my-services");
      return (response.data ?? []) as Service[];
    },
  });
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch services") : null;

  // Refresh my services + the public explore list (edits/deletes affect both).
  const fetchServices = () => queryClient.invalidateQueries({ queryKey: qk.services.all() });

  const handleEditService = async (service: Service) => {
    setEditLoading(true);
    try {
      // Fetch full service detail so pricing_options, media, and faqs are all loaded
      const response = await api.get(`/api/services/${service.id}`);
      setEditingService(response.data);
    } catch {
      setEditingService(service); // fallback to list data
    } finally {
      setEditLoading(false);
    }
    setView("edit");
  };

  const handleViewService = (service: Service) => {
    router.push(`/explore-services/${service.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.deleteService(deleteTarget.id);
      setDeleteTarget(null);
      fetchServices();
    } catch {
      // keep dialog open so user can retry
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => {
    setView("list");
    setEditingService(null);
    fetchServices();
  };

  if (editLoading) {
    return (
      <div className={loadingBlock}>
        <Spinner size={40} className={css({ color: "accent" })} />
      </div>
    );
  }

  if (view === "create" || view === "edit") {
    return <ServiceForm service={editingService} onBack={handleBack} />;
  }

  const drafts = services.filter(s => s.status === "draft");
  const liveServices = services.filter(s => s.status !== "draft");

  return (
    <div className={page}>
      {/* Header */}
      <div className={header}>
        <div>
          <p className={pageTitle}>My Services</p>
          <p className={pageSub}>Create and manage your service offerings</p>
        </div>
        <button type="button" onClick={() => setView("create")} className={createBtn}>
          <Plus size={16} />
          Create Service
        </button>
      </div>

      {/* Active Services */}
      <div className={sectionCard}>
        <p className={sectionTitle}>Your Services</p>

        {loading ? (
          <div className={centreBlock}>
            <Spinner size={32} className={css({ color: "rgba(0, 0, 0, 0.4)" })} />
          </div>
        ) : error ? (
          <div className={centreBlock}>
            <p className={errorText}>{error}</p>
            <button type="button" onClick={fetchServices} className={retryBtn}>
              Try again
            </button>
          </div>
        ) : liveServices.length > 0 ? (
          <div className={cardList}>
            {liveServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={() => handleEditService(service)}
                onView={() => handleViewService(service)}
                onDelete={() => setDeleteTarget(service)}
              />
            ))}
          </div>
        ) : (
          <div className={centreBlock}>
            <Briefcase size={48} className={emptyIcon} />
            <p className={emptyText}>No active services yet</p>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <BareModal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open && !deleting) setDeleteTarget(null); }}
        maxW="600px"
        backdropClassName={css({ bg: "rgba(0, 0, 0, 0.5)" })}>
        <div className={dialogBody}>
          <p className={dialogTitle}>Delete Service</p>
          <p className={dialogText}>
            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.
          </p>
        </div>
        <div className={dialogActions}>
          <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting} className={cx(dialogBtn, dialogCancel)}>
            Cancel
          </button>
          <button type="button" onClick={handleDeleteConfirm} disabled={deleting} className={cx(dialogBtn, dialogDelete)}>
            {deleting ? <Spinner size={16} className={css({ color: "#ef4444" })} /> : "Delete"}
          </button>
        </div>
      </BareModal>

      {/* Drafts — private, never reviewed or public until published */}
      {drafts.length > 0 && (
        <div className={sectionCard}>
          <div className={draftsHeader}>
            <p className={draftsTitle}>Drafts</p>
            <div className={draftsCount}>
              {drafts.length}
            </div>
          </div>
          <p className={draftsSub}>
            Only you can see these. Continue editing and publish when you&apos;re ready for admin review.
          </p>
          <div className={cardList}>
            {drafts.map(draft => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onContinueEditing={() => handleEditService(draft)}
                onDelete={() => setDeleteTarget(draft)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
