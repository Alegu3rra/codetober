import React from 'react';
import { test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { previewData } from './dev/preview';
import { editorialCredit, rankingTime, orderedParticipants, type Editorial } from './data';
import { Scoreboard } from './pages/Scoreboard';
const makeData = () => {
  const data = structuredClone(previewData);
  const template = data.participants[0];
  const slug = data.days[0].problems[0].titleSlug;
  data.participants = [{ ...template, participant_id: 'author', display_name: 'Author', problemsCompleted: 1, results: [{ titleSlug: slug, firstAcceptedAt: '2026-10-01T14:00:00Z' }] },
    { ...template, participant_id: 'rival', display_name: 'Rival', problemsCompleted: 1, results: [{ titleSlug: slug, firstAcceptedAt: '2026-10-01T13:30:00Z' }] }];
  const editorial: Editorial = { id: 'credit-1', participant_id: 'author', titleSlug: slug, authorName: 'Author', username: 'author', publishedAt: '2026-10-02T12:00:00Z', rankingCreditSeconds: 3600,
    idea: 'A distinct reviewed implementation', solution: 'code', filename: 'solution.cpp', language: 'C++', complexity: 'O(n)' };
  data.editorials = [editorial];
  return data;
};
test('editorial credit changes time ranks, not points, and is visible separately from penalties', () => {
  const data = makeData();
  expect(orderedParticipants({ ...data, editorials: [] })[0].participant_id).toBe('rival');
  expect(orderedParticipants(data)[0].participant_id).toBe('author');
  expect(rankingTime(data.participants[0], data).totalSeconds).toBe(3600);
  render(<Scoreboard data={data} now={Date.parse(data.generatedAt)} zone="America/Mexico_City" />);
  fireEvent.click(screen.getByRole('button', { name: 'Expand progress for Author' }));
  expect(screen.getByText(/Editorial credit · 1 contribution/)).toBeVisible();
  expect(screen.getByText('−1h 0m 0s')).toBeVisible();
});
test('unique credit IDs, valid publication windows and author IDs protect legacy snapshots', () => {
  const data = makeData();
  const e = data.editorials![0];
  data.editorials = [e, e, { ...e, id: 'legacy', rankingCreditSeconds: undefined }, { ...e, id: 'other', participant_id: 'rival' },
    { ...e, id: 'future', publishedAt: '2026-11-03T12:00:00Z' }, { ...e, id: 'early', publishedAt: '2026-10-02T11:59:59Z' }, { ...e, id: 'hidden', titleSlug: 'unreleased' }];
  expect(editorialCredit(data.participants[0], data)).toEqual({ count: 1, seconds: 3600 });
  data.participants[0].results[0].firstAcceptedAt = '2026-10-01T12:10:00Z';
  expect(rankingTime(data.participants[0], data).totalSeconds).toBe(0);
});
