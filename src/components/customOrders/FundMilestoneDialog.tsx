"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { ArrowRight, Lock, Plus, Shield, Wallet, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { css, cva } from "styled-system/css";
import { Alert, Dialog, Spinner } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import { api } from "@/lib/api";
import { Money, coBtn, coBtnStart, coIconBtn, coLabel, coLabelAccent } from "./kit";
import { MONEY, ESCROW_SHORT } from "@/lib/moneyTerms";

interface Props {
  open: boolean;
  onClose: () => void;
  milestoneTitle: string;
  amount: number;
  onConfirm: () => void;
  submitting: boolean;
  title?: string;
  annotation?: string;
  ctaLabel?: string;
  error?: string | null;
}

const panel = css({ borderWidth: "1px", borderStyle: "solid", borderColor: "hairline" });
const header = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", p: "22px 24px 0" });

const dlgTitle = css({ textStyle: "title", fontWeight: 600, color: "ink" });
const body = css({ display: "flex", flexDirection: "column", gap: "16px", p: "18px 24px 24px" });

const amountCard = css({
  p: "18px",
  textAlign: "center",
  borderRadius: "12px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  bg: "surface2",
});
const amountValue = css({ mt: "6px" });
const flowRow = css({ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", mt: "8px", color: "ink3" });
const flowLabel = css({ textStyle: "micro" });
const flowTarget = css({
  textStyle: "micro",
  color: "pendingText",
  maxW: "140px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const rowCss = cva({
  base: { display: "flex", justifyContent: "space-between", alignItems: "center", py: "10px" },
  variants: { last: { false: { borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline" }, true: {} } },
});
const rowLabel = cva({
  base: { textStyle: "ui" },
  variants: { last: { true: { fontWeight: 600, color: "ink" }, false: { fontWeight: 400, color: "ink2" } } },
});

const shortBox = css({ display: "flex", gap: "8px", p: "12px", bg: "errorTint", borderRadius: "10px" });
const shortText = css({ textStyle: "meta", color: "errorText" });
const monoSpan = css({ fontVariantNumeric: "tabular-nums" });
const footNote = css({ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", color: "ink3", textStyle: "micro" });

export default function FundMilestoneDialog({
  open,
  onClose,
  milestoneTitle,
  amount,
  onConfirm,
  submitting,
  title = MONEY.acceptAndPay,
  annotation = ESCROW_SHORT,
  ctaLabel,
  error,
}: Props) {
  const router = useRouter();
  const { data: wallet } = useQuery({
    queryKey: qk.wallet(),
    queryFn: async () => (await api.get("/api/wallet")).data,
    enabled: open,
  });

  // `available_balance` is the formatted string ("4,000.00") — Number() of it is NaN.
  const available = wallet ? parseFloat(String(wallet.available_balance_raw)) : 0;
  const insufficient = wallet != null && available < amount;
  const short = amount - available;

  return (
    <BareModal
      open={open}
      onOpenChange={(o) => { if (!o && !submitting) onClose(); }}
      maxW="444px"
      className={panel}
      closeOnInteractOutside={!submitting}
      closeOnEscape={!submitting}>
      <div className={header}>
        <div>
          <p className={coLabelAccent}>{annotation}</p>
          <Dialog.Title className={dlgTitle}>{title}</Dialog.Title>
        </div>
        <button type="button" aria-label="Close" onClick={onClose} disabled={submitting} className={coIconBtn()}>
          <X size={20} />
        </button>
      </div>

      <div className={body}>
        {/* amount → escrow visual */}
        <div className={amountCard}>
          <p className={coLabel}>{MONEY.youPay}</p>
          <div className={amountValue}>
            <Money value={amount} size="stat" weight={600} color="var(--colors-pending-text)" cents />
          </div>
          <div className={flowRow}>
            <Wallet size={14} />
            <p className={flowLabel}>Wallet</p>
            <ArrowRight size={14} />
            <Lock size={13} className={css({ color: "pendingText" })} />
            <p className={flowTarget}>{milestoneTitle}</p>
          </div>
        </div>

        {/* wallet rows */}
        <div>
          <Row label={MONEY.availableBalance} valueEl={<Money value={available} size="body" weight={600} color={insufficient ? "var(--colors-error-text)" : "var(--colors-ink)"} cents />} />
          <Row
            last
            label={insufficient ? MONEY.shortBy : MONEY.balanceAfter}
            valueEl={<Money value={insufficient ? short : available - amount} size="lead" weight={600} color={insufficient ? "var(--colors-error-text)" : "var(--colors-ink)"} cents />}
          />
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        {insufficient ? (
          <>
            <div className={shortBox}>
              <p className={shortText}>
                Not enough in your wallet. {MONEY.topUp}{" "}
                <span className={monoSpan}>${short.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>{" "}
                or more, then pay.
              </p>
            </div>
            <button type="button" onClick={() => router.push("/dashboard/client?tab=finance")} className={coBtn({ tone: "black", size: "md", strong: true, full: true })}>
              <Plus size={20} className={coBtnStart} />
              {MONEY.topUp}
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={onConfirm} disabled={submitting || wallet == null} className={coBtn({ tone: "black", size: "lg", strong: true, full: true })}>
              <Lock size={20} className={coBtnStart} />
              {submitting ? <Spinner size={18} className={css({ color: "#fff" })} /> : (ctaLabel ?? MONEY.acceptAndPay)}
            </button>
            <div className={footNote}>
              <Shield size={13} /> {ESCROW_SHORT}
            </div>
          </>
        )}
      </div>
    </BareModal>
  );
}

function Row({ label, valueEl, last }: { label: string; valueEl: React.ReactNode; last?: boolean }) {
  return (
    <div className={rowCss({ last: !!last })}>
      <p className={rowLabel({ last: !!last })}>{label}</p>
      {valueEl}
    </div>
  );
}
