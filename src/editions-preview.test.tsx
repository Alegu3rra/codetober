import React from 'react';
import { afterEach, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import EditionsPreview from './dev/EditionsPreview';
afterEach(() => {cleanup();window.history.replaceState(null,'','/');});
test('previous-edition link appears only when no contest is active; title switcher stays available', () => {
  render(<EditionsPreview />);
  expect(screen.getByRole('link',{name:'View previous edition →'})).toBeVisible();
  fireEvent.change(screen.getByLabelText('Simulate:'),{target:{value:'active'}});
  expect(screen.queryByRole('link',{name:'View previous edition →'})).not.toBeInTheDocument();
  expect(screen.getByLabelText('Choose edition')).toBeVisible();
  fireEvent.change(screen.getByLabelText('Simulate:'),{target:{value:'closed'}});
  expect(screen.getByRole('link',{name:'View previous edition →'})).toBeVisible();
});
test('archive and upcoming edition keep participants and registration separate', () => {
  render(<EditionsPreview />);
  fireEvent.click(screen.getByRole('button',{name:'Scoreboard'}));
  expect(screen.getByText('No approved participants published yet.')).toBeVisible();
  fireEvent.change(screen.getByLabelText('Choose edition'),{target:{value:'2026'}});
  expect(screen.getByRole('link',{name:'Go to latest edition →'})).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'Scoreboard'}));
  expect(screen.getByRole('heading',{name:'Golden Example'})).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'About / Join'}));
  expect(screen.getByText('Registration is closed for 2026.')).toBeVisible();
  fireEvent.change(screen.getByLabelText('Choose edition'),{target:{value:'2027'}});
  fireEvent.click(screen.getByRole('button',{name:'About / Join'}));
  expect(screen.getByText('Registration for 2027 is not open yet.')).toBeVisible();
});
