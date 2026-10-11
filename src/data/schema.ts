import { z } from "zod";
import { normalizeSnapshot } from "./compatibility";
import { badgeSchema } from "../features/badges/schema";

const instant = z.string().datetime({ offset: true });
const problem = z.object({ titleSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), title: z.string(), difficulty: z.enum(['Easy','Medium','Hard']), url: z.string().url() })
  .refine(p => p.url === `https://leetcode.com/problems/${p.titleSlug}/`);
export const editorialSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/), titleSlug: z.string(), participant_id: z.string(),
  authorName: z.string(), username: z.string(), publishedAt: instant,
  idea: z.string(), solution: z.string(), filename: z.string(), language: z.string(), complexity: z.string(),
  rankingCreditSeconds: z.literal(3600).optional(),
  reviewedTopics: z.array(z.string()).optional(),
  videoUrl: z.string().url().refine(v => v.startsWith('https://')).optional(),
});
export type Editorial = z.infer<typeof editorialSchema>;
const currentDataSchema = z.object({
  editorials: z.array(editorialSchema).optional(), editorialsFailed: z.boolean().optional(),
  version: z.literal(1), demo: z.boolean(), generatedAt: instant, lastSuccessfulSyncAt: instant.nullable(), participantsLastSuccessAt: instant.nullable(), participantsFailed: z.boolean(),
  event: z.object({ timezone: z.string(), startAt: instant, closeAt: instant, totalProblems: z.literal(62), schedule: z.array(z.object({ date: z.string(), releaseAt: instant })) }),
  days: z.array(z.object({ id: z.string(), date: z.string(), title: z.string(), description: z.string().optional(), releaseAt: instant, problems: z.array(problem).length(2) })),
  participants: z.array(z.object({ participant_id: z.string(), display_name: z.string(), leetcode_username: z.string().regex(/^[a-zA-Z0-9_-]{1,30}$/), rank: z.number().int().positive(),
    badges: z.array(badgeSchema).max(50).optional(),
    problemsCompleted: z.number().int().min(0).max(62), daysCompleted: z.number().int().min(0).max(31), currentStreak: z.number().int().min(0).max(31), bestStreak: z.number().int().min(0).max(31),
    completionTimeSeconds: z.number().nonnegative().optional(),
    latePenaltySeconds: z.number().nonnegative().optional(),
    rankingTimeSeconds: z.number().nonnegative().optional(),
    editorialCreditSeconds: z.number().nonnegative().optional(),
    creditedEditorials: z.number().int().nonnegative().optional(),
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
export const dataSchema = z.preprocess(normalizeSnapshot, currentDataSchema);
export type EventData = z.infer<typeof dataSchema>;
export type Day = EventData['days'][number];
export type Participant = EventData['participants'][number];
