import React, { useId, useState } from 'react';
import { firstSolveToday } from "../features/participants/progress";
import { rankingTime } from "../features/ranking/time";
import { elapsedLabel } from "../format/time";
import { type EventData, type Participant } from "../data/schema";
import { StreakFlame } from './StreakFlame';
import { Timestamp } from './Timestamp';
import { ParticipantDetails, type AdditionalProblemHistory } from './ParticipantDetails';
import { RankTarget } from './RankTarget';
import { InfoTooltip } from './InfoTooltip';
import { ParticipantBadges } from '../features/badges/ParticipantBadges';
import { closingWishWinner } from '../features/wishes/ClosingAnnouncement';

export type ParticipantSupplement = { rankingCreditSeconds: number; stats: React.ReactNode; history: AdditionalProblemHistory[] };

export function ParticipantRow({ person, rival, data, now, zone, started, supplement, rivalSupplement }: {
  person: Participant; rival?: Participant; data: EventData; now: number; zone: string; started: boolean;
  supplement?: ParticipantSupplement; rivalSupplement?: ParticipantSupplement;
}) {
  const contributions = (data.editorials ?? []).filter(e => e.participant_id === person.participant_id);
  const wishResult = data.event.makeAWish?.result;
  const wishWinner = closingWishWinner(data)?.participant_id === person.participant_id || (wishResult?.winnerId === person.participant_id
    && ['confirmed', 'wish-review', 'approved', 'applied', 'expired'].includes(wishResult.status));
  const winnerTag = wishWinner ? <a className="badge-pill badge-achievement wish-winner-tag" href="#make-a-wish" title="Confirmed Make a Wish winner · October 25, 2026"><span aria-hidden="true">✧</span> Make a Wish winner</a> : null;
  const [open, setOpen] = useState(false);
  const panel = useId();
  const closed = now >= Date.parse(data.event.closeAt);
  const stale = !closed && (!person.lastSyncedAt || now - Date.parse(person.lastSyncedAt) > 2 * 3600000);
  const time = rankingTime(person, data);
  const totalSeconds = Math.max(0, time.totalSeconds - (supplement?.rankingCreditSeconds ?? 0));
  const rivalTimeGap = rival ? totalSeconds - Math.max(0, rankingTime(rival, data).totalSeconds - (rivalSupplement?.rankingCreditSeconds ?? 0)) : 0;
  const firstToday = firstSolveToday(person, data, now);
  const warning = !closed && (person.syncFailed || stale);
  return (
    <article className="participant compact-participant">
      <div className="participant-row">
        <span className="rank" aria-label={started ? `Rank ${person.rank}` : 'Not ranked yet'}>{started ? `#${person.rank}` : '—'}</span>
        <div className="participant-name">
          <h2>
            <a href={`https://leetcode.com/u/${encodeURIComponent(person.leetcode_username)}/`} target="_blank" rel="noreferrer"><span>{person.display_name}</span> <span aria-hidden="true">↗</span></a>
            {contributions.length > 0 && <a className="contributor-indicator" href={`#editorial-${[...contributions].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0].id}`} aria-label={`View ${contributions.length} editorial ${contributions.length === 1 ? 'contribution' : 'contributions'} by ${person.display_name}`} title="Community editorial contributor">✎</a>}
          </h2>
          <small>@{person.leetcode_username}</small>
          <ParticipantBadges badges={person.badges} compact>{winnerTag}</ParticipantBadges>
          {started && <small className="rank-target-summary">{rival
            ? `${closed ? 'Final gap' : 'Next rank'} · ${rival.display_name} · ${rival.problemsCompleted === person.problemsCompleted ? rivalTimeGap > 0 ? `${elapsedLabel(rivalTimeGap)} behind on time` : 'Time tied' : closed ? `${rival.problemsCompleted - person.problemsCompleted} points behind` : `+${rival.problemsCompleted - person.problemsCompleted} to tie on points`}`
            : closed ? 'Finished #1' : 'Leading the ranking'}</small>}
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
        {wishWinner && <p className="wish-winner-detail"><span aria-hidden="true">✧</span> Make a Wish winner · October 25, 2026. <a href="#make-a-wish">See the community wish →</a></p>}
        <ParticipantBadges badges={person.badges}>{winnerTag}</ParticipantBadges>
        {started && <RankTarget person={person} rival={rival} data={data} now={now} zone={zone} />}
        <dl className="stats participant-extra-stats">
          <div><dt>Ranking time <InfoTooltip label="ranking time">Total time from each problem’s publication to its first accepted submission, plus late penalties, minus one hour per editorial validated as a different implementation and any extraordinarios recovery adjustment{supplement ? ", minus any granted wish credits" : ""}. Minimum zero. With equal problem totals, less time ranks higher.</InfoTooltip></dt><dd className="elapsed-time">{elapsedLabel(totalSeconds)}</dd></div>
          <div><dt>Late penalty · {time.lateProblems} problems <InfoTooltip label="late penalty">24 hours added once for each problem accepted at or after 06:00 the next day. Eligible extraordinarios solves have no late penalty. This penalty is already included in ranking time.</InfoTooltip></dt><dd className="elapsed-time">{elapsedLabel(time.penaltySeconds)}</dd></div>
          {!!time.recoveredProblems && <div><dt>Extraordinarios · {time.recoveredProblems} recovered problems <InfoTooltip label="extraordinarios">Each qualifying problem counts as 24 hours total with no late penalty. The recovery adjustment replaces the accumulated delay and stays after the weekend.</InfoTooltip></dt><dd className="elapsed-time">−{elapsedLabel(time.recoveryCreditSeconds!)}</dd></div>}
          <div><dt>Editorial credit · {time.creditedEditorials} {time.creditedEditorials === 1 ? 'contribution' : 'contributions'} <InfoTooltip label="editorial credit">One hour of credit per published editorial reviewed as a different implementation for that problem. Each contribution counts once. The credit is already deducted from ranking time, which cannot fall below zero.</InfoTooltip></dt><dd className="elapsed-time">−{elapsedLabel(time.editorialCreditSeconds)}</dd></div>
          {supplement?.stats}
          <div><dt>Best streak</dt><dd><StreakFlame value={person.bestStreak}
            goldRatio={person.bestStreak ? (person.bestStreakGoldenDays ?? 0) / person.bestStreak : 0}
            label={`${person.bestStreak}-day best streak · ${person.bestStreakGoldenDays ?? 0} golden days`} /></dd></div>
          <div><dt>{closed ? "First solve on final day" : "First solve today"}</dt><dd className="elapsed-time">{firstToday ? <Timestamp value={firstToday} zone={zone} seconds /> : "No accepted solve recorded"}</dd></div>
        </dl>
        <progress max="62" value={person.problemsCompleted} aria-label={`${person.display_name}: ${person.problemsCompleted} of 62 problems`} />
        <p className={`sync-status ${warning ? 'warning' : ''}`}>
          {closed ? 'Event closed · Last sync: ' : person.syncFailed ? '⚠ Last query failed · ' : stale ? '⚠ Update overdue · ' : '✓ Synced · '}
          <Timestamp value={person.lastSyncedAt} zone={zone} />
        </p>
        <ParticipantDetails person={person} data={data} zone={zone} contributions={contributions} additionalHistory={supplement?.history} />
      </div>
    </article>
  );
}
