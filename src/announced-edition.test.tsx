import React from 'react';
import { expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
vi.mock('./editions.json', () => ({default: {latestYear:2027, editions:[
  {year:2026, announced:true, startAt:'2026-10-01T06:00:00-06:00', closeAt:'2026-11-01T06:00:00-06:00', registrationCloseAt:'2026-10-31T00:00:00-06:00', registrationUrl:'https://forms.gle/old-form', snapshot:'data/data.json'},
  {year:2027, announced:true, startAt:'2027-10-01T06:00:00-06:00', closeAt:'2027-11-01T06:00:00-06:00', registrationCloseAt:null, registrationUrl:null, snapshot:null},
]}}));
import { EventPage } from './pages/EventPage';
import { resolveRoute } from './routing';
afterEach(() => vi.restoreAllMocks());
test('announced 2027 displays countdown, archive navigation, and isolated registration without fetching 2026', async () => {
  vi.spyOn(Date,'now').mockReturnValue(Date.parse('2026-11-02T12:00:00Z'));
  const fetchSpy = vi.spyOn(globalThis,'fetch');
  render(<EventPage />);
  expect(await screen.findByText('No problems published yet. The first pair is on its way.')).toBeInTheDocument();
  expect(screen.getByRole('combobox', {name:'Choose edition'})).toHaveValue('2027');
  expect(screen.getByRole('link', {name:'View previous edition →'})).toHaveAttribute('href',expect.stringContaining('/2026/'));
  fireEvent.click(screen.getByRole('tab', {name:'Scoreboard'}));
  expect(screen.queryByText('Golden Example')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', {name:'About / Join'}));
  expect(screen.getByText('Registration is not open yet.')).toBeInTheDocument();
  expect(screen.queryByRole('link', {name:/Open registration/})).not.toBeInTheDocument();
  expect(fetchSpy).not.toHaveBeenCalled();
  expect(resolveRoute('/codetober/','/codetober/2026/').currentPath).toBe('/codetober/2027/');
  expect(resolveRoute('/codetober/2026/','/codetober/2027/').kind).toBe('edition');
});
test('active contest hides previous-edition shortcut but retains the year selector', async () => {
  vi.spyOn(Date,'now').mockReturnValue(Date.parse('2027-10-01T12:00:00Z'));
  render(<EventPage />);
  await screen.findByText('No problems published yet. The first pair is on its way.');
  expect(screen.queryByRole('link',{name:'View previous edition →'})).not.toBeInTheDocument();
  expect(screen.getByRole('combobox',{name:'Choose edition'})).toBeInTheDocument();
});
