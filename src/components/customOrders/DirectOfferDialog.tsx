"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Lock, X } from "lucide-react";
import { css } from "styled-system/css";
import { Alert, Dialog, Spinner } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import { sanitizeMoneyInput } from "@/components/ui/inputs";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { Service } from "@/types/service";
import { useConversations } from "@/hooks/useConversations";
import { CoInput, CoSelect, CoTextArea, Money, coBtn, coIconBtn, coLabelAccent } from "./kit";
import { useCoInvalidate } from "./hooks";

const panel = css({ borderWidth: "1px", borderStyle: "solid", borderColor: "hairline" });
const header = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", p: "22px 24px 0" });

const dlgTitle = css({ textStyle: "title", fontWeight: 600, color: "ink" });

const labelCss = css({ textStyle: "meta", fontWeight: 600, color: "ink" });
const labelSub = css({ color: "ink3", fontWeight: 400 });

const sentBox = css({ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", p: "24px 36px 32px", gap: "16px" });
const sentIcon = css({ width: "64px", height: "64px", borderRadius: "50%", bg: "successTint", display: "grid", placeItems: "center" });
const sentLead = css({ textStyle: "body", fontWeight: 500, color: "ink" });
const sentBody = css({ textStyle: "ui", color: "ink2" });

const body = css({ display: "flex", flexDirection: "column", gap: "20px", p: "20px 24px" });
const twoCol = css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "1fr 1fr" }, gap: "16px" });
const threeCol = css({ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" });
const priceField = css({ maxW: "220px" });

const footer = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  p: "16px 24px",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "hairline",
  bg: "surface2",
});
const footNote = css({ display: "flex", alignItems: "center", gap: "8px" });
const footText = css({ textStyle: "micro", color: "ink3" });
const footMoney = css({ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "ink2" });
const actions = css({ display: "flex", gap: "10px" });

/**
 * Freelancer-initiated custom order: pick a client you've talked to, anchor it
 * to one of your active services, and send a one-time-payment offer. The client
 * must accept and pay — the freelancer can never approve it themselves.
 */
export default function DirectOfferDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const invalidate = useCoInvalidate();
  const { conversations, loading: convsLoading } = useConversations();

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: qk.services.mine(),
    queryFn: async () => {
      const response = await api.get("/api/my-services");
      return (response.data ?? []) as Service[];
    },
    enabled: open,
  });
  const activeServices = services.filter((s) => s.status === "active");

  // People the freelancer has an existing conversation with — the natural
  // "client who can't / won't write the request themselves" case.
  const people = useMemo(() => {
    const seen = new Map<number, { id: number; name: string }>();
    conversations.forEach((c) => {
      if (c.other_participant && !seen.has(c.other_participant.id)) {
        seen.set(c.other_participant.id, { id: c.other_participant.id, name: c.other_participant.name });
      }
    });
    return Array.from(seen.values());
  }, [conversations]);

  const [clientUserId, setClientUserId] = useState<number | "">("");
  const [serviceId, setServiceId] = useState<number | "">("");
  const [scope, setScope] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("30");
  const [revisions, setRevisions] = useState("3");
  const [expiresIn, setExpiresIn] = useState("3");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const total = Number(amount) || 0;
  const clientName = people.find((p) => p.id === clientUserId)?.name ?? "the client";

  const reset = () => {
    setClientUserId(""); setServiceId(""); setScope(""); setNote("");
    setDeliveryDays("30"); setRevisions("3"); setExpiresIn("3");
    setAmount("");
    setError(null); setSent(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSend = async () => {
    if (!clientUserId) { setError("Pick who this offer is for."); return; }
    if (!serviceId) { setError("Pick one of your services to anchor the offer."); return; }
    if (!scope.trim()) { setError("Describe the work you're proposing."); return; }
    if (!total) { setError("Add a project price."); return; }

    setSubmitting(true);
    setError(null);
    try {
      await api.createDirectCustomOffer({
        service_id: serviceId,
        client_user_id: clientUserId,
        description: scope.trim(),
        offer_scope: scope.trim(),
        offer_delivery_days: Number(deliveryDays) || 30,
        offer_revisions: revisions ? Number(revisions) : null,
        offer_note: note.trim() || null,
        offer_expires_in_days: expiresIn ? Number(expiresIn) : null,
        is_split: false,
        milestones: [{ title: "Complete project", amount: total, due_days: Number(deliveryDays) || null }],
      });
      await invalidate();
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send the offer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BareModal open={open} onOpenChange={(o) => { if (!o) handleClose(); }} maxW="600px" className={panel} closeOnInteractOutside={!submitting} closeOnEscape={!submitting}>
      {/* header */}
      <div className={header}>
        <div>
          <p className={coLabelAccent}>Custom order</p>
          <Dialog.Title className={dlgTitle}>{sent ? "Offer sent" : "Propose a custom order"}</Dialog.Title>
        </div>
        <button type="button" aria-label="Close" onClick={handleClose} className={coIconBtn()}><X size={20} /></button>
      </div>

      {sent ? (
        <div className={sentBox}>
          <div className={sentIcon}>
            <CheckCircle2 size={32} className={css({ color: "success" })} />
          </div>
          <p className={sentLead}>Your offer is on its way to {clientName}.</p>
          <p className={sentBody}>
            They&apos;ll see your offer and can accept whenever they&apos;re ready. Nothing starts until they accept and pay.
          </p>
          <button type="button" onClick={handleClose} className={coBtn({ tone: "black", size: "md", strong: true, full: true })}>Done</button>
        </div>
      ) : (
        <>
          <div className={body}>
            {error && <Alert tone="error" onClose={() => setError(null)}>{error}</Alert>}

            <div className={twoCol}>
              <div>
                <p className={labelCss}>For</p>
                <CoSelect
                  value={clientUserId}
                  onChange={setClientUserId}
                  options={people.map((p) => ({ value: p.id, label: p.name }))}
                  placeholder="Pick a person…"
                  emptyLabel={convsLoading ? "Loading conversations…" : people.length === 0 ? "No conversations yet — message a client first" : undefined}
                />
              </div>
              <div>
                <p className={labelCss}>From your service</p>
                <CoSelect
                  value={serviceId}
                  onChange={setServiceId}
                  options={activeServices.map((s) => ({ value: s.id, label: s.title }))}
                  placeholder="Pick a service…"
                  emptyLabel={servicesLoading ? "Loading services…" : activeServices.length === 0 ? "No active services — publish one first" : undefined}
                />
              </div>
            </div>

            <div>
              <p className={labelCss}>Scope of work</p>
              <CoTextArea
                minRows={3}
                placeholder="What you'll deliver overall — write it the way you'd pitch it to them…"
                value={scope}
                onChange={setScope}
              />
            </div>

            <div className={threeCol}>
              <div>
                <p className={labelCss}>Total delivery</p>
                <CoInput mono value={deliveryDays} onChange={(v) => setDeliveryDays(v.replace(/[^0-9]/g, ""))} end="days" />
              </div>
              <div>
                <p className={labelCss}>Revisions</p>
                <CoInput mono value={revisions} onChange={(v) => setRevisions(v.replace(/[^0-9]/g, ""))} end="rounds" />
              </div>
              <div>
                <p className={labelCss}>Expires in</p>
                <CoInput mono value={expiresIn} onChange={(v) => setExpiresIn(v.replace(/[^0-9]/g, ""))} end="days" />
              </div>
            </div>

            {/* one-time project price */}
            <div>
              <p className={labelCss}>Project price <span className={labelSub}>· one-time payment</span></p>
              <CoInput mono size="sm" className={priceField} placeholder="0" value={amount} onChange={(v) => setAmount(sanitizeMoneyInput(v))} start="$" />
            </div>

            <div>
              <p className={labelCss}>Note to client <span className={labelSub}>· optional</span></p>
              <CoTextArea minRows={2} value={note} onChange={setNote} placeholder="Anything they should know about the plan…" />
            </div>
          </div>

          {/* footer */}
          <div className={footer}>
            <div className={footNote}>
              <Lock size={13} className={css({ color: "ink3", flexShrink: 0 })} />
              <p className={footText}>
                Only the client can accept — total <span className={footMoney}><Money value={total} size="micro" weight={600} /></span>
              </p>
            </div>
            <div className={actions}>
              <button type="button" onClick={handleClose} className={coBtn({ tone: "quiet", strong: true })}>Cancel</button>
              <button type="button" onClick={handleSend} disabled={submitting} className={coBtn({ tone: "black", size: "md", strong: true })}>
                {submitting ? <Spinner size={18} className={css({ color: "#fff" })} /> : "Send offer"}
              </button>
            </div>
          </div>
        </>
      )}
    </BareModal>
  );
}
