import { z } from 'zod';

/** A required, trimmed, non-empty string. */
const requiredText = z.string().trim().min(1);

/** A real calendar date in YYYY-MM-DD (rejects shapes like 2021-13-45). */
const hireDateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
  .refine((s) => {
    const d = new Date(`${s}T00:00:00.000Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, 'Invalid calendar date');

/** Salary in dollars: finite, non-negative, and within a sane upper bound. */
const salaryField = z.number().finite().nonnegative().max(1_000_000_000);

const employmentTypeField = z.enum(['full-time', 'part-time', 'contractor']);
const statusField = z.enum(['active', 'terminated']);

/**
 * Validation for creating an employee.
 * `salary` is accepted in major units (dollars) and converted to minor units
 * (cents) by the service. `status` defaults to 'active' and `managerId` is optional.
 */
export const createEmployeeSchema = z.object({
  name: requiredText,
  email: z.string().trim().email(),
  department: requiredText,
  country: requiredText,
  title: requiredText,
  hireDate: hireDateField,
  employmentType: employmentTypeField,
  salary: salaryField,
  managerId: requiredText.optional(),
  status: statusField.optional(),
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
  salary: salaryField,
});

export type AdjustSalaryInput = z.infer<typeof adjustSalarySchema>;

/**
 * Validation for editing an employee. Email and salary are not editable here
 * (email is the identity key; salary has its own adjust endpoint).
 */
export const updateEmployeeSchema = z.object({
  name: requiredText,
  department: requiredText,
  country: requiredText,
  title: requiredText,
  hireDate: hireDateField,
  employmentType: employmentTypeField,
  status: statusField,
  managerId: requiredText.nullable().optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
