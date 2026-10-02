import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { Scoreboard } from './pages/Scoreboard';
import { previewData } from './dev/preview';
import { orderedParticipants } from './data';
afterEach(cleanup);
test('compact rows preserve shared ranks, profile links and independently expandable progress', () => {
  render(<Scoreboard data={previewData} now={Date.parse(previewData.generatedAt)} zone="America/Mexico_City" />);
  const names=screen.getAllByRole('heading',{level:2}).map(el=>el.textContent);
  expect(names).toEqual(['Golden Example ↗','Zoe Quick ↗','Example Participant ↗']);
  expect(screen.getAllByLabelText('Rank 2')).toHaveLength(2);
  expect(screen.queryByText('Days complete')).not.toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Zoe Quick'})).toHaveAttribute('href','https://leetcode.com/u/fictional_quick/');
  const button=screen.getByRole('button',{name:'Expand progress for Zoe Quick'});
  expect(button).toHaveAttribute('aria-expanded','false');
  const panel=document.getElementById(button.getAttribute('aria-controls')!)!;
  expect(panel).not.toBeVisible();
  fireEvent.click(button);
  expect(panel).toBeVisible();
  expect(panel.querySelectorAll('.day-progress')).toHaveLength(3);
  expect(panel).toHaveTextContent('2h 0m 0s');
  expect(button).toHaveAttribute('aria-expanded','true');
  fireEvent.click(button); expect(panel).not.toBeVisible();
});
test('visual ties use longest best streak then name after elapsed time', () => {
  const p=previewData.participants[1];
  const data={...previewData,participants:[
    {...p,participant_id:'a',display_name:'Amy',bestStreak:1,completionTimeSeconds:4000},
    {...p,participant_id:'b',display_name:'Zoe',bestStreak:2,completionTimeSeconds:4000},
    {...p,participant_id:'c',display_name:'Bea',bestStreak:1,completionTimeSeconds:4000},
  ]};
  expect(orderedParticipants(data).map(p=>[p.display_name,p.rank])).toEqual([['Zoe',1],['Amy',1],['Bea',1]]);
});
