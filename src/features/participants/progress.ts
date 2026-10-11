import type { Participant, Day, EventData } from "../../data/schema";

export function dailyFirstAcceptance(person: Participant, day: Day, data: EventData) {
  return Math.min(...person.results
    .filter(r => r.firstAcceptedAt && day.problems.some(p => p.titleSlug === r.titleSlug)
      && Date.parse(r.firstAcceptedAt) >= Date.parse(day.releaseAt)
      && Date.parse(r.firstAcceptedAt) < Date.parse(data.event.closeAt)
      && Date.parse(r.firstAcceptedAt) <= Date.parse(data.generatedAt))
    .map(r => Date.parse(r.firstAcceptedAt!)));
}
// Derive on-time credit from acceptance dates for streaks and progress.
export function onTimeProblemsCompleted(person: Participant, data: EventData) {
  const schedule = [...data.event.schedule].sort((a,b) => Date.parse(a.releaseAt)-Date.parse(b.releaseAt));
  return data.days.reduce((total, day) => {
    const start = Date.parse(day.releaseAt);
    const end = Math.min(Date.parse(schedule.find(d => Date.parse(d.releaseAt) > start)?.releaseAt ?? data.event.closeAt), Date.parse(data.event.closeAt));
    return total + day.problems.filter(problem => person.results.some(r => r.titleSlug === problem.titleSlug
      && r.firstAcceptedAt !== null && Date.parse(r.firstAcceptedAt) >= start
      && Date.parse(r.firstAcceptedAt) < end && Date.parse(r.firstAcceptedAt) <= Date.parse(data.generatedAt))).length;
  },0);
}
export function firstSolveToday(person: Participant, data: EventData, now: number) {
  // An event day runs from its release until the next release, not midnight.
  const at = Math.min(now, Date.parse(data.event.closeAt) - 1);
  const schedule = [...data.event.schedule].sort((a, b) => Date.parse(a.releaseAt) - Date.parse(b.releaseAt));
  const index = schedule.filter(d => Date.parse(d.releaseAt) <= at).length - 1;
  if (index < 0) return null;
  const day = data.days.find(d => d.date === schedule[index].date);
  if (!day) return null;
  const end = Date.parse(schedule[index + 1]?.releaseAt ?? data.event.closeAt);
  const slugs = new Set(day.problems.map(p => p.titleSlug));
  return person.results.filter(r => slugs.has(r.titleSlug) && r.firstAcceptedAt
    && Date.parse(r.firstAcceptedAt) >= Date.parse(day.releaseAt)
    && Date.parse(r.firstAcceptedAt) < end
    && Date.parse(r.firstAcceptedAt) <= Math.min(now, Date.parse(data.generatedAt)))
    .map(r => r.firstAcceptedAt!).sort((a, b) => Date.parse(a) - Date.parse(b))[0] ?? null;
}
