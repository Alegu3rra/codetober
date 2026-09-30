import React from 'react';
import { render, screen, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { About } from './pages/About';
import { Scoreboard } from './pages/Scoreboard';
import { dataSchema } from './data';
import { previewData } from './dev/preview';
import { useEventData } from './hooks/useEventData';

afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); window.history.replaceState(null, '', '/'); });
test('registration includes all October 30 and closes at Guadalajara midnight', () => {
  vi.stubEnv('VITE_JOIN_FORM_URL', 'https://forms.gle/F4ugB4s2nxjvi1Av8');
  const { rerender, container } = render(<About now={Date.parse('2026-10-30T23:59:59-06:00')} />);
  expect(screen.getByRole('link', { name: /Open registration form/ })).toHaveAttribute('href', 'https://forms.gle/F4ugB4s2nxjvi1Av8');
  expect(container.querySelector('iframe')).toBeNull();
  rerender(<About now={Date.parse('2026-10-31T00:00:00-06:00')} />);
  expect(screen.queryByRole('link', { name: /Open registration form/ })).not.toBeInTheDocument();
  expect(screen.getByText(/Registration is closed/)).toBeVisible();
});
test('ranks are hidden before the start and appear at release time', () => {
  const { rerender } = render(<Scoreboard data={previewData} zone="America/Mexico_City" now={Date.parse('2026-10-01T11:59:59Z')} />);
  expect(screen.queryByLabelText('Rank 1')).not.toBeInTheDocument();
  expect(screen.getByText('Example Participant')).toBeVisible();
  expect(screen.getByPlaceholderText('Search name or username participant')).toBeVisible();
  rerender(<Scoreboard data={previewData} zone="America/Mexico_City" now={Date.parse('2026-10-01T12:00:00Z')} />);
  expect(screen.getByLabelText('Rank 1')).toBeVisible();
});
test('synthetic local preview respects the normal public schema', () => {
  const data = dataSchema.parse(previewData);
  expect(data.demo).toBe(true);
  expect(data.days[0].problems).toHaveLength(2);
});
test('development preview loads synthetic data without querying the public feed', async () => {
  vi.stubEnv('DEV', true);
  window.history.replaceState(null, '', '/codetober/2026/?preview=1');
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
  const { result } = renderHook(() => useEventData());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data?.days[0].title).toBe('Local interface preview');
  expect(result.current.now).toBe(Date.parse('2026-10-01T18:00:00Z'));
  expect(fetcher).not.toHaveBeenCalled();
});
test('production ignores the preview parameter and fetches only public data', async () => {
  vi.stubEnv('DEV', false);
  window.history.replaceState(null, '', '/codetober/2026/?preview=1');
  const published = { ...previewData, demo: false, days: [], participants: [] };
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => published });
  vi.stubGlobal('fetch', fetcher);
  const { result } = renderHook(() => useEventData());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data?.days).toEqual([]);
  expect(result.current.data?.demo).toBe(false);
  expect(fetcher).toHaveBeenCalledOnce();
});
