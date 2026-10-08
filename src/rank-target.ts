import { type EventData, type Participant, dailyFirstAcceptance, rankingTime } from './data';

export function rankTarget(person: Participant, rival: Participant, data: EventData, now: number) {
  const pointsToTie = Math.max(0, rival.problemsCompleted - person.problemsCompleted);
  const pointsToLead = pointsToTie + 1;
  const ownTime = rankingTime(person, data);
  const rivalTime = rankingTime(rival, data);
  const schedule = [...data.event.schedule].sort((a, b) => Date.parse(a.releaseAt) - Date.parse(b.releaseAt));
  const pending = data.days.filter(day => Date.parse(day.releaseAt) <= now).flatMap(day => {
    const deadline = schedule.find(item => Date.parse(item.releaseAt) > Date.parse(day.releaseAt))?.releaseAt ?? data.event.closeAt;
    const end = Math.min(Date.parse(deadline), Date.parse(data.event.closeAt));
    return day.problems.filter(problem => !Number.isFinite(dailyFirstAcceptance({
      ...person, results: person.results.filter(result => result.titleSlug === problem.titleSlug),
    }, day, data))).map(problem => ({
      ...problem, date: day.date, releaseAt: day.releaseAt,
      deadline: new Date(end).toISOString(), onTime: now < end,
    }));
  }).sort((a, b) => Number(b.onTime) - Number(a.onTime) || Date.parse(b.releaseAt) - Date.parse(a.releaseAt));
  const timeGapSeconds = ownTime.totalSeconds - rivalTime.totalSeconds;
  const remainingProblems = data.event.totalProblems - rival.problemsCompleted;
  const recoveryProblems = Math.min(5, remainingProblems);
  return { pointsToTie, pointsToLead, ownTime, rivalTime, timeGapSeconds, pending, recoveryProblems,
    savingsPerProblemSeconds: recoveryProblems ? Math.floor(Math.max(0, timeGapSeconds) / recoveryProblems) + 1 : null,
    availableOnTime: pending.filter(problem => problem.onTime).length,
    possiblePointsLead: person.problemsCompleted + pointsToLead <= data.event.totalProblems,
  };
}
