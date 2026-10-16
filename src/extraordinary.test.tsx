import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { App } from './App';
import { Extraordinary } from './pages/Extraordinary';
import { recoveryBacklog } from './features/participants/recovery-backlog';
import { previewData } from './dev/preview';

const event = { id: 'demo-recovery', type: 'backlog-recovery', title: 'Extraordinarios',
  startAt: '2026-10-17T12:00:00Z', endAt: '2026-10-19T12:00:00Z', problemTimeSeconds: 86400 } as const;
const now = Date.parse('2026-10-17T14:00:00Z');

function fixture() {
  const data = structuredClone(previewData);
  data.generatedAt = new Date(now).toISOString();
  data.event.extraordinaryEvents = [{ ...event }];
  const first = data.days[0];
  data.days = [first, ...[16, 17].map(day => ({ ...structuredClone(first), id: `demo-day-${day}`,
    date: `2026-10-${day}`, releaseAt: `2026-10-${day}T12:00:00Z`,
    problems: first.problems.map((p, i) => ({ ...p, titleSlug: `demo-day-${day}-${i}`, title: `Day ${day} problem ${i}`,
      url: `https://leetcode.com/problems/demo-day-${day}-${i}/` })) as typeof first.problems }))];
  const base = data.participants[0];
  const results = data.days.flatMap(day => day.problems.map(p => ({ titleSlug: p.titleSlug, firstAcceptedAt: null as string | null })));
  data.participants = [
    { ...base, participant_id: 'some', display_name: 'Some Pending', leetcode_username: 'some',
      results: results.map((r, i) => ({ ...r, firstAcceptedAt: i === 0 ? '2026-10-01T14:00:00Z' : null })) },
    { ...base, participant_id: 'done', display_name: 'All Done', leetcode_username: 'done',
      results: results.map((r, i) => ({ ...r, firstAcceptedAt: i < 2 ? '2026-10-01T14:00:00Z' : i < 4 ? '2026-10-16T14:00:00Z' : null })) },
    { ...base, participant_id: 'most', display_name: 'Most Pending', leetcode_username: 'most', results },
  ];
  return data;
}

beforeEach(() => { vi.stubEnv('BASE_URL', '/codetober/2026/'); });

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); vi.unstubAllGlobals(); window.history.replaceState(null, '', '/codetober/2026/'); });

test('backlog orders by pending count, excludes new weekend problems and updates after acceptance', () => {
  const data = fixture();
  let people = recoveryBacklog(data, event, now);
  expect(people.map(p => [p.person.participant_id, p.pending.length])).toEqual([['most', 4], ['some', 3], ['done', 0]]);
  expect(people.flatMap(p => p.pending).some(p => p.day.date === '2026-10-17')).toBe(false);
  expect(recoveryBacklog(data, event, Date.parse('2026-10-16T18:00:00Z'))[0].pending).toHaveLength(2);
  data.participants[2].results[0].firstAcceptedAt = '2026-10-17T13:00:00Z';
  people = recoveryBacklog(data, event, now);
  expect(people.find(p => p.person.participant_id === 'most')!.pending).toHaveLength(3);
  expect(data.participants[2].rank).toBe(fixture().participants[2].rank);
});

test('event page lists participants, filters by username and links to pending problems without another countdown', () => {
  const data = fixture();
  render(<Extraordinary data={data} event={event} now={now} zone="America/Mexico_City" />);
  expect(screen.queryByRole('timer')).toBeNull();
  const entries = document.querySelectorAll('.recovery-participant-summary');
  expect(entries[0]).toHaveTextContent('Most Pending');
  expect(entries[0]).toHaveTextContent('4 pending');
  expect(screen.getByText('All caught up ✓')).toBeInTheDocument();
  fireEvent.click(entries[0]);
  const links = within(entries[0].closest('details')!).getAllByRole('link');
  expect(links).toHaveLength(4);
  expect(links[0]).toHaveAttribute('href', data.days[0].problems[0].url);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'DONE' } });
  expect(screen.getByText('All Done')).toBeVisible();
  expect(screen.queryByText('Most Pending')).toBeNull();
});

test('banner opens the event tab, menu closes on selection, and only the header contains a timer', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(now);
  window.history.replaceState(null, '', '/codetober/2026/');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => fixture() }));
  render(<App />);
  const banner = await screen.findByRole('link', { name: 'View Extraordinarios: rules and pending problems' });
  expect(screen.getAllByRole('timer')).toHaveLength(1);
  fireEvent.click(banner);
  window.history.replaceState(null, '', '/codetober/2026/#extraordinarios');
  fireEvent(window, new HashChangeEvent('hashchange'));
  expect(screen.getByRole('tab', { name: 'Extraordinarios' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('heading', { name: 'Overdue problems by participant' })).toBeVisible();
  const toggle = screen.getByRole('button', { name: 'Toggle navigation menu' });
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(screen.getByRole('tab', { name: 'Scoreboard' }));
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(window.location.hash).toBe('');
  expect(screen.getByRole('tab', { name: 'Scoreboard' })).toHaveAttribute('aria-selected', 'true');
});

test('temporary event tab disappears after closing while historical direct links still work', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(Date.parse(event.endAt));
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => fixture() }));
  window.history.replaceState(null, '', '/codetober/2026/');
  const { unmount } = render(<App />);
  await screen.findByText('@most');
  expect(screen.queryByRole('tab', { name: 'Extraordinarios' })).toBeNull();
  expect(screen.queryByRole('timer')).toBeNull();
  unmount();
  window.history.replaceState(null, '', '/codetober/2026/#extraordinarios');
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Overdue problems by participant' })).toBeVisible();
});
