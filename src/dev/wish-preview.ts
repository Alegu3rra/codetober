import { previewData } from './preview';
import type { EventData } from '../data/schema';

// Public synthetic fixtures. No private calendar or real participant data is imported.
export function wishPreviewData(mode: string): EventData {
  const data = structuredClone(previewData);
  const upcoming = mode === 'wish-upcoming', finished = ['wish-review', 'wish-tie', 'wish-winner'].includes(mode);
  data.generatedAt = upcoming ? '2026-10-23T18:00:00Z' : finished ? '2026-10-26T13:00:00Z' : '2026-10-25T15:00:00Z';
  data.lastSuccessfulSyncAt = data.generatedAt;
  data.event.extraordinaryEvents = [
    { id: 'preview-recovery-first', type: 'backlog-recovery', title: 'Extraordinarios', startAt: '2026-10-17T12:00:00Z', endAt: '2026-10-19T12:00:00Z', problemTimeSeconds: 86400 },
    { id: 'preview-recovery-second', type: 'backlog-recovery', title: 'Extraordinarios', startAt: '2026-10-24T12:00:00Z', endAt: '2026-10-26T12:00:00Z', problemTimeSeconds: 86400 },
  ];
  if (!upcoming) data.days.push({ id: 'preview-magic-day', date: '2026-10-25', title: 'Make a Wish', releaseAt: '2026-10-25T12:00:00Z',
    description: 'Fictional Sunday problems for the local Make a Wish preview.',
    problems: [
      { titleSlug: 'preview-wish-spell', title: 'Preview Spell · Potions', difficulty: 'Medium', url: 'https://leetcode.com/problems/preview-wish-spell/' },
      { titleSlug: 'preview-wish-number', title: 'Preview Spell · A Magical Number', difficulty: 'Hard', url: 'https://leetcode.com/problems/preview-wish-number/' },
    ] });
  const candidate = { participant_id: data.participants[0].participant_id, firstAcceptedAt: '2026-10-25T13:00:00Z', completedAt: '2026-10-25T14:30:00Z' };
  data.event.makeAWish = { id: 'preview-wish', date: '2026-10-25', startAt: '2026-10-25T12:00:00Z', endAt: '2026-10-26T12:00:00Z',
    bonusSeconds: 7200, contactEmail: 'alegu3rra@gmail.com', result: {
      status: upcoming ? 'announced' : mode === 'wish-winner' ? 'confirmed' : finished ? 'review' : 'open',
      candidates: upcoming ? [] : mode === 'wish-tie' ? [candidate, { ...candidate, participant_id: data.participants[1].participant_id }] : [candidate],
      ...(mode === 'wish-winner' ? { winnerId: candidate.participant_id, confirmedAt: '2026-10-26T13:00:00Z' } : {}),
    } };
  for (const person of data.participants) {
    person.lastSyncedAt = data.generatedAt;
    if (!upcoming) {
      const solved = finished || person.participant_id === candidate.participant_id;
      const accepts = ['2026-10-25T13:00:00Z', '2026-10-25T14:30:00Z'];
      person.results.push(...data.days.at(-1)!.problems.map((p, i) => ({ titleSlug: p.titleSlug, firstAcceptedAt: solved ? accepts[i] : null })));
      if (solved) { person.problemsCompleted += 2; person.daysCompleted++; person.dayProgress?.push({ date: '2026-10-25', onTimeProblems: 2 }); }
    }
  }
  return data;
}
