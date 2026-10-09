import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { previewData } from './dev/preview';
import { orderedParticipants, rankingTime } from './data';
import { rankTarget } from './rank-target';
import { ParticipantDetails } from './components/ParticipantDetails';
import { Scoreboard } from './pages/Scoreboard';

afterEach(cleanup);
const now = Date.parse(previewData.generatedAt);
const zone = 'America/Mexico_City';

test('points target distinguishes tying from a guaranteed lead and prioritizes on-time pending problems', () => {
  const [leader, second, third] = orderedParticipants(previewData);
  const target = rankTarget(second, leader, previewData, now);
  expect(target.pointsToTie).toBe(3);
  expect(target.pointsToLead).toBe(4);
  expect(target.pending).toHaveLength(3);
  expect(target.availableOnTime).toBe(2);
  expect(target.pending[0]).toMatchObject({ date: '2026-10-03', onTime: true, deadline: '2026-10-04T12:00:00.000Z' });
  expect(target.pending.at(-1)).toMatchObject({ date: '2026-10-01', onTime: false });
  const tied = rankTarget(third, second, previewData, now);
  expect(tied.pointsToTie).toBe(0);
  expect(tied.pointsToLead).toBe(1);
  expect(tied.ownTime.lateProblems).toBe(1);
  expect(tied.ownTime.penaltySeconds).toBe(86400);
  expect(tied.timeGapSeconds).toBe(53 * 3600);
  expect(tied.savingsPerProblemSeconds! * tied.recoveryProblems).toBeGreaterThan(tied.timeGapSeconds);
});

test('time deficit includes both solves and keeps exact seconds', () => {
  const data = structuredClone(previewData);
  const rival = data.participants[0];
  const person = { ...rival, participant_id: 'later', results: rival.results.map(result => ({ ...result })) };
  person.results.at(-1)!.firstAcceptedAt = '2026-10-03T15:20:05Z';
  person.results.at(-2)!.firstAcceptedAt = '2026-10-03T15:20:05Z';
  data.participants = [person, rival];
  render(<Scoreboard data={data} now={now} zone={zone} />);
  fireEvent.click(screen.getAllByRole('button', { name: 'Expand progress for Golden Example' })[1]);
  expect(screen.getByRole('region', { name: 'Next rank for Golden Example' })).toHaveTextContent('0h 40m 10s');
});

test('search keeps the true rival even when that rival is hidden and first place has no target', () => {
  render(<Scoreboard data={previewData} now={now} zone={zone} />);
  fireEvent.click(screen.getByRole('button', { name: 'Expand progress for Golden Example' }));
  expect(screen.getByText('You lead the ranking')).toBeVisible();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'fictional_preview' } });
  fireEvent.click(screen.getByRole('button', { name: 'Expand progress for Example Participant' }));
  const panel = screen.getByRole('region', { name: 'Next rank for Example Participant' });
  expect(panel).toHaveTextContent('To reach #2, you need:');
  expect(panel).not.toHaveTextContent('Solve 1 more problem');
  expect(panel).not.toHaveTextContent('Ranking time:');
  expect(panel).not.toHaveTextContent('published problems pending');
  expect(within(panel).queryByRole('link')).toBeNull();
  expect(panel).toHaveTextContent('Over the next 5 problems');
  expect(panel).toHaveTextContent('without new late penalties');
});

test('unpublished problems and invalid acceptance dates do not become completed or actionable early', () => {
  const data = structuredClone(previewData);
  const person = data.participants[1];
  const rival = data.participants[0];
  person.results[0].firstAcceptedAt = '2026-10-01T11:59:59Z';
  const target = rankTarget(person, rival, data, Date.parse('2026-10-03T11:59:59Z'));
  expect(target.pending.some(problem => problem.date === '2026-10-03')).toBe(false);
  expect(target.pending.some(problem => problem.titleSlug === person.results[0].titleSlug)).toBe(true);
  const afterDeadline = rankTarget(person, rival, data, Date.parse('2026-10-04T12:00:00Z'));
  expect(afterDeadline.availableOnTime).toBe(0);
});

test('closed events show final gaps, and full scores cannot be passed by adding points', () => {
  render(<Scoreboard data={previewData} now={Date.parse(previewData.event.closeAt)} zone={zone} />);
  fireEvent.click(screen.getByRole('button', { name: 'Expand progress for Zoe Quick' }));
  const panel = screen.getByRole('region', { name: 'Next rank for Zoe Quick' });
  expect(panel).toHaveTextContent('Final gap to #1');
  expect(panel).not.toHaveTextContent('Solve 4 more');
  expect(within(panel).queryByRole('link')).toBeNull();
  expect(rankTarget(previewData.participants[1], { ...previewData.participants[0], problemsCompleted: 62 }, previewData, now).possiblePointsLead).toBe(false);
});

test('no rank targets appear before the challenge begins', () => {
  render(<Scoreboard data={previewData} now={Date.parse(previewData.event.startAt) - 1} zone={zone} />);
  fireEvent.click(screen.getByRole('button', { name: 'Expand progress for Zoe Quick' }));
  expect(screen.queryByRole('region', { name: 'Next rank for Zoe Quick' })).toBeNull();
  expect(screen.queryByText(/for a points lead/)).toBeNull();
});


test('legacy snapshots add exactly 24h once per late problem and ignore invalid acceptances', () => {
  const data=structuredClone(previewData);
  const p=data.participants[0];
  p.results=[{titleSlug:data.days[0].problems[0].titleSlug,firstAcceptedAt:'2026-10-02T12:00:00Z'},
    {titleSlug:data.days[0].problems[0].titleSlug,firstAcceptedAt:'2026-10-03T12:00:00Z'},
    {titleSlug:data.days[0].problems[1].titleSlug,firstAcceptedAt:'2026-10-01T11:59:59Z'}];
  expect(rankingTime(p,data)).toEqual({elapsedSeconds:86400,lateProblems:1,penaltySeconds:86400,editorialCreditSeconds:0,creditedEditorials:0,totalSeconds:172800});
  p.results[0].firstAcceptedAt='2026-10-02T11:59:59Z';
  expect(rankingTime(p,data).penaltySeconds).toBe(0);
  p.results=[{titleSlug:data.days[0].problems[0].titleSlug,firstAcceptedAt:data.event.closeAt}];
  expect(rankingTime(p,data).totalSeconds).toBe(0);
});

test('a participant can recover a late penalty through faster future submissions', () => {
  const data=structuredClone(previewData);
  const template=data.participants[0];
  const result=(day:number, index:number, time:string)=>({titleSlug:data.days[day].problems[index].titleSlug,firstAcceptedAt:time});
  const comeback={...template,participant_id:'comeback',problemsCompleted:2,results:[result(0,0,'2026-10-02T13:00:00Z'),result(0,1,'2026-10-01T12:00:00Z')]};
  const timely={...template,participant_id:'timely',problemsCompleted:2,results:[result(0,0,'2026-10-02T11:00:00Z'),result(0,1,'2026-10-02T11:00:00Z')]};
  data.participants=[comeback,timely];
  expect(orderedParticipants(data)[0].participant_id).toBe('timely');
  for (const p of [comeback,timely]) {
    p.problemsCompleted=4;
    p.results.push(result(1,0,p===comeback?'2026-10-02T13:00:00Z':'2026-10-02T15:00:00Z'),result(1,1,p===comeback?'2026-10-02T13:00:00Z':'2026-10-02T15:00:00Z'));
  }
  expect(orderedParticipants(data)[0].participant_id).toBe('comeback');
});


test('points gaps show problem targets instead of time recovery', () => {
  render(<Scoreboard data={previewData} now={now} zone={zone} />);
  fireEvent.click(screen.getByRole('button', {name:'Expand progress for Zoe Quick'}));
  const panel=screen.getByRole('region',{name:'Next rank for Zoe Quick'});
  expect(panel).toHaveTextContent('To reach #1, you need:');
  expect(panel).toHaveTextContent('Solve 3 more problems');
  expect(panel).not.toHaveTextContent('Recover more than');
  expect(panel).not.toHaveTextContent('Over the next');
});

test('ranking time and late penalty explain their meaning on focus and dismiss on Escape', () => {
  render(<Scoreboard data={previewData} now={now} zone={zone} />);
  fireEvent.click(screen.getByRole('button',{name:'Expand progress for Example Participant'}));
  const trigger=screen.getByRole('button',{name:'About ranking time'});
  const tooltip=document.getElementById(trigger.getAttribute('aria-describedby')!)!;
  expect(tooltip).not.toBeVisible();
  fireEvent.focus(trigger);
  expect(tooltip).toBeVisible();
  expect(tooltip).toHaveTextContent('plus late penalties');
  expect(tooltip).toHaveTextContent('minus one hour per editorial');
  fireEvent.keyDown(trigger,{key:'Escape'});
  expect(tooltip).not.toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'About late penalty'}));
  expect(screen.getByRole('tooltip')).toHaveTextContent('24 hours added once');
});


test('problem history shows each counted contribution on the right, including late penalties', () => {
  const person=previewData.participants.find(p=>p.leetcode_username==='fictional_preview')!;
  const {container}=render(<ParticipantDetails person={person} data={previewData} zone={zone} />);
  fireEvent.click(screen.getByText('View problem history · 6 problems'));
  const times=[...container.querySelectorAll('.result-time')];
  expect(times.map(el=>el.firstChild?.textContent)).toEqual(['2h 0m 0s','51h 0m 0s','—','—','2h 0m 0s','—']);
  expect(times[1]).toHaveTextContent('Includes +24h late');
  expect(times[1]).toHaveAttribute('title','27h 0m 0s since publication + 24h late penalty');
  expect(rankingTime(person,previewData).totalSeconds).toBe((2+51+2)*3600);
});
