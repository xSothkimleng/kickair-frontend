"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { tdVars } from "./ui";

type Tone = "ok" | "info" | "error";
interface Toast { id: number; msg: string; tone: Tone }

const Ctx = createContext<((msg: string, tone?: Tone) => void) | null>(null);

/** Small bottom-right confirmations for admin actions ("Payout approved."). */
export const useToast = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast outside ToastProvider");
  return v;
};

let nextId = 1;

const wrap = css({ position: "fixed", right: "20px", bottom: "20px", zIndex: 80, display: "flex", flexDirection: "column", gap: "8px", pointerEvents: "none" });
const item = css({
  display: "flex", alignItems: "center", gap: "10px", bg: "var(--td-ink)", color: "#fff", px: "14px", py: "10px", maxW: "420px", borderRadius: "10px", fontSize: "13.5px", fontWeight: 500,
  boxShadow: "var(--td-shadow-lg)", animation: "tdToast .18s ease-out", "& svg": { color: "#7EE2A8", flexShrink: 0 },
  "&[data-tone=info] svg": { color: "#9DB4FF" }, "&[data-tone=error] svg": { color: "#FF9E99" },
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((msg: string, tone: Tone = "ok") => {
    const id = nextId++;
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 5000 : 3200);
  }, []);
  const value = useMemo(() => toast, [toast]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className={cx(tdVars, wrap)} aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={item} data-tone={t.tone}>
            {t.tone === "ok" ? <CheckCircle2 size={16} /> : t.tone === "error" ? <AlertCircle size={16} /> : <Info size={16} />}
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
