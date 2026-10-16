import React, { useState } from 'react';
import type { EventData } from '../data/schema';
import type { ExtraordinaryEvent } from '../../shared/extraordinary-events.mjs';
import { RecoveryNotice } from '../components/RecoveryNotice';
import { recoveryBacklog } from '../features/participants/recovery-backlog';
import { filterParticipants } from '../features/participants/search';

export function Extraordinary({ data, event, now, zone }: {
  data: EventData; event: ExtraordinaryEvent; now: number; zone: string;
}) {
  const [query, setQuery] = useState('');
  const people = recoveryBacklog(data, event, now);
  const matching = new Set(filterParticipants(data.participants, query).map(person => person.participant_id));
  const filtered = people.filter(({ person }) => matching.has(person.participant_id));
  return <section id="extraordinarios">
    <h2>{event.title}</h2>
    <RecoveryNotice window={event} now={now} zone={zone} />
    <h3>Overdue problems by participant</h3>
    <p className="muted">Most pending problems first. This is a catch-up list; the competition ranking stays in Scoreboard.
      Only published problems whose daily window has already closed and ends by the start of this event are included.</p>
    <label htmlFor="recovery-search">Find a participant</label>
    <input id="recovery-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Name or LeetCode username" />
    <p className="muted">{people.reduce((sum, person) => sum + person.pending.length, 0)} pending solves across {people.length} participants.
      This list updates with each score sync. If a solve is missing, contact the organizer.</p>
    <div className="recovery-participants">
      {filtered.map(({ person, pending }) => <details className="archive-day" key={person.participant_id}>
        <summary className="recovery-participant-summary">
          <span><strong>{person.display_name}</strong><small className="muted">@{person.leetcode_username}</small></span>
          <span>{pending.length ? `${pending.length} pending` : 'All caught up ✓'}</span>
        </summary>
        {pending.length ? <ul className="recovery-problems">{pending.map(problem => <li key={problem.titleSlug}>
          <a href={problem.url} target="_blank" rel="noreferrer">{problem.title} ↗</a>
          <small className="muted">Day {Number(problem.day.date.slice(-2))} · {problem.difficulty}</small>
        </li>)}</ul> : <p>No eligible overdue problems recorded. Keep up the daily practice!</p>}
      </details>)}
      {!filtered.length && <p className="empty">No participants match your search.</p>}
    </div>
  </section>;
}
