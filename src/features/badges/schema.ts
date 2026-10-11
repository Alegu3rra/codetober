import { z } from 'zod';

export const badgeSchema = z.object({
  id: z.string().regex(/^[a-z]+(?:-[a-z]+)*$/),
  category: z.enum(['topic', 'consistency', 'achievement', 'contribution', 'activity']),
  ruleVersion: z.literal(1),
  evaluatedAt: z.string().datetime({ offset: true }),
  level: z.union([z.literal(1), z.literal(2)]).optional(),
  evidence: z.record(z.string(), z.number().int().nonnegative()),
});
export type ParticipantBadge = z.infer<typeof badgeSchema>;
