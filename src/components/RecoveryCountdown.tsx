import React from 'react';
import type { ExtraordinaryEvent } from '../../shared/extraordinary-events.mjs';
import { Countdown } from './Countdown';

export function RecoveryCountdown({ window, now, banner = false }: {
  window?: ExtraordinaryEvent; now: number; banner?: boolean;
}) {
  if (!window) return null;
  const ended = now >= Date.parse(window.endAt);
  const active = now >= Date.parse(window.startAt) && !ended;
  return <a href="#extraordinarios" className={`recovery-countdown${banner ? ' recovery-countdown-banner' : ''}`}
    aria-label="View Extraordinarios: rules and pending problems">
    <div role="timer" aria-label="Extraordinarios countdown" aria-live="off" className="recovery-countdown-content">
    <div>
      <strong>{window.title}</strong>
      <span className="muted">{ended ? 'Completed · earned benefits stay' : active ? 'Open now · ends in' : 'Starts in'}</span>
    </div>
    {!ended && <Countdown target={active ? window.endAt : window.startAt} now={now} />}
    <span className="recovery-banner-action">View event →</span>
    </div>
  </a>;
}
