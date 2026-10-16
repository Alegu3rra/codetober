import type { EventData } from '../../data/schema';
import type { ExtraordinaryEvent } from '../../../shared/extraordinary-events.mjs';
import { dailyFirstAcceptance } from './progress';

export function recoveryBacklog(data: EventData, event: ExtraordinaryEvent, now: number) {
  const visible = { ...data, generatedAt: new Date(Math.min(now, Date.parse(data.generatedAt))).toISOString() };
  const cutoff = Math.min(now, Date.parse(event.startAt));
  const eligible = data.days.flatMap(day => {
    const release = Date.parse(day.releaseAt);
    const deadline = data.event.schedule.reduce((end, item) => {
      const next = Date.parse(item.releaseAt);
      return next > release ? Math.min(end, next) : end;
    }, Date.parse(data.event.closeAt));
    return deadline <= cutoff ? day.problems.map(problem => ({ ...problem, day })) : [];
  });
  return data.participants.map(person => ({
    person,
    pending: eligible.filter(problem => !Number.isFinite(dailyFirstAcceptance({ ...person,
      results: person.results.filter(result => result.titleSlug === problem.titleSlug),
    }, problem.day, visible))),
  })).sort((a, b) => b.pending.length - a.pending.length
    || a.person.display_name.localeCompare(b.person.display_name, 'en')
    || a.person.participant_id.localeCompare(b.person.participant_id));
}
