import { z } from 'zod';

const instant = z.string().datetime({ offset: true });
const problem = z.object({ titleSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), title: z.string(), difficulty: z.enum(['Easy','Medium','Hard']), url: z.string().url() })
  .refine(p => p.url === `https://leetcode.com/problems/${p.titleSlug}/`);
const currentDataSchema = z.object({
  version: z.literal(1), demo: z.boolean(), generatedAt: instant, lastSuccessfulSyncAt: instant.nullable(), participantsLastSuccessAt: instant.nullable(), participantsFailed: z.boolean(),
  event: z.object({ timezone: z.string(), startAt: instant, closeAt: instant, totalProblems: z.literal(62), schedule: z.array(z.object({ date: z.string(), releaseAt: instant })) }),
  days: z.array(z.object({ id: z.string(), date: z.string(), title: z.string(), releaseAt: instant, problems: z.array(problem).length(2) })),
  participants: z.array(z.object({ participant_id: z.string(), display_name: z.string(), leetcode_username: z.string().regex(/^[a-zA-Z0-9_-]{1,30}$/), rank: z.number().int().positive(),
    problemsCompleted: z.number().int().min(0).max(62), daysCompleted: z.number().int().min(0).max(31), currentStreak: z.number().int().min(0).max(31), bestStreak: z.number().int().min(0).max(31),
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
export function dataURL(base = import.meta.env.VITE_PUBLIC_DATA_BASE_URL || `${import.meta.env.BASE_URL}data/`) {
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
