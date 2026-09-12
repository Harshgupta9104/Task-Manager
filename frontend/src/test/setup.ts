import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom does not implement window.matchMedia. Components such as useCountUp
// use it to respect prefers-reduced-motion, so provide a no-op stub that
// reports "motion allowed" (matches: false).
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList) as typeof window.matchMedia;
}

// Unmount everything rendered by a test so tests stay isolated.
afterEach(() => {
  cleanup();
});
