import type {
  CreateEmployeeInput,
  Employee,
  EmployeeFacets,
  ListEmployeesQuery,
  PaginatedEmployees,
  UpdateEmployeeInput,
} from '../../types/models';

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

export async function listEmployees(query: ListEmployeesQuery): Promise<PaginatedEmployees> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortBy: query.sortBy,
    order: query.order,
  });
  if (query.q) params.set('q', query.q);
  if (query.department) params.set('department', query.department);
  if (query.country) params.set('country', query.country);

  const res = await fetch(`/api/employees?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to list employees (${res.status})`);
  }
  return (await res.json()) as PaginatedEmployees;
}

export async function adjustSalary(id: string, salary: number): Promise<Employee> {
  const res = await fetch(`/api/employees/${id}/salary`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ salary }),
  });
  if (res.status === 404) {
    throw new EmployeeNotFoundError('Employee not found');
  }
  if (!res.ok) {
    throw new Error(`Failed to adjust salary (${res.status})`);
  }
  return (await res.json()) as Employee;
}

export async function updateEmployee(
  id: string,
  input: UpdateEmployeeInput
): Promise<Employee> {
  const res = await fetch(`/api/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (res.status === 404) {
    throw new EmployeeNotFoundError('Employee not found');
  }
  if (!res.ok) {
    throw new Error(`Failed to update employee (${res.status})`);
  }
  return (await res.json()) as Employee;
}

export async function deleteEmployee(id: string): Promise<void> {
  const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
  if (res.status === 404) {
    throw new EmployeeNotFoundError('Employee not found');
  }
  if (!res.ok) {
    throw new Error(`Failed to delete employee (${res.status})`);
  }
}

export async function getFacets(): Promise<EmployeeFacets> {
  const res = await fetch('/api/employees/facets');
  if (!res.ok) {
    throw new Error(`Failed to load facets (${res.status})`);
  }
  return (await res.json()) as EmployeeFacets;
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
