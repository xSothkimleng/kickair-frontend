import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stopped changing for `delayMs`. Used where a control
 * changes many times a second (typing, a slider) but the work that follows it (an
 * API request) should run once.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
