import type { CreateEmployeeInput, Employee } from '../../types/models';

/** Thrown when GET /api/employees/:id returns 404. */
export class EmployeeNotFoundError extends Error {}

/** Thrown when POST /api/employees returns 409 (duplicate email). */
export class DuplicateEmailError extends Error {}

export async function getEmployee(id: string): Promise<Employee> {
  const res = await fetch(`/api/employees/${id}`);
  if (res.status === 404) {
    throw new EmployeeNotFoundError('Employee not found');
  }
  if (!res.ok) {
    throw new Error(`Failed to load employee (${res.status})`);
  }
  return (await res.json()) as Employee;
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const res = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (res.status === 409) {
    throw new DuplicateEmailError('Email already exists');
  }
  if (!res.ok) {
    throw new Error(`Failed to create employee (${res.status})`);
  }
  return (await res.json()) as Employee;
}
