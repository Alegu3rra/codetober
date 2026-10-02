import React, { useId, useState } from 'react';
import { completionSeconds, elapsedLabel, type EventData, type Participant } from '../data';
import { StreakFlame } from './StreakFlame';
import { Timestamp } from './Timestamp';
import { ParticipantDetails } from './ParticipantDetails';

export function ParticipantRow({ person, data, now, zone, started }: {
  person: Participant; data: EventData; now: number; zone: string; started: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panel = useId();
  const closed = now >= Date.parse(data.event.closeAt);
  const stale = !closed && (!person.lastSyncedAt || now - Date.parse(person.lastSyncedAt) > 2 * 3600000);
  const warning = !closed && (person.syncFailed || stale);
  return (
    <article className="participant compact-participant">
      <div className="participant-row">
        <span className="rank" aria-label={started ? `Rank ${person.rank}` : 'Not ranked yet'}>{started ? `#${person.rank}` : '—'}</span>
        <div className="participant-name">
          <h2><a href={`https://leetcode.com/u/${encodeURIComponent(person.leetcode_username)}/`} target="_blank" rel="noreferrer"><span>{person.display_name}</span> <span aria-hidden="true">↗</span></a></h2>
          <small>@{person.leetcode_username}</small>
          {warning && <small className="warning">{person.syncFailed ? '⚠ Query failed' : '⚠ Update overdue'}</small>}
        </div>
        <div className="compact-stat"><span className="muted">Problems</span><strong>{person.problemsCompleted}<small> / 62</small></strong></div>
        <div className="compact-stat"><span className="muted">Current streak</span>
          <StreakFlame value={person.currentStreak} goldRatio={person.currentStreakLevel === 2 ? 1 : 0}
            label={`${person.currentStreak}-day current streak${person.currentStreakLevel === 2 ? ' · Latest qualifying day is golden' : ''}`} />
        </div>
        <button className="expand-participant" aria-expanded={open} aria-controls={panel}
          aria-label={`${open ? 'Collapse' : 'Expand'} progress for ${person.display_name}`} onClick={() => setOpen(!open)}>
          <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        </button>
      </div>
      <div id={panel} hidden={!open} className="participant-expanded">
        <dl className="stats participant-extra-stats">
          <div><dt>Best streak</dt><dd><StreakFlame value={person.bestStreak}
            goldRatio={person.bestStreak ? (person.bestStreakGoldenDays ?? 0) / person.bestStreak : 0}
            label={`${person.bestStreak}-day best streak · ${person.bestStreakGoldenDays ?? 0} golden days`} /></dd></div>
          <div><dt>Total solve time</dt><dd className="elapsed-time">{elapsedLabel(completionSeconds(person, data))}</dd></div>
        </dl>
        <p className="muted">Total solve time is the sum of time from each problem’s release to its first valid accepted submission.</p>
        <progress max="62" value={person.problemsCompleted} aria-label={`${person.display_name}: ${person.problemsCompleted} of 62 problems`} />
        <p className={`sync-status ${warning ? 'warning' : ''}`}>
          {closed ? 'Event closed · Last sync: ' : person.syncFailed ? '⚠ Last query failed · ' : stale ? '⚠ Update overdue · ' : '✓ Synced · '}
          <Timestamp value={person.lastSyncedAt} zone={zone} />
        </p>
        <ParticipantDetails person={person} data={data} zone={zone} />
      </div>
    </article>
  );
}
