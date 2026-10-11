import type { Participant, Day, EventData } from "../../data/schema";
import { dailyFirstAcceptance } from "../participants/progress";
import { editorialCredit } from "../editorials/credit";

// Older snapshots can still be displayed using their published acceptance dates.
export function completionSeconds(person: Participant, data: EventData) {
  if (person.completionTimeSeconds !== undefined) return person.completionTimeSeconds;
  const releases = new Map(data.days.flatMap(d => d.problems.map(p => [p.titleSlug, Date.parse(d.releaseAt)] as const)));
  return person.results.reduce((sum, r) => {
    const release = releases.get(r.titleSlug);
    const accepted = r.firstAcceptedAt ? Date.parse(r.firstAcceptedAt) : NaN;
    return release !== undefined && accepted >= release && accepted < Date.parse(data.event.closeAt) && accepted <= Date.parse(data.generatedAt)
      ? sum + (accepted - release) / 1000 : sum;
  }, 0);
}
export const LATE_PENALTY_SECONDS = 24 * 3600;
export function problemRankingTime(person: Participant, day: Day, titleSlug: string, data: EventData) {
  const accepted = dailyFirstAcceptance({ ...person, results: person.results.filter(r => r.titleSlug === titleSlug) }, day, data);
  if (!Number.isFinite(accepted)) return null;
  const release = Date.parse(day.releaseAt);
  const deadline = data.event.schedule.reduce((end, item) => {
    const next = Date.parse(item.releaseAt);
    return next > release ? Math.min(end, next) : end;
  }, Date.parse(data.event.closeAt));
  const elapsedSeconds = (accepted - release) / 1000;
  const penaltySeconds = accepted >= deadline ? LATE_PENALTY_SECONDS : 0;
  return { acceptedAt: new Date(accepted).toISOString(), elapsedSeconds, penaltySeconds, totalSeconds: elapsedSeconds + penaltySeconds };
}
export function rankingTime(person: Participant, data: EventData) {
  let elapsedSeconds = 0, lateProblems = 0;
  for (const day of data.days) {
    for (const problem of day.problems) {
      const time = problemRankingTime(person, day, problem.titleSlug, data);
      if (!time) continue;
      elapsedSeconds += time.elapsedSeconds;
      if (time.penaltySeconds) lateProblems++;
    }
  }
  const penaltySeconds = lateProblems * LATE_PENALTY_SECONDS;
  const credit = editorialCredit(person, data);
  return { elapsedSeconds, lateProblems, penaltySeconds, editorialCreditSeconds: credit.seconds, creditedEditorials: credit.count,
    totalSeconds: Math.max(0, elapsedSeconds + penaltySeconds - credit.seconds) };
}
export function orderedParticipants(data: EventData) {
  return [...data.participants].sort((a, b) => b.problemsCompleted - a.problemsCompleted
    || rankingTime(a, data).totalSeconds - rankingTime(b, data).totalSeconds
    || b.bestStreak - a.bestStreak || a.display_name.localeCompare(b.display_name, 'en')
    || a.participant_id.localeCompare(b.participant_id))
    .map((p, i) => ({ ...p, rank: i + 1 }));
}
