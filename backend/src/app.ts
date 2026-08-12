import express, { Express } from 'express';
import type { Database } from 'better-sqlite3';
import { healthRouter } from './routes/healthRoutes';
import { createAuthRouter } from './routes/authRoutes';
import { createEmployeeRouter } from './routes/employeeRoutes';
import { createAnalyticsRouter } from './routes/analyticsRoutes';

/**
 * Builds the Express application by wiring routers under `/api`.
 *
 * Takes a database handle so tests can inject an isolated in-memory SQLite
 * instance, keeping API (component) tests independent and parallel-safe.
 *
 * `/api/health` and `/api/auth/login` are open; the employee and analytics
 * routers enforce their own `requireAuth` guard.
 */
export function buildApp(db: Database): Express {
  const app = express();

  app.use(express.json());

  app.use('/api', healthRouter);
  app.use('/api', createAuthRouter());
  app.use('/api', createEmployeeRouter(db));
  app.use('/api', createAnalyticsRouter(db));

  return app;
}
