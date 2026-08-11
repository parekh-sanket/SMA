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
