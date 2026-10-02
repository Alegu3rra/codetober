import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { App } from './App';
import { dataURL, dataSchema, filterParticipants, formURL, type EventData } from './data';

const fixture: EventData = { version: 1, demo: true, generatedAt: '2026-10-01T13:00:00Z', lastSuccessfulSyncAt: '2026-10-01T13:00:00Z', participantsLastSuccessAt: '2026-10-01T13:00:00Z', participantsFailed: false,
  event: { timezone: 'America/Mexico_City', startAt: '2026-10-01T12:00:00Z', closeAt: '2026-11-01T12:00:00Z', totalProblems: 62, schedule: [{ date: '2026-10-01', releaseAt: '2026-10-01T12:00:00Z' }, { date: '2026-10-02', releaseAt: '2026-10-02T12:00:00Z' }] },
  days: [{ id: 'example', date: '2026-10-01', title: 'Example day', releaseAt: '2026-10-01T12:00:00Z', problems: [
    { titleSlug: 'example-one', title: 'Example one', difficulty: 'Easy', url: 'https://leetcode.com/problems/example-one/' },
    { titleSlug: 'example-two', title: 'Example two', difficulty: 'Medium', url: 'https://leetcode.com/problems/example-two/' },
  ] }],
  participants: [{ participant_id: 'fictional', display_name: 'Example Coder', leetcode_username: 'fictional_coder', rank: 1, problemsCompleted: 0, daysCompleted: 0, currentStreak: 0, bestStreak: 0, lastSyncedAt: null, syncFailed: true, results: [{ titleSlug: 'example-one', firstAcceptedAt: null }, { titleSlug: 'example-two', firstAcceptedAt: null }] }],
};
beforeEach(() => { vi.stubEnv('VITE_JOIN_FORM_EMBED_URL', ''); vi.stubEnv('VITE_JOIN_FORM_URL', ''); vi.stubEnv('BASE_URL', '/codetober/2026/'); window.history.replaceState(null, '', '/codetober/2026/'); vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => fixture })); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
test('base-path aware data and safe form URLs', () => {
  expect(new URL(dataURL('/codetober/2026/data/')).pathname).toBe('/codetober/2026/data/data.json');
  expect(dataURL('https://example.invalid/public')).toBe('https://example.invalid/public/data.json');
  expect(formURL('javascript:alert(1)')).toBeNull();
  expect(formURL('https://evil.invalid/forms/')).toBeNull();
  expect(formURL('https://forms.gle/example')).toBeTruthy();
  expect(formURL('https://forms.gle/example', true)).toBeNull();
});
test('search by name and username ignores case and whitespace', () => {
  expect(filterParticipants(fixture.participants, ' EXAMPLE ')).toHaveLength(1);
  expect(filterParticipants(fixture.participants, 'FICTIONAL_')).toHaveLength(1);
  expect(filterParticipants(fixture.participants, 'missing')).toHaveLength(0);
});
test('keyboard tabs, search, participant details and error labels', async () => {
  render(<App />);
  await screen.findByRole('heading', { name: 'Problems' });
  fireEvent.keyDown(screen.getByRole('tab', { name: 'Problems' }), { key: 'ArrowRight' });
  const tab = screen.getByRole('tab', { name: 'Scoreboard' }); expect(tab).toHaveFocus(); expect(tab).toHaveAttribute('aria-selected','true');
  expect(screen.getByText('Example Coder')).toBeVisible();
  expect(screen.getByText(/⚠ Query failed/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Expand progress for Example Coder' }));
  expect(screen.getByText(/Last query failed/)).toBeVisible();
  expect(screen.getAllByText(/No accepted submission recorded/).length).toBeGreaterThan(0);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'not-a-user' } });
  expect(screen.getByText('No participants match your search.')).toBeVisible();
  fireEvent.keyDown(tab, { key: 'End' });
  expect(screen.getByRole('tab', { name: 'About / Join' })).toHaveFocus();
  expect(screen.getByText(/Registration closes October 30/)).toBeVisible();
});
test('request failures have retry, and About remains available', async () => {
  vi.mocked(fetch).mockRejectedValue(Error('offline'));
  render(<App />); expect(await screen.findByRole('alert')).toHaveTextContent('Could not load');
  fireEvent.click(screen.getByRole('tab', { name: 'About / Join' }));
  expect(screen.getByText(/Hello, I’m Alejandra/)).toBeVisible();
  vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => fixture } as Response);
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await screen.findByText(/Local demo/);
});
test('empty snapshot before event discloses no problems', async () => {
  const data = { ...fixture, days: [], participants: [] };
  vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => data } as Response);
  render(<App />);
  expect(await screen.findByText(/No problems published yet. The first pair/)).toBeVisible();
  expect(screen.queryByText('Example one')).not.toBeInTheDocument();
});
test('invalid snapshot cannot expose future results', () => {
  const data = structuredClone(fixture); data.participants[0].results.push({ titleSlug: 'unreleased', firstAcceptedAt: null });
  expect(dataSchema.safeParse(data).success).toBe(false);
  const future = structuredClone(fixture); future.days[0].releaseAt = '2026-10-05T12:00:00Z';
  expect(dataSchema.safeParse(future).success).toBe(false);
});
test('legacy snapshots still load and normalize participant source status', () => {
  const { participantsLastSuccessAt, participantsFailed, ...rest } = fixture;
  const parsed = dataSchema.parse({ ...rest, sheetsLastSuccessAt: participantsLastSuccessAt, sheetsFailed: true });
  expect(parsed.participantsFailed).toBe(true);
  expect(parsed.participantsLastSuccessAt).toBe(participantsLastSuccessAt);
  expect(parsed).not.toHaveProperty('sheetsFailed');
});

test('missing previous edition uses the site design without fetching current results', () => {
  window.history.replaceState(null, '', '/codetober/2025/');
  render(<App />);
  expect(screen.getByRole('heading', { name: '404 not found' })).toBeVisible();
  expect(screen.getByText('The 2025 edition is not available.')).toBeVisible();
  expect(screen.getByRole('banner')).toBeVisible();
  expect(screen.getByRole('contentinfo')).toBeVisible();
  expect(fetch).not.toHaveBeenCalled();
});
