import { Router } from 'express';
import type { Database } from 'better-sqlite3';
import { createEmployeeRepository } from './employeeRepository';
import { createEmployeeService, DuplicateEmailError } from './employeeService';
import { createEmployeeSchema, listEmployeesQuerySchema } from './employeeSchemas';

/**
 * Employee HTTP routes. Thin layer: validate input, delegate to the service,
 * and map outcomes to status codes. Mounted under `/api`.
 *
 * Route order matters: `/employees/facets` and `/employees` are declared before
 * `/employees/:id` so that "facets" is not captured as an id.
 */
export function createEmployeeRouter(db: Database): Router {
  const service = createEmployeeService(createEmployeeRepository(db));
  const router = Router();

  router.post('/employees', (req, res) => {
    const parsed = createEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
      return;
    }

    try {
      const created = service.create(parsed.data);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof DuplicateEmailError) {
        res.status(409).json({ error: 'DuplicateEmail' });
        return;
      }
      throw err;
    }
  });

  router.get('/employees/facets', (_req, res) => {
    res.json(service.getFacets());
  });

  router.get('/employees', (req, res) => {
    const parsed = listEmployeesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
      return;
    }
    res.json(service.list(parsed.data));
  });

  router.get('/employees/:id', (req, res) => {
    const employee = service.getById(req.params.id);
    if (!employee) {
      res.status(404).json({ error: 'NotFound' });
      return;
    }
    res.json(employee);
  });

  return router;
}
