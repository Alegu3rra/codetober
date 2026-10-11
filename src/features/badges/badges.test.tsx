import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ParticipantBadges } from './ParticipantBadges';
import { featuredBadges } from './catalog';
import type { ParticipantBadge } from './schema';
import { dataSchema } from '../../data/schema';
import { previewData } from '../../dev/preview';

const badge = (id: string, category: ParticipantBadge['category'], evidence = {}): ParticipantBadge => ({
  id, category, ruleVersion: 1, evaluatedAt: '2026-10-03T18:00:00Z', evidence,
});
test('compact cards select one topic, constancy label and achievement; details retain all labels', () => {
  const badges = [badge('topic-dp', 'topic', { solved: 4 }), badge('topic-graphs', 'topic', { solved: 2 }),
    badge('on-fire', 'consistency', { days: 3 }), badge('hard-hunter', 'achievement', { solved: 3 }),
    badge('extra-mile', 'activity', { qualifyingDays: 3, windowDays: 7, extraProblems: 2 })];
  expect(featuredBadges(badges).map(b => b.id)).toEqual(['topic-dp', 'on-fire', 'extra-mile']);
  const view = render(<ParticipantBadges badges={badges} compact />);
  expect(screen.getAllByRole('button')).toHaveLength(3);
  view.rerender(<ParticipantBadges badges={badges} />);
  expect(screen.getAllByRole('button')).toHaveLength(5);
});
test('tooltips expose measured evidence on focus and touch and dismiss with Escape or blur', () => {
  render(<ParticipantBadges badges={[badge('accepted-burst', 'activity', { qualifyingDays: 3, windowDays: 5, maxGapSeconds: 120 })]} />);
  const trigger = screen.getByRole('button', { name: /Aceptados en ráfaga/ });
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  fireEvent.focus(trigger);
  expect(trigger).toHaveAccessibleDescription(/no mide el tiempo de resolución ni demuestra uso de IA/);
  fireEvent.keyDown(trigger, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  fireEvent.click(trigger);
  expect(screen.getByRole('tooltip')).toHaveTextContent('3 de las últimas 5');
  fireEvent.blur(trigger);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});
test('old snapshots remain valid; badge evidence survives parsing and unknown labels are hidden', () => {
  const data = structuredClone(previewData);
  delete data.participants[0].badges;
  expect(dataSchema.parse(data).participants[0].badges).toBeUndefined();
  data.participants[0].badges = [badge('extra-time', 'achievement', { extraProblems: 2 })];
  expect(dataSchema.parse(data).participants[0].badges?.[0].evidence.extraProblems).toBe(2);
  render(<ParticipantBadges badges={[badge('unknown-label', 'activity')]} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
