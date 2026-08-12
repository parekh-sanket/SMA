import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../services/authService';

/**
 * Gate that rejects requests without a valid `Authorization: Bearer <token>`.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== 'bearer' || !token || !verifyToken(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
