import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
afterEach(() => cleanup());

// Existing test snapshots belong to 2026. Keep their edition stable when a new
// year is announced; announced-edition.test.tsx supplies its own two-year registry.
vi.mock('./editions.json', () => ({ default: { latestYear: 2026, editions: [{
  year: 2026, announced: true, startAt: '2026-10-01T06:00:00-06:00',
  closeAt: '2026-11-01T06:00:00-06:00', registrationCloseAt: '2026-10-31T00:00:00-06:00',
  registrationUrl: 'https://forms.gle/F4ugB4s2nxjvi1Av8', snapshot: 'data/data.json',
}] } }));
