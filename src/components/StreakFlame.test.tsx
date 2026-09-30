import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { StreakFlame } from './StreakFlame';

test('mixed best streak has an accessible description and a proportional gradient', () => {
  const { container } = render(<><StreakFlame value={2} goldRatio={0.5} label="2-day best streak · 1 golden day" /><StreakFlame value={0} goldRatio={0} label="No active streak" /></>);
  expect(screen.getByRole('img', { name: '2-day best streak · 1 golden day' })).toHaveAttribute('tabindex', '0');
  expect(container.querySelector('linearGradient stop')).toHaveAttribute('offset', '47%');
  const gradients = [...container.querySelectorAll('linearGradient')];
  expect(gradients[0].id).not.toEqual(gradients[1].id);
  expect(screen.getByRole('img', {name: 'No active streak'})).not.toHaveClass('is-golden');
});
