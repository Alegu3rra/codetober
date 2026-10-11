import type { Participant, EventData } from "../../data/schema";

export function editorialCredit(person: Participant, data: EventData) {
  const eligible = new Set<string>();
  for (const editorial of data.editorials ?? []) {
    const day = data.days.find(d => d.problems.some(p => p.titleSlug === editorial.titleSlug));
    if (!day || editorial.participant_id !== person.participant_id || editorial.rankingCreditSeconds !== 3600) continue;
    const deadline = data.event.schedule.reduce((end, item) => {
      const release = Date.parse(item.releaseAt);
      return release > Date.parse(day.releaseAt) ? Math.min(end, release) : end;
    }, Date.parse(data.event.closeAt));
    const published = Date.parse(editorial.publishedAt);
    if (published >= deadline && published <= Date.parse(data.generatedAt)) eligible.add(editorial.id);
  }
  return { count: eligible.size, seconds: eligible.size * 3600 };
}
