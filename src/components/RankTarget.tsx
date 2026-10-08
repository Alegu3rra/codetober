import React from 'react';
import { elapsedLabel, type EventData, type Participant } from '../data';
import { rankTarget } from '../rank-target';
import { Timestamp } from './Timestamp';

export function RankTarget({ person, rival, data, now, zone }: {
  person: Participant; rival?: Participant; data: EventData; now: number; zone: string;
}) {
  const closed = now >= Date.parse(data.event.closeAt);
  if (!rival) return <div className="rank-target"><h3>{closed ? 'Finished in first place' : 'You lead the ranking'}</h3>
    {!closed && <p>Keep solving the daily problems on time to defend your place.</p>}</div>;
  const target = rankTarget(person, rival, data, now);
  const suggestions = target.pending.slice(0, Math.min(target.pointsToLead, 5));
  return <section className="rank-target" aria-label={`Next rank for ${person.display_name}`}>
    <h3>{closed ? `Final gap to #${rival.rank}` : `To reach #${rival.rank}, you need:`}</h3>
    {target.pointsToTie > 0 ? <>
      <p>{closed
        ? `${target.pointsToTie} ${target.pointsToTie === 1 ? 'problem' : 'problems'} behind.`
        : <>Solve <strong>{target.pointsToTie} more {target.pointsToTie === 1 ? 'problem' : 'problems'}</strong> to match {rival.display_name}’s total.
          {target.possiblePointsLead && <> Solve {target.pointsToLead} more to move ahead if their total stays unchanged.</>}</>}
      </p>
    </> : <p>{target.timeGapSeconds > 0
      ? closed ? <>{elapsedLabel(target.timeGapSeconds)} behind on time.</>
        : <>Recover more than <strong>{elapsedLabel(target.timeGapSeconds)}</strong> against {rival.display_name}, while keeping the same problem total.</>
      : 'Time is tied. Best streak, then name and participant ID decide the order.'}</p>}
    {!closed && target.pointsToTie === 0 && target.timeGapSeconds > 0 && target.recoveryProblems > 0 && <p>
      Over the next {target.recoveryProblems} problems, average at least <strong>{elapsedLabel(target.savingsPerProblemSeconds!)}</strong> less time per problem than {rival.display_name}.
      {' '}Assumes you both solve those problems without new late penalties.
    </p>}
    {!closed && target.pointsToTie === 0 && target.timeGapSeconds > 0 && target.recoveryProblems === 0 && <p>Both totals are complete. No new problems remain to recover time through future solves.</p>}
    {!closed && <>
      {target.pointsToTie > 0 && suggestions.length > 0 && <>
        <h4>Pending problems to start with</h4>
        <ul className="rank-target-problems">{suggestions.map(problem => <li key={problem.titleSlug}>
          <a href={problem.url} target="_blank" rel="noreferrer">{problem.title} ↗</a>
          <small>{problem.onTime ? <>On time until <Timestamp value={problem.deadline} zone={zone} /></> : 'Late solve · adds 24 hours of penalty'}</small>
        </li>)}</ul>
      </>}
    </>}
    {closed && <p className="muted">The event is closed; these are final differences, not new submission targets.</p>}
  </section>;
}
