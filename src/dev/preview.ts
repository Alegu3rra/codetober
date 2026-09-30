import type { EventData } from '../data';

// Synthetic UI fixtures only; never import the private calendar here.
export const previewData: EventData = {
  version: 1, demo: true, generatedAt: '2026-10-01T18:00:00Z',
  lastSuccessfulSyncAt: '2026-10-01T18:00:00Z', participantsLastSuccessAt: '2026-10-01T18:00:00Z', participantsFailed: false,
  event: { timezone: 'America/Mexico_City', startAt: '2026-10-01T12:00:00Z', closeAt: '2026-11-01T12:00:00Z', totalProblems: 62,
    schedule: Array.from({ length: 31 }, (_, i) => { const date = `2026-10-${String(i + 1).padStart(2, '0')}`; return { date, releaseAt: `${date}T12:00:00Z` }; }) },
  days: [{ id: 'local-preview-day', date: '2026-10-01', title: 'Local interface preview', releaseAt: '2026-10-01T12:00:00Z', problems: [
    { titleSlug: 'local-preview-one', title: 'UI preview problem A', difficulty: 'Easy', url: 'https://leetcode.com/problems/local-preview-one/' },
    { titleSlug: 'local-preview-two', title: 'UI preview problem B', difficulty: 'Medium', url: 'https://leetcode.com/problems/local-preview-two/' },
  ] }],
  participants: [{ participant_id: 'local-preview-participant', display_name: 'Example Participant', leetcode_username: 'fictional_preview', rank: 1,
    problemsCompleted: 1, daysCompleted: 0, currentStreak: 1, bestStreak: 1, currentStreakLevel: 1, bestStreakGoldenDays: 0, dayProgress: [{ date: "2026-10-01", onTimeProblems: 1 }], lastSyncedAt: '2026-10-01T18:00:00Z', syncFailed: false,
    results: [{ titleSlug: 'local-preview-one', firstAcceptedAt: '2026-10-01T14:00:00Z' }, { titleSlug: 'local-preview-two', firstAcceptedAt: null }] }],
};

// A second fictional participant demonstrates the golden flame in local preview.
previewData.participants[0].rank = 2;
previewData.participants.unshift({
  ...previewData.participants[0], participant_id: 'local-preview-golden',
  display_name: 'Golden Example', leetcode_username: 'fictional_golden', rank: 1,
  problemsCompleted: 2, daysCompleted: 1, currentStreakLevel: 2, bestStreakGoldenDays: 1,
  dayProgress: [{ date: '2026-10-01', onTimeProblems: 2 }],
  results: previewData.days[0].problems.map(p => ({ titleSlug: p.titleSlug, firstAcceptedAt: '2026-10-01T15:00:00Z' })),
});
