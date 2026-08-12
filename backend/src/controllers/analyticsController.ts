import type { Request, Response } from 'express';
import { z } from 'zod';
import type { AnalyticsService } from '../services/analyticsService';

const breakdownQuerySchema = z.object({
  dimension: z.enum(['department', 'country']),
});

const topEarnersQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(10),
});

/**
 * Analytics HTTP handlers ("how the org pays people").
 */
export function createAnalyticsController(service: AnalyticsService) {
  return {
    summary(_req: Request, res: Response) {
      res.json(service.summary());
    },

    breakdown(req: Request, res: Response) {
      const parsed = breakdownQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
        return;
      }
      res.json(service.breakdown(parsed.data.dimension));
    },

    topEarners(req: Request, res: Response) {
      const parsed = topEarnersQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
        return;
      }
      res.json(service.topEarners(parsed.data.limit));
    },

    distribution(_req: Request, res: Response) {
      res.json(service.distribution());
    },
  };
}
