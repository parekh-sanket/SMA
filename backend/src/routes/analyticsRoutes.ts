import { Router } from 'express';
import type { Database } from 'better-sqlite3';
import { createEmployeeRepository } from '../services/employeeRepository';
import { createAnalyticsService } from '../services/analyticsService';
import { createAnalyticsController } from '../controllers/analyticsController';

/**
 * Analytics HTTP routes ("how the org pays people"). Mounted under `/api`.
 */
export function createAnalyticsRouter(db: Database): Router {
  const service = createAnalyticsService(createEmployeeRepository(db));
  const controller = createAnalyticsController(service);
  const router = Router();

  router.get('/analytics/summary', controller.summary);
  router.get('/analytics/breakdown', controller.breakdown);
  router.get('/analytics/top-earners', controller.topEarners);
  router.get('/analytics/distribution', controller.distribution);
  router.get('/analytics/insights', controller.insights);

  return router;
}
