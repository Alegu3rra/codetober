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
  expect(names).toEqual(['Golden Example ↗','Example Participant ↗','Zoe Quick ↗']);
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
