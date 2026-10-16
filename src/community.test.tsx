import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { App } from './App';
import { previewData } from './dev/preview';
import { communityUrl } from './community';

beforeEach(() => {
  localStorage.clear();
  vi.stubEnv('BASE_URL', '/codetober/2026/');
  window.history.replaceState(null, '', '/codetober/2026/');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => previewData }));
});
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/codetober/2026/');
});

test('community navigation scrolls and focuses only after About is visible, including repeated navigation', () => {
  const scroll = vi.fn(function (this: HTMLElement) {
    expect(this.id).toBe('community');
    expect(this.closest('[role="tabpanel"]')).not.toHaveAttribute('hidden');
  });
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
  const original = HTMLElement.prototype.scrollIntoView;
  HTMLElement.prototype.scrollIntoView = scroll;
  try {
    const { unmount } = render(<App />);
    const go = () => {
      window.history.replaceState(null, '', '/codetober/2026/#community');
      fireEvent(window, new HashChangeEvent('hashchange'));
    };
    go();
    expect(scroll).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' });
    expect(document.getElementById('community')).toHaveFocus();
    scroll.mockClear();
    go();
    expect(scroll).toHaveBeenCalledTimes(1);
    unmount();
    scroll.mockClear();
    render(<App />);
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(document.getElementById('community')).toHaveFocus();
  } finally {
    HTMLElement.prototype.scrollIntoView = original;
  }
});

test('header invitation and About tab highlight new content, open its section and stay read after reload', () => {
  const { unmount } = render(<App />);
  const icon = screen.getByRole('link', { name: 'WhatsApp community' });
  const tab = screen.getByRole('tab', { name: 'About / Join' });
  expect(icon).toHaveClass('has-unseen-content');
  expect(tab).toHaveClass('has-unseen-content');
  expect(icon).toHaveAttribute('href', '#community');
  fireEvent.click(icon);
  window.history.replaceState(null, '', '/codetober/2026/#community');
  fireEvent(window, new HashChangeEvent('hashchange'));
  expect(tab).toHaveAttribute('aria-selected', 'true');
  expect(icon).not.toHaveClass('has-unseen-content');
  expect(tab).not.toHaveClass('has-unseen-content');
  expect(screen.getByRole('heading', { name: 'Join the WhatsApp community' })).toBeVisible();
  expect(screen.getByRole('tab', { name: 'Releases' })).toHaveClass('has-unseen-content');
  unmount();
  render(<App />);
  expect(screen.getByRole('link', { name: 'WhatsApp community' })).not.toHaveClass('has-unseen-content');
  expect(screen.getByRole('tab', { name: 'About / Join' })).not.toHaveClass('has-unseen-content');
});

test('opening About directly clears both indicators and offers the approved link plus a collapsible, downloadable QR', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('tab', { name: 'About / Join' }));
  expect(screen.getByRole('link', { name: 'WhatsApp community' })).not.toHaveClass('has-unseen-content');
  const join = screen.getByRole('link', { name: 'Join the community ↗' });
  expect(join).toHaveAttribute('href', communityUrl);
  expect(join).toHaveAttribute('target', '_blank');
  const image = screen.getByAltText('QR code for the Codetober WhatsApp community');
  expect(image).not.toBeVisible();
  fireEvent.click(screen.getByText('Scan a QR code instead'));
  expect(image).toBeVisible();
  expect(image).toHaveAttribute('src', '/codetober/2026/community-qr.svg');
  const download = screen.getByRole('link', { name: 'Download clean QR code' });
  expect(download).toHaveAttribute('href', '/codetober/2026/community-qr.png');
  expect(download).toHaveAttribute('download', 'codetober-community-qr.png');
  fireEvent.click(screen.getByRole('tab', { name: 'Problems' }));
  expect(screen.getByRole('tab', { name: 'About / Join' })).not.toHaveClass('has-unseen-content');
});
