"use client";

import { useCallback, useState } from "react";
import { BareModal } from "@/components/ds/BareModal";
import MockAbaPayWayPopup from "./MockAbaPayWayPopup";
import PaymentResult, { type PaymentContext } from "./PaymentResult";
import type { AbaMethod } from "./AbaMethodSelector";

type Stage = "aba" | "waiting" | "success" | "failure";
type FlowMethod = AbaMethod | "wallet";

interface FlowState {
  stage: Stage;
  method: FlowMethod;
  amount: number;
  reason?: string;
}

const METHOD_LABEL: Record<FlowMethod, string> = {
  khqr: "ABA KHQR",
  card: "your card",
  alipay: "Alipay",
  wechat: "WeChat Pay",
  wallet: "your wallet",
};

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export interface UsePaymentProcessingOptions {
  context: PaymentContext;
  merchant?: string;
  /** The real (mocked) API call. Resolve = success, throw = failure. */
  perform: () => Promise<void>;
  /** Primary CTA on the success screen (e.g. navigate to the order/wallet). */
  onSuccessPrimary: () => void;
  /** Secondary CTA on success ("Done" / "Back to browsing"). */
  onSuccessDone?: () => void;
  /** Called when the user picks "Choose another method" after a failure. */
  onChooseAnother?: () => void;
  /** Balance to show on a top-up success screen. */
  getNewBalance?: () => number | undefined;
  reference?: { success?: string; failure?: string };
}

/**
 * Drives the post-confirm payment journey: ABA popup → waiting → success/failure.
 * Returns an `overlay` node to render plus `startAba`/`startWallet` triggers.
 *
 * When the real ABA integration lands, only `MockAbaPayWayPopup` and the
 * `perform()` semantics change (popup → ABA's iframe, perform → poll status).
 */
export function usePaymentProcessing(opts: UsePaymentProcessingOptions) {
  const [state, setState] = useState<FlowState | null>(null);

  const run = useCallback(async () => {
    try {
      await Promise.all([opts.perform(), delay(1100)]);
      setState(s => (s ? { ...s, stage: "success" } : s));
    } catch (e) {
      const reason = e instanceof Error && e.message ? e.message : "Payment could not be completed";
      setState(s => (s ? { ...s, stage: "failure", reason } : s));
    }
  }, [opts]);

  const startAba = useCallback((method: AbaMethod, amount: number) => {
    setState({ stage: "aba", method, amount });
  }, []);

  const startWallet = useCallback(
    (amount: number) => {
      setState({ stage: "waiting", method: "wallet", amount });
      void run();
    },
    [run],
  );

  const close = useCallback(() => setState(null), []);

  const onScanComplete = useCallback(() => {
    setState(s => (s ? { ...s, stage: "waiting" } : s));
    void run();
  }, [run]);

  const fail = (reason: string) => setState(s => (s ? { ...s, stage: "failure", reason } : s));

  // While "waiting" the old MUI dialog passed `onClose={undefined}` — backdrop
  // clicks and ESC are inert until the result lands.
  const dismissable = state != null && state.stage !== "waiting";

  const overlay =
    state == null ? null : (
      <>
        <MockAbaPayWayPopup
          open={state.stage === "aba"}
          method={state.method === "wallet" ? "khqr" : state.method}
          amount={state.amount}
          merchant={opts.merchant}
          onScanComplete={onScanComplete}
          onFailure={() => fail("Payment declined by issuer")}
          onCancel={() => fail("Payment cancelled")}
        />

        <BareModal
          open={state.stage !== "aba"}
          onOpenChange={o => {
            if (!o && dismissable) close();
          }}
          closeOnInteractOutside={dismissable}
          closeOnEscape={dismissable}
          maxW='444px'>
          <PaymentResult
            kind={state.stage === "aba" ? "waiting" : state.stage}
            context={opts.context}
            amount={state.amount}
            methodLabel={METHOD_LABEL[state.method]}
            newBalance={opts.getNewBalance?.()}
            reason={state.reason}
            reference={state.stage === "failure" ? opts.reference?.failure : opts.reference?.success}
            onPrimary={() => {
              close();
              opts.onSuccessPrimary();
            }}
            onSecondary={() => {
              close();
              opts.onSuccessDone?.();
            }}
            onRetry={() => setState(s => (s ? { ...s, stage: "aba" } : s))}
            onChooseAnother={() => {
              close();
              opts.onChooseAnother?.();
            }}
          />
        </BareModal>
      </>
    );

  return { overlay, startAba, startWallet, active: state != null };
}
