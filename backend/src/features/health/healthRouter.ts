import { Router } from 'express';

/**
 * Health feature router. Mounted under `/api` by the app.
 * Reports basic liveness so clients (and deploy platforms) can probe the API.
 */
export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
