import { selectedEdition, editionURL } from "./editions";
import { z } from 'zod';

const instant = z.string().datetime({ offset: true });
const problem = z.object({ titleSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), title: z.string(), difficulty: z.enum(['Easy','Medium','Hard']), url: z.string().url() })
  .refine(p => p.url === `https://leetcode.com/problems/${p.titleSlug}/`);
export const editorialSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/), titleSlug: z.string(), participant_id: z.string(),
  authorName: z.string(), username: z.string(), publishedAt: instant,
  idea: z.string(), solution: z.string(), filename: z.string(), language: z.string(), complexity: z.string(),
  videoUrl: z.string().url().refine(v => v.startsWith('https://')).optional(),
});
export type Editorial = z.infer<typeof editorialSchema>;
const currentDataSchema = z.object({
  editorials: z.array(editorialSchema).optional(), editorialsFailed: z.boolean().optional(),
  version: z.literal(1), demo: z.boolean(), generatedAt: instant, lastSuccessfulSyncAt: instant.nullable(), participantsLastSuccessAt: instant.nullable(), participantsFailed: z.boolean(),
  event: z.object({ timezone: z.string(), startAt: instant, closeAt: instant, totalProblems: z.literal(62), schedule: z.array(z.object({ date: z.string(), releaseAt: instant })) }),
  days: z.array(z.object({ id: z.string(), date: z.string(), title: z.string(), releaseAt: instant, problems: z.array(problem).length(2) })),
  participants: z.array(z.object({ participant_id: z.string(), display_name: z.string(), leetcode_username: z.string().regex(/^[a-zA-Z0-9_-]{1,30}$/), rank: z.number().int().positive(),
    problemsCompleted: z.number().int().min(0).max(62), daysCompleted: z.number().int().min(0).max(31), currentStreak: z.number().int().min(0).max(31), bestStreak: z.number().int().min(0).max(31),
    completionTimeSeconds: z.number().nonnegative().optional(),
    onTimeProblemsCompleted: z.number().int().min(0).max(62).optional(),
    currentStreakLevel: z.number().int().min(0).max(2).optional(),
    bestStreakGoldenDays: z.number().int().min(0).max(31).optional(),
    dayProgress: z.array(z.object({ date: z.string(), onTimeProblems: z.number().int().min(0).max(2) })).optional(),
    lastSyncedAt: instant.nullable(), syncFailed: z.boolean(), results: z.array(z.object({ titleSlug: z.string(), firstAcceptedAt: instant.nullable() })),
  })),
}).superRefine((data, context) => {
  const slugs = new Set(data.days.flatMap(d => d.problems.map(p => p.titleSlug)));
  if (data.days.some(d => Date.parse(d.releaseAt) > Date.parse(data.generatedAt)) || data.participants.some(p => p.results.some(r => !slugs.has(r.titleSlug)))) {
    context.addIssue({ code: 'custom', message: 'Invalid published snapshot' });
  }
});
// Continue reading existing snapshots while the private publisher is upgraded.
export const dataSchema = z.preprocess((input) => {
  if (!input || typeof input !== 'object') return input;
  const data = input as Record<string, unknown>;
  return {
    ...data,
    participantsLastSuccessAt: Object.hasOwn(data, 'participantsLastSuccessAt') ? data.participantsLastSuccessAt : data.sheetsLastSuccessAt,
    participantsFailed: Object.hasOwn(data, 'participantsFailed') ? data.participantsFailed : data.sheetsFailed,
  };
}, currentDataSchema);
export type EventData = z.infer<typeof dataSchema>;
export type Day = EventData['days'][number];
export type Participant = EventData['participants'][number];
export function filterParticipants(participants: Participant[], query: string) {
  const value = query.trim().toLocaleLowerCase('en');
  return participants.filter(p => `${p.display_name}\n${p.leetcode_username}`.toLocaleLowerCase('en').includes(value));
}
export function dataURL(base = (selectedEdition.year === 2026 && import.meta.env.VITE_PUBLIC_DATA_BASE_URL) || `${editionURL(selectedEdition.year)}${selectedEdition.snapshot?.replace(/data.json$/, "") || "data/"}`) {
  const url = new URL(base.endsWith('/') ? base : `${base}/`, window.location.href);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid data URL');
  return new URL('data.json', url).href;
}
export function formURL(value: string | undefined, embed = false) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (url.hostname === 'docs.google.com' && url.pathname.startsWith('/forms/')) return url.href;
    if (!embed && url.hostname === 'forms.gle') return url.href;
  } catch { /* Invalid form configuration is presented as unavailable. */ }
  return null;
}

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
export function compareDailyFirst(a: Participant, b: Participant, data: EventData) {
  for (const day of [...data.days].sort((x, y) => Date.parse(y.releaseAt) - Date.parse(x.releaseAt))) {
    const first = (person: Participant) => Math.min(...person.results
      .filter(r => r.firstAcceptedAt && day.problems.some(p => p.titleSlug === r.titleSlug)
        && Date.parse(r.firstAcceptedAt) >= Date.parse(day.releaseAt)
        && Date.parse(r.firstAcceptedAt) < Date.parse(data.event.closeAt)
        && Date.parse(r.firstAcceptedAt) <= Date.parse(data.generatedAt))
      .map(r => Date.parse(r.firstAcceptedAt!)));
    const left = first(a), right = first(b);
    if (left !== right) return left < right ? -1 : 1;
  }
  return 0;
}
// Derive from acceptance dates so old snapshots use the same tie-break immediately.
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
export function orderedParticipants(data: EventData) {
  return [...data.participants].sort((a, b) => b.problemsCompleted - a.problemsCompleted
    || onTimeProblemsCompleted(b, data) - onTimeProblemsCompleted(a, data)
    || compareDailyFirst(a, b, data)
    || b.bestStreak - a.bestStreak || a.display_name.localeCompare(b.display_name, 'en')
    || a.participant_id.localeCompare(b.participant_id))
    .map((p, i) => ({ ...p, rank: i + 1 }));
}
export function elapsedLabel(seconds: number) {
  return `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m ${Math.floor(seconds % 60)}s`;
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
