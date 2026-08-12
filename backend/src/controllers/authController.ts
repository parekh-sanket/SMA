import type { Request, Response } from 'express';
import { loginSchema } from '../validation/authSchemas';
import { issueToken, verifyCredentials } from '../services/authService';

export function createAuthController() {
  return {
    login(req: Request, res: Response) {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
        return;
      }

      const { username, password } = parsed.data;
      if (!verifyCredentials(username, password)) {
        res.status(401).json({ error: 'InvalidCredentials' });
        return;
      }

      res.json({ token: issueToken() });
    },
  };
}
