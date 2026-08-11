import { randomUUID } from 'node:crypto';
import { formatUsd, toMinorUnits } from '../../domain/money';
import type { EmployeeRepository } from './employeeRepository';
import type { CreateEmployeeInput } from './employeeSchemas';
import type { Employee, EmployeeResponse } from './types';

/** Thrown when a create would violate the unique-email constraint. */
export class DuplicateEmailError extends Error {}

export interface EmployeeService {
  create(input: CreateEmployeeInput): EmployeeResponse;
  getById(id: string): EmployeeResponse | null;
}

function toResponse(employee: Employee): EmployeeResponse {
  return { ...employee, salaryFormatted: formatUsd(employee.salaryMinor) };
}

/**
 * Orchestrates employee writes/reads: converts the dollar salary to minor units,
 * assigns id + timestamps, and maps stored entities to API responses.
 * `now` and `generateId` are injectable so behavior can be made deterministic.
 */
export function createEmployeeService(
  repo: EmployeeRepository,
  now: () => string = () => new Date().toISOString(),
  generateId: () => string = () => randomUUID()
): EmployeeService {
  return {
    create(input) {
      const timestamp = now();
      const employee: Employee = {
        id: generateId(),
        name: input.name,
        email: input.email,
        department: input.department,
        country: input.country,
        title: input.title,
        hireDate: input.hireDate,
        employmentType: input.employmentType,
        status: input.status ?? 'active',
        managerId: input.managerId ?? null,
        salaryMinor: toMinorUnits(input.salary),
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      try {
        repo.insert(employee);
      } catch (err) {
        if (isUniqueEmailViolation(err)) {
          throw new DuplicateEmailError('Email already exists');
        }
        throw err;
      }

      return toResponse(employee);
    },

    getById(id) {
      const employee = repo.getById(id);
      return employee ? toResponse(employee) : null;
    },
  };
}

function isUniqueEmailViolation(err: unknown): boolean {
  return (
    err instanceof Error &&
    /UNIQUE constraint failed: employees\.email/i.test(err.message)
  );
}
