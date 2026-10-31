import { wishPreviewData } from './wish-preview';

// Entirely fictional calendar and participants; no private problem package is imported.
export const challengePreviewData = wishPreviewData('wish-winner');
const data = challengePreviewData;
data.generatedAt = '2026-10-31T13:00:00Z';
data.lastSuccessfulSyncAt = data.generatedAt;
data.participantsLastSuccessAt = data.generatedAt;
for (let day = 1; day <= 31; day++) {
  const date = `2026-10-${String(day).padStart(2, '0')}`;
  if (data.days.some(d => d.date === date)) continue;
  data.days.push({ id: `answer-preview-${day}`, date, releaseAt: `${date}T12:00:00Z`,
    title: day === 31 ? 'The final pair · Demo' : 'Local preview day',
    description: day === 31 ? 'A LeetCode practice problem and an answer-only challenge. Fictional content for testing.' : 'Illustrative content only.',
    problems: [1, 2].map(n => {
      const titleSlug = day === 31 && n === 2 ? 'demo-potion-ledger' : `answer-preview-${day}-${n}`;
      return { titleSlug, title: day === 31 && n === 2 ? 'Potion Ledger · Test problem' : 'Illustrative practice problem', difficulty: 'Easy' as const,
        url: `https://leetcode.com/problems/${titleSlug}/` };
    }),
  });
}
data.days.sort((a,b) => a.date.localeCompare(b.date));
for (const person of data.participants) {
  person.lastSyncedAt = data.generatedAt;
  const existing = new Set(person.results.map(r => r.titleSlug));
  for (const day of data.days) for (const problem of day.problems) {
    if (!existing.has(problem.titleSlug)) person.results.push({ titleSlug: problem.titleSlug, firstAcceptedAt: null });
  }
}
