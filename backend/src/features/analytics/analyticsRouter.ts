import { Router } from 'express';
import { z } from 'zod';
import type { Database } from 'better-sqlite3';
import { createEmployeeRepository } from '../employees/employeeRepository';
import { createAnalyticsService } from './analyticsService';

const breakdownQuerySchema = z.object({
  dimension: z.enum(['department', 'country']),
});

const topEarnersQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(10),
});

/**
 * Analytics HTTP routes ("how the org pays people"). Mounted under `/api`.
 */
export function createAnalyticsRouter(db: Database): Router {
  const service = createAnalyticsService(createEmployeeRepository(db));
  const router = Router();

  router.get('/analytics/summary', (_req, res) => {
    res.json(service.summary());
  });

  router.get('/analytics/breakdown', (req, res) => {
    const parsed = breakdownQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
      return;
    }
    res.json(service.breakdown(parsed.data.dimension));
  });

  router.get('/analytics/top-earners', (req, res) => {
    const parsed = topEarnersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
      return;
    }
    res.json(service.topEarners(parsed.data.limit));
  });

  router.get('/analytics/distribution', (_req, res) => {
    res.json(service.distribution());
  });

  return router;
}
