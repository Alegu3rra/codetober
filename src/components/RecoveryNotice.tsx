import React from 'react';
import type { ExtraordinaryEvent } from '../../shared/extraordinary-events.mjs';
import { Timestamp } from './Timestamp';

export function RecoveryNotice({ window, now, zone }: { window?: ExtraordinaryEvent; now: number; zone: string }) {
  if (!window) return null;
  const ended = now >= Date.parse(window.endAt);
  const active = now >= Date.parse(window.startAt) && !ended;
  return <aside className="notice" aria-label="Extraordinarios weekend">
    <strong>{window.title} · {ended ? 'Completed' : active ? 'Open now' : 'This weekend'}</strong>
    <p><Timestamp value={window.startAt} zone={zone} /> – <Timestamp value={window.endAt} zone={zone} /> (end excluded).</p>
    <p>Catch up on problems whose daily window had closed by the start of the weekend and that you had not yet solved.
      Your first acceptance during this period counts as <strong>24 hours total per problem</strong>, with no accumulated delay or extra late penalty.</p>
    <p>The benefit stays after the weekend. Usual points apply; on-time credit, streaks and golden days are not restored.
      Previously accepted problems and the weekend’s new problems keep their normal rules.</p>
  </aside>;
}
