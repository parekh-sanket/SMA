import { z } from 'zod';

/**
 * Validation for creating an employee.
 * `salary` is accepted in major units (dollars) and converted to minor units
 * (cents) by the service. `status` defaults to 'active' and `managerId` is optional.
 */
export const createEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  department: z.string().min(1),
  country: z.string().min(1),
  title: z.string().min(1),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
  employmentType: z.enum(['full-time', 'part-time', 'contractor']),
  salary: z.number().finite().nonnegative(),
  managerId: z.string().min(1).optional(),
  status: z.enum(['active', 'terminated']).optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

/**
 * Validation for the directory list query. Values arrive as strings and are
 * coerced; omitted values fall back to sensible defaults.
 */
export const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25),
  q: z.string().trim().optional(),
  department: z.string().trim().optional(),
  country: z.string().trim().optional(),
  sortBy: z.enum(['name', 'salary']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;

/** Validation for adjusting an employee's salary (dollars in). */
export const adjustSalarySchema = z.object({
  salary: z.number().finite().nonnegative(),
});

export type AdjustSalaryInput = z.infer<typeof adjustSalarySchema>;

/**
 * Validation for editing an employee. Email and salary are not editable here
 * (email is the identity key; salary has its own adjust endpoint).
 */
export const updateEmployeeSchema = z.object({
  name: z.string().min(1),
  department: z.string().min(1),
  country: z.string().min(1),
  title: z.string().min(1),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
  employmentType: z.enum(['full-time', 'part-time', 'contractor']),
  status: z.enum(['active', 'terminated']),
  managerId: z.string().min(1).nullable().optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
