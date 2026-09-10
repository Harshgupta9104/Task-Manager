import { useEffect, useState } from 'react';

/**
 * Returns `value`, delayed until it has stayed unchanged for `delayMs`.
 *
 * The raw value itself is available immediately (callers keep it in their own
 * state), so responsive UI — e.g. a search box — keeps up with typing while
 * work that depends on the debounced value (API requests) waits for a pause.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    // Re-armed on every value change: the pending timer is discarded, so
    // rapid updates only ever fire after the final pause in typing.
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
