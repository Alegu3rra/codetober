import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { RecoveryCountdown } from './components/RecoveryCountdown';
import { SiteHeader } from './components/SiteHeader';
import { Home } from './pages/Home';
import { Scoreboard } from './pages/Scoreboard';
import { previewData } from './dev/preview';
import { dataSchema } from './data/schema';
import { rankingTime, problemRankingTime } from './features/ranking/time';
import { recoveryEventFor } from '../shared/extraordinary-events.mjs';
import { ParticipantDetails } from './components/ParticipantDetails';
import { RecoveryNotice } from './components/RecoveryNotice';
import { rankTarget } from './rank-target';
import { onTimeProblemsCompleted } from './features/participants/progress';

const extraordinaryEvent = {"id": "2026-extraordinarios-october", "type": "backlog-recovery", "title": "Extraordinarios", "startAt": "2026-10-17T06:00:00-06:00", "endAt": "2026-10-19T06:00:00-06:00", "problemTimeSeconds": 86400} as const;

function fixture(acceptedAt: string | null = '2026-10-17T12:00:00Z') {
  const data = structuredClone(previewData);
  data.generatedAt = '2026-10-20T12:00:00Z';
  data.event.extraordinaryEvents = [{ ...extraordinaryEvent }];
  data.days = [data.days[0]];
  data.participants = [{ ...data.participants[0], problemsCompleted: acceptedAt ? 1 : 0,
    results: data.days[0].problems.map((p, i) => ({ titleSlug: p.titleSlug, firstAcceptedAt: i ? null : acceptedAt })) }];
  return dataSchema.parse(data);
}

test('recovery history counts a fixed day, keeps raw elapsed time and survives later snapshots', () => {
  for (const at of ['2026-10-17T12:00:00Z', '2026-10-19T11:59:59Z']) {
    const data = fixture(at), person = data.participants[0];
    const time = problemRankingTime(person, data.days[0], person.results[0].titleSlug, data)!;
    expect(time.totalSeconds).toBe(86400);
    expect(time.penaltySeconds).toBe(0);
    expect(time.elapsedSeconds - time.recoveryCreditSeconds).toBe(86400);
    expect(rankingTime(person, data).totalSeconds).toBe(86400);
    expect(rankingTime(person, data).recoveredProblems).toBe(1);
    expect(onTimeProblemsCompleted(person, data)).toBe(0);
    data.generatedAt = '2026-10-31T23:00:00Z';
    expect(rankingTime(person, data).totalSeconds).toBe(86400);
  }
});

test('before opening, at closing, previously solved and weekend new problems retain normal costs', () => {
  for (const at of ['2026-10-17T11:59:59Z', '2026-10-19T12:00:00Z', '2026-10-16T12:00:00Z']) {
    const data = fixture(at), person = data.participants[0];
    const time = rankingTime(person, data);
    expect(time.penaltySeconds).toBe(86400);
    expect(time.totalSeconds).toBe(time.elapsedSeconds + 86400);
  }
  for (const date of ['2026-10-17', '2026-10-18']) {
    const data = fixture('2026-10-19T11:00:00Z');
    data.days[0].date = date; data.days[0].releaseAt = `${date}T12:00:00Z`;
    const time = rankingTime(data.participants[0], data);
    expect(time.recoveredProblems).toBeUndefined();
    expect(time.penaltySeconds).toBe(date.endsWith('17') ? 86400 : 0);
  }
  const data = fixture(); delete data.event.extraordinaryEvents;
  expect(rankingTime(data.participants[0], data).penaltySeconds).toBe(86400);
});

test('editorial deductions still apply and recovered history explains its fixed cost', () => {
  const data = fixture(), person = data.participants[0];
  data.editorials = [{ id: 'demo-credit', participant_id: person.participant_id, titleSlug: person.results[0].titleSlug,
    publishedAt: '2026-10-02T12:00:00Z', rankingCreditSeconds: 3600, authorName: person.display_name,
    username: person.leetcode_username, idea: 'Demo', solution: '', filename: '', language: 'C++', complexity: 'O(n)' }];
  expect(rankingTime(person, data).totalSeconds).toBe(82800);
  render(<ParticipantDetails person={person} data={data} zone="America/Mexico_City" />);
  expect(screen.getByText('Extraordinarios · 24h total')).toBeInTheDocument();
  expect(screen.getByTitle(/fixed 24 hours total, no late penalty/)).toHaveTextContent('24h 0m 0s');
});

test('pending suggestions qualify only during the recovery window', () => {
  const data = fixture(null), person = data.participants[0];
  for (const [at, eligible] of [['2026-10-17T11:59:59Z', false], ['2026-10-17T12:00:00Z', true],
    ['2026-10-19T11:59:59Z', true], ['2026-10-19T12:00:00Z', false]] as const) {
    expect(rankTarget(person, person, data, Date.parse(at)).pending.every(p => p.recoveryEligible === eligible)).toBe(true);
  }
});

test('notice explains upcoming, active and finished states', () => {
  const window = extraordinaryEvent;
  const { rerender } = render(<RecoveryNotice window={window} now={Date.parse('2026-10-16T18:00:00Z')} zone="America/Mexico_City" />);
  expect(screen.getByText('Extraordinarios · This weekend')).toBeVisible();
  rerender(<RecoveryNotice window={window} now={Date.parse(window.startAt)} zone="America/Mexico_City" />);
  expect(screen.getByText('Extraordinarios · Open now')).toBeVisible();
  rerender(<RecoveryNotice window={window} now={Date.parse(window.endAt)} zone="America/Mexico_City" />);
  expect(screen.getByText('Extraordinarios · Completed')).toBeVisible();
  expect(screen.getByText(/The benefit stays after the weekend/)).toBeVisible();
});


test('countdown switches from opening to closing at the exact boundaries and stops at closure', () => {
  const window = extraordinaryEvent;
  const { rerender } = render(<RecoveryCountdown window={window} now={Date.parse(window.startAt) - 1000} />);
  const timer = screen.getByRole('timer', { name: 'Extraordinarios countdown' });
  expect(timer).toHaveTextContent('Starts in');
  expect(timer).toHaveTextContent('00:00:01');
  rerender(<RecoveryCountdown window={window} now={Date.parse(window.startAt)} />);
  expect(timer).toHaveTextContent('Open now · ends in');
  expect(timer).toHaveTextContent('2d 00:00:00');
  rerender(<RecoveryCountdown window={window} now={Date.parse(window.endAt) - 1000} />);
  expect(timer).toHaveTextContent('00:00:01');
  rerender(<RecoveryCountdown window={window} now={Date.parse(window.endAt)} />);
  expect(timer).toHaveTextContent('Completed · earned benefits stay');
  expect(timer.querySelector('.countdown')).toBeNull();
  rerender(<RecoveryCountdown now={Date.now()} />);
  expect(screen.queryByRole('timer')).toBeNull();
});

test('only the header shows the live countdown; problems and scoreboard stay compact', () => {
  const data = fixture();
  function Page({ now }: { now: number }) {
    return <><SiteHeader recoveryWindow={recoveryEventFor(data.event.extraordinaryEvents, now)} now={now} />
      <div data-testid="problems"><Home data={data} now={now} zone="America/Mexico_City" /></div>
      <div data-testid="scoreboard"><Scoreboard data={data} now={now} zone="America/Mexico_City" /></div></>;
  }
  const now = Date.parse('2026-10-17T12:00:00Z');
  const { rerender } = render(<Page now={now} />);
  for (const area of [screen.getByRole('banner'), screen.getByTestId('problems'), screen.getByTestId('scoreboard')]) {
    if (area === screen.getByRole('banner')) expect(within(area).getByRole('timer')).toHaveTextContent('2d 00:00:00');
    else expect(within(area).queryByRole('timer')).toBeNull();
  }
  rerender(<Page now={now + 1000} />);
  const timers = screen.getAllByRole('timer');
  expect(timers).toHaveLength(1);
  timers.forEach(timer => expect(timer).toHaveTextContent('1d 23:59:59'));
});


test('an edition without extraordinary events shows no notice or countdown and retains late penalties', () => {
  const data = fixture(); delete data.event.extraordinaryEvents;
  const now = Date.parse('2026-10-17T12:00:00Z');
  const event = recoveryEventFor(data.event.extraordinaryEvents, now);
  expect(event).toBeUndefined();
  render(<><SiteHeader recoveryWindow={event} now={now} />
    <Home data={data} now={now} zone="America/Mexico_City" />
    <Scoreboard data={data} now={now} zone="America/Mexico_City" /></>);
  expect(screen.queryByRole('timer')).toBeNull();
  expect(screen.queryByLabelText('Extraordinarios weekend')).toBeNull();
  expect(rankingTime(data.participants[0], data).penaltySeconds).toBe(86400);
});
