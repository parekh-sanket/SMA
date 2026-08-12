import { Router } from 'express';
import { createAuthController } from '../controllers/authController';

/** Auth routes. Open (not gated). Mounted under `/api`. */
export function createAuthRouter(): Router {
  const controller = createAuthController();
  const router = Router();

  router.post('/auth/login', controller.login);

  return router;
}
