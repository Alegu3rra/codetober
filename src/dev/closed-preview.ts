import type { EventData } from '../data';
import { previewData } from './preview';

// Entirely fictional archive. No private calendar or participant data is read.
export const closedPreviewData: EventData = structuredClone(previewData);
closedPreviewData.generatedAt = '2026-11-01T12:00:00Z';
closedPreviewData.lastSuccessfulSyncAt = '2026-11-01T11:55:00Z';
closedPreviewData.participantsLastSuccessAt = '2026-11-01T11:55:00Z';
closedPreviewData.days = closedPreviewData.event.schedule.map((day, index) => ({
  ...day, id: `closed-demo-day-${index + 1}`, title: `Demo archive · Day ${index + 1}`,
  problems: [1, 2].map(number => ({
    titleSlug: `closed-demo-${index + 1}-${number}`,
    title: `Demo problem ${index + 1}.${number}`,
    difficulty: number === 1 ? 'Easy' as const : 'Medium' as const,
    url: `https://leetcode.com/problems/closed-demo-${index + 1}-${number}/`,
  })),
}));
closedPreviewData.participants = closedPreviewData.participants.map((person, index) => {
  // 62/62, 47/62 and 20/62: full gold, mixed gold, and a broken final streak.
  const counts = closedPreviewData.days.map((_, day) => index === 0 ? 2 : index === 1 ? (day % 2 === 0 ? 2 : 1) : day < 20 ? 1 : 0);
  const total = counts.reduce<number>((sum, count) => sum + count, 0);
  const goldenDays = counts.filter(count => count === 2).length;
  return {
    ...person, rank: index + 1, problemsCompleted: total, daysCompleted: goldenDays,
    currentStreak: index === 2 ? 0 : 31, bestStreak: index === 2 ? 20 : 31,
    currentStreakLevel: counts[30], bestStreakGoldenDays: goldenDays,
    lastSyncedAt: '2026-11-01T11:55:00Z', syncFailed: false,
    dayProgress: closedPreviewData.days.map((d, i) => ({ date: d.date, onTimeProblems: counts[i] })),
    results: closedPreviewData.days.flatMap((d, day) => d.problems.map((p, problem) => ({
      titleSlug: p.titleSlug,
      firstAcceptedAt: problem < counts[day] ? `${d.date}T${index === 1 ? '14' : '13'}:00:00Z` : null,
    }))),
  };
});
