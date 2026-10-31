import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,within} from '@testing-library/react';
import {EventPage} from './pages/EventPage';
import {closedPreviewData} from './dev/closed-preview';
import {EventArchive} from './components/EventArchive';

afterEach(()=>{vi.restoreAllMocks();window.history.replaceState(null,'','/');});
it('closed edition keeps a light archive, removes active event banners and retains the archive icon',async()=>{
  vi.spyOn(Date,'now').mockReturnValue(Date.parse('2026-11-02T12:00:00Z'));
  vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json(closedPreviewData));
  render(<EventPage/>);
  expect(await screen.findByRole('heading',{name:'The month ends. Your progress stays.'})).toBeVisible();
  expect(screen.queryByRole('link',{name:'Discover Make a Wish'})).not.toBeInTheDocument();
  expect(screen.queryByRole('tab',{name:'Make a Wish'})).not.toBeInTheDocument();
  expect(screen.getByText('Event memories · Make a Wish & Extraordinarios').closest('details')).not.toHaveAttribute('open');
  fireEvent.click(screen.getByLabelText('Open edition archive'));
  expect(screen.getByRole('navigation',{name:'Browse past editions'})).toBeVisible();
  expect(within(screen.getByRole('navigation',{name:'Browse past editions'})).getByRole('link',{name:/Codetober 2026/})).toHaveAttribute('href',expect.stringContaining('/2026/'));
  fireEvent.click(screen.getByRole('tab',{name:'Scoreboard'}));
  expect(screen.getByRole('button',{name:/Codetober Finisher/})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab',{name:'Project journal'}));
  expect(await screen.findByRole('heading',{name:'Project journal'})).toBeVisible();
});
it('archive summaries retain recorded dynamics without showing a pending-problem interface',()=>{
  render(<EventArchive data={closedPreviewData}/>);
  expect(screen.getByText('Event memories · Make a Wish & Extraordinarios')).toBeInTheDocument();
  expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('timer')).not.toBeInTheDocument();
});
