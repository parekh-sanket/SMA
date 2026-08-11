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
