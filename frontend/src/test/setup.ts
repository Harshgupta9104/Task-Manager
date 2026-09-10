import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount everything rendered by a test so tests stay isolated.
afterEach(() => {
  cleanup();
});
