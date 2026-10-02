import type { EventData } from '../data';

// Synthetic UI fixtures only; never import the private calendar here.
export const previewData: EventData = {
  version: 1, demo: true, generatedAt: '2026-10-03T18:00:00Z',
  lastSuccessfulSyncAt: '2026-10-03T18:00:00Z', participantsLastSuccessAt: '2026-10-03T18:00:00Z', participantsFailed: false,
  event: { timezone: 'America/Mexico_City', startAt: '2026-10-01T12:00:00Z', closeAt: '2026-11-01T12:00:00Z', totalProblems: 62,
    schedule: Array.from({ length: 31 }, (_, i) => { const date = `2026-10-${String(i + 1).padStart(2, '0')}`; return { date, releaseAt: `${date}T12:00:00Z` }; }) },
  days: [{ id: 'local-preview-day', date: '2026-10-01', title: 'Local interface preview', releaseAt: '2026-10-01T12:00:00Z', problems: [
    { titleSlug: 'local-preview-one', title: 'UI preview problem A', difficulty: 'Easy', url: 'https://leetcode.com/problems/local-preview-one/' },
    { titleSlug: 'local-preview-two', title: 'UI preview problem B', difficulty: 'Medium', url: 'https://leetcode.com/problems/local-preview-two/' },
  ] }],
  participants: [{ participant_id: 'local-preview-participant', display_name: 'Example Participant', leetcode_username: 'fictional_preview', rank: 1,
    problemsCompleted: 1, daysCompleted: 0, currentStreak: 1, bestStreak: 1, currentStreakLevel: 1, bestStreakGoldenDays: 0, dayProgress: [{ date: "2026-10-01", onTimeProblems: 1 }], lastSyncedAt: '2026-10-03T18:00:00Z', syncFailed: false,
    results: [{ titleSlug: 'local-preview-one', firstAcceptedAt: '2026-10-01T14:00:00Z' }, { titleSlug: 'local-preview-two', firstAcceptedAt: null }] }],
};


for (const day of [2, 3]) {
  const date = `2026-10-0${day}`;
  previewData.days.push({
    id: `local-preview-day-${day}`, date, title: `Local interface preview · Day ${day}`,
    releaseAt: `${date}T12:00:00Z`,
    problems: [1, 2].map((number) => ({
      titleSlug: `local-preview-day-${day}-problem-${number}`,
      title: `UI preview · Day ${day}, problem ${number}`,
      difficulty: number === 1 ? 'Easy' as const : 'Medium' as const,
      url: `https://leetcode.com/problems/local-preview-day-${day}-problem-${number}/`,
    })),
  });
}
const base = previewData.participants[0];
const results = (times: (string | null)[]) => previewData.days.flatMap(d => d.problems)
  .map((p, i) => ({ titleSlug: p.titleSlug, firstAcceptedAt: times[i] }));
const progress = (counts: number[]) => previewData.days.map((d, i) => ({date: d.date, onTimeProblems: counts[i]}));
previewData.participants = [
  { ...base, participant_id: 'local-preview-golden', display_name: 'Golden Example', leetcode_username: 'fictional_golden', rank: 1,
    problemsCompleted: 6, daysCompleted: 3, currentStreak: 3, bestStreak: 3, currentStreakLevel: 2, bestStreakGoldenDays: 3,
    dayProgress: progress([2, 2, 2]),
    results: results(previewData.days.flatMap(d => [1, 2].map(() => `${d.date}T15:00:00Z`))),
  },
  { ...base, participant_id: 'local-preview-fast', display_name: 'Zoe Quick', leetcode_username: 'fictional_quick', rank: 2,
    problemsCompleted: 3, daysCompleted: 1, currentStreak: 2, bestStreak: 2, currentStreakLevel: 2, bestStreakGoldenDays: 1,
    dayProgress: progress([1, 2, 0]),
    results: results(['2026-10-01T12:30:00Z', null, '2026-10-02T12:30:00Z', '2026-10-02T13:00:00Z', null, null]),
  },
  { ...base, rank: 2, problemsCompleted: 3, daysCompleted: 1,
    dayProgress: progress([1, 0, 1]),
    results: results(['2026-10-01T14:00:00Z', '2026-10-02T15:00:00Z', null, null, '2026-10-03T14:00:00Z', null]),
  },
];
