import express, { Express } from 'express';
import type { Database } from 'better-sqlite3';
import { healthRouter } from './features/health/healthRouter';
import { createEmployeeRouter } from './features/employees/employeeRouter';
import { createAnalyticsRouter } from './features/analytics/analyticsRouter';

/**
 * Builds the Express application by wiring feature routers under `/api`.
 *
 * Takes a database handle so tests can inject an isolated in-memory SQLite
 * instance, keeping API (component) tests independent and parallel-safe.
 */
export function buildApp(db: Database): Express {
  const app = express();

  app.use(express.json());

  app.use('/api', healthRouter);
  app.use('/api', createEmployeeRouter(db));
  app.use('/api', createAnalyticsRouter(db));

  return app;
}
