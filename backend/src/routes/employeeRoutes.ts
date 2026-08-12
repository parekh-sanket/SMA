import { Router } from 'express';
import type { Database } from 'better-sqlite3';
import { createEmployeeRepository } from '../services/employeeRepository';
import { createEmployeeService } from '../services/employeeService';
import { createEmployeeController } from '../controllers/employeeController';

/**
 * Employee HTTP routes. Wires endpoints to controller handlers. Mounted under `/api`.
 *
 * Route order matters: `/employees/facets` and `/employees` are declared before
 * `/employees/:id` so that "facets" is not captured as an id.
 */
export function createEmployeeRouter(db: Database): Router {
  const service = createEmployeeService(createEmployeeRepository(db));
  const controller = createEmployeeController(service);
  const router = Router();

  router.post('/employees', controller.create);
  router.get('/employees/facets', controller.facets);
  router.get('/employees', controller.list);
  router.get('/employees/:id', controller.getById);
  router.patch('/employees/:id/salary', controller.adjustSalary);
  router.put('/employees/:id', controller.update);
  router.delete('/employees/:id', controller.remove);

  return router;
}
