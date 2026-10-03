import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { Scoreboard } from './pages/Scoreboard';
import { previewData } from './dev/preview';
import { orderedParticipants } from './data';
afterEach(cleanup);
test('compact rows use unique ranks, profile links and independently expandable progress', () => {
  render(<Scoreboard data={previewData} now={Date.parse(previewData.generatedAt)} zone="America/Mexico_City" />);
  const names=screen.getAllByRole('heading',{level:2}).map(el=>el.textContent);
  expect(names).toEqual(['Golden Example ↗','Zoe Quick ↗','Example Participant ↗']);
  expect(screen.getAllByLabelText('Rank 2')).toHaveLength(1);
  expect(screen.queryByText('Days complete')).not.toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Zoe Quick'})).toHaveAttribute('href','https://leetcode.com/u/fictional_quick/');
  const button=screen.getByRole('button',{name:'Expand progress for Zoe Quick'});
  expect(button).toHaveAttribute('aria-expanded','false');
  const panel=document.getElementById(button.getAttribute('aria-controls')!)!;
  expect(panel).not.toBeVisible();
  fireEvent.click(button);
  expect(panel).toBeVisible();
  expect(panel.querySelectorAll('.day-progress')).toHaveLength(3);
  expect(panel).toHaveTextContent('First solve today');
  expect(panel).toHaveTextContent('No accepted solve recorded');
  expect(panel).not.toHaveTextContent('Total solve time');
  expect(button).toHaveAttribute('aria-expanded','true');
  fireEvent.click(button); expect(panel).not.toBeVisible();
});
test('identical daily acceptance histories fall back to best streak then name', () => {
  const p=previewData.participants[1];
  const data={...previewData,participants:[
    {...p,participant_id:'a',display_name:'Amy',bestStreak:1,completionTimeSeconds:4000},
    {...p,participant_id:'b',display_name:'Zoe',bestStreak:2,completionTimeSeconds:4000},
    {...p,participant_id:'c',display_name:'Bea',bestStreak:1,completionTimeSeconds:4000},
  ]};
  expect(orderedParticipants(data).map(p=>[p.display_name,p.rank])).toEqual([['Zoe',1],['Amy',2],['Bea',3]]);
});

test('first solve follows the 06:00 window, excludes backlog and keeps full precision', async () => {
  const { firstSolveToday } = await import('./data');
  const data = structuredClone(previewData);
  const p = data.participants.find(p=>p.leetcode_username==='fictional_preview')!;
  expect(firstSolveToday(p, data, Date.parse('2026-10-03T18:00:00Z'))).toBe('2026-10-03T14:00:00Z');
  // Yesterday has no solve of its own; late recovery of day one is not today's first.
  expect(firstSolveToday(p, data, Date.parse('2026-10-03T11:59:59Z'))).toBeNull();
  expect(firstSolveToday(p, data, Date.parse('2026-10-01T11:59:59Z'))).toBeNull();
});

test('on-time solves beat earlier first solve with equal totals, including legacy snapshots', async () => {
  const {onTimeProblemsCompleted}=await import('./data');
  const data=structuredClone(previewData);
  const template=data.participants[0];
  const results=(late:boolean)=>data.days.slice(0,2).flatMap((day,i)=>day.problems.map((p,j)=>({titleSlug:p.titleSlug,
    firstAcceptedAt:i===1 && j===1 && late ? '2026-10-03T13:34:00Z' : `2026-10-0${i+1}T${late ? '13' : '14'}:00:00Z`})));
  data.participants=[{...template,participant_id:'early',display_name:'Early',problemsCompleted:4,results:results(true)},
    {...template,participant_id:'timely',display_name:'Timely',problemsCompleted:4,results:results(false)}];
  expect(data.participants[0].onTimeProblemsCompleted).toBeUndefined();
  expect(onTimeProblemsCompleted(data.participants[0],data)).toBe(3);
  expect(orderedParticipants(data).map(p=>[p.participant_id,p.rank])).toEqual([['timely',1],['early',2]]);
  data.participants[0].problemsCompleted=5;
  expect(orderedParticipants(data)[0].participant_id).toBe('early');
});

test('on-time count excludes early, next-window, future and post-event acceptances', async () => {
  const {onTimeProblemsCompleted}=await import('./data');
  const data=structuredClone(previewData);
  const p=data.participants[0];
  const [first,second]=data.days[0].problems;
  p.results=[{titleSlug:first.titleSlug,firstAcceptedAt:data.days[0].releaseAt},
    {titleSlug:second.titleSlug,firstAcceptedAt:data.event.schedule[1].releaseAt}];
  expect(onTimeProblemsCompleted(p,data)).toBe(1);
  p.results[0].firstAcceptedAt='2026-10-01T11:59:59Z';
  expect(onTimeProblemsCompleted(p,data)).toBe(0);
  p.results[0].firstAcceptedAt=data.event.closeAt;
  expect(onTimeProblemsCompleted(p,data)).toBe(0);
  p.results[0].firstAcceptedAt='2026-10-01T13:00:00Z';
  data.generatedAt='2026-10-01T12:00:00Z';
  expect(onTimeProblemsCompleted(p,data)).toBe(0);
});
