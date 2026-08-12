import { randomUUID } from 'node:crypto';
import { formatUsd, toMinorUnits } from '../../domain/money';
import type { EmployeeRepository } from './employeeRepository';
import type { CreateEmployeeInput, ListEmployeesQuery } from './employeeSchemas';
import type { Employee, EmployeeFacets, EmployeeResponse } from './types';

/** Thrown when a create would violate the unique-email constraint. */
export class DuplicateEmailError extends Error {}

export interface PaginatedEmployeeResponse {
  data: EmployeeResponse[];
  page: number;
  pageSize: number;
  total: number;
}

export interface EmployeeService {
  create(input: CreateEmployeeInput): EmployeeResponse;
  getById(id: string): EmployeeResponse | null;
  list(query: ListEmployeesQuery): PaginatedEmployeeResponse;
  getFacets(): EmployeeFacets;
  adjustSalary(id: string, salary: number): EmployeeResponse | null;
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

    list(query) {
      const { data, total } = repo.list(query);
      return {
        data: data.map(toResponse),
        page: query.page,
        pageSize: query.pageSize,
        total,
      };
    },

    getFacets() {
      return repo.facets();
    },

    adjustSalary(id, salary) {
      const changed = repo.updateSalary(id, toMinorUnits(salary), now());
      if (!changed) return null;
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
