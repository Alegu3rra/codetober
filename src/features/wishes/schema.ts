import { z } from 'zod';

const instant = z.string().datetime({ offset: true });
export const wishEventSchema = z.object({
  id: z.string(), date: z.string(), startAt: instant, endAt: instant,
  contactEmail: z.string().email(), bonusSeconds: z.literal(7200),
  result: z.object({
    status: z.enum(['announced', 'open', 'review', 'no-winner', 'confirmed', 'wish-review', 'approved', 'applied', 'expired']),
    candidates: z.array(z.object({ participant_id: z.string(), firstAcceptedAt: instant, completedAt: instant })),
    winnerId: z.string().optional(), confirmedAt: instant.optional(), wishId: z.string().optional(), wishText: z.string().optional(),
  }),
});
export type WishEvent = z.infer<typeof wishEventSchema>;
