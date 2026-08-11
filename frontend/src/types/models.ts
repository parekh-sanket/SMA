/**
 * Shared domain models used across features (directory, detail, form, analytics).
 * These mirror the backend's API representation.
 */

export type EmploymentType = 'full-time' | 'part-time' | 'contractor';
export type EmployeeStatus = 'active' | 'terminated';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  country: string;
  title: string;
  hireDate: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  managerId: string | null;
  salaryMinor: number;
  salaryFormatted: string;
  createdAt: string;
  updatedAt: string;
}

export type SortBy = 'name' | 'salary';
export type SortOrder = 'asc' | 'desc';

/** Query for the directory list. */
export interface ListEmployeesQuery {
  page: number;
  pageSize: number;
  q?: string;
  department?: string;
  country?: string;
  sortBy: SortBy;
  order: SortOrder;
}

/** A page of employees plus the total matching the filters. */
export interface PaginatedEmployees {
  data: Employee[];
  page: number;
  pageSize: number;
  total: number;
}

/** Distinct values available for filtering. */
export interface EmployeeFacets {
  departments: string[];
  countries: string[];
}

/** Payload for creating an employee. Salary is sent in major units (dollars). */
export interface CreateEmployeeInput {
  name: string;
  email: string;
  department: string;
  country: string;
  title: string;
  hireDate: string;
  employmentType: EmploymentType;
  salary: number;
  managerId?: string;
  status?: EmployeeStatus;
}
