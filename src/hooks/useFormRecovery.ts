"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Stored<T> {
  data: T;
  savedAt: number;
}

/**
 * Auto-saves an in-progress form value to localStorage so it survives an
 * accidental tab close / crash. This is the *recovery* safety net — distinct
 * from an explicit, server-persisted draft.
 *
 * - On mount it reads any saved snapshot; if it differs from the initial value
 *   it's exposed via `recovered` so the UI can offer a "Restore" prompt.
 * - It only begins auto-saving once the value actually changes from initial,
 *   so an untouched form never clobbers a meaningful saved snapshot.
 * - Call `clear()` after a successful save/publish, `discard()` to drop it.
 */
export function useFormRecovery<T>(key: string, value: T, enabled: boolean = true) {
  const [recovered, setRecovered] = useState<{ data: T; savedAt: number } | null>(null);
  const initialRef = useRef<string>(JSON.stringify(value));
  const hydratedRef = useRef(false);

  // Read any existing snapshot once on mount.
  useEffect(() => {
    if (!enabled) return;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Stored<T>;
        if (parsed?.data && JSON.stringify(parsed.data) !== initialRef.current) {
          setRecovered({ data: parsed.data, savedAt: parsed.savedAt });
        }
      }
    } catch {
      // ignore corrupt snapshot
    }
    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  // Debounced auto-save — only after the value has changed from its initial state.
  useEffect(() => {
    if (!enabled || !hydratedRef.current) return;
    if (JSON.stringify(value) === initialRef.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({ data: value, savedAt: Date.now() }));
      } catch {
        // storage full / unavailable — non-fatal
      }
    }, 800);
    return () => clearTimeout(t);
  }, [value, key, enabled]);

  const clear = useCallback(() => {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  }, [key]);

  const discard = useCallback(() => {
    clear();
    setRecovered(null);
  }, [clear]);

  const dismiss = useCallback(() => setRecovered(null), []);

  return { recovered, clear, discard, dismiss };
}
