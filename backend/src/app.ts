import express, { Express } from 'express';
import { healthRouter } from './features/health/healthRouter';

/**
 * Builds the Express application by wiring feature routers under `/api`.
 *
 * A factory (rather than a module-level singleton) so tests can construct an
 * isolated app instance. A database handle will be injected here in later features.
 */
export function buildApp(): Express {
  const app = express();

  app.use(express.json());

  app.use('/api', healthRouter);

  return app;
}
