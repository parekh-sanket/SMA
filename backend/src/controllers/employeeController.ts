import type { Request, Response } from 'express';
import { DuplicateEmailError } from '../services/employeeService';
import type { EmployeeService } from '../services/employeeService';
import {
  adjustSalarySchema,
  createEmployeeSchema,
  listEmployeesQuerySchema,
  updateEmployeeSchema,
} from '../validation/employeeSchemas';

/**
 * Employee HTTP handlers. Thin layer: validate input, delegate to the service,
 * and map outcomes to status codes.
 */
export function createEmployeeController(service: EmployeeService) {
  return {
    create(req: Request, res: Response) {
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
    },

    facets(_req: Request, res: Response) {
      res.json(service.getFacets());
    },

    list(req: Request, res: Response) {
      const parsed = listEmployeesQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
        return;
      }
      res.json(service.list(parsed.data));
    },

    getById(req: Request, res: Response) {
      const employee = service.getById(req.params.id);
      if (!employee) {
        res.status(404).json({ error: 'NotFound' });
        return;
      }
      res.json(employee);
    },

    adjustSalary(req: Request, res: Response) {
      const parsed = adjustSalarySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
        return;
      }

      const updated = service.adjustSalary(req.params.id, parsed.data.salary);
      if (!updated) {
        res.status(404).json({ error: 'NotFound' });
        return;
      }
      res.json(updated);
    },

    update(req: Request, res: Response) {
      const parsed = updateEmployeeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
        return;
      }

      const updated = service.update(req.params.id, parsed.data);
      if (!updated) {
        res.status(404).json({ error: 'NotFound' });
        return;
      }
      res.json(updated);
    },

    remove(req: Request, res: Response) {
      const deleted = service.deleteById(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: 'NotFound' });
        return;
      }
      res.status(204).send();
    },
  };
}
