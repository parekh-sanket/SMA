export type EmploymentType = 'full-time' | 'part-time' | 'contractor';
export type EmployeeStatus = 'active' | 'terminated';

/**
 * The stored employee entity. Money is held as integer minor units (USD cents).
 * This is the shape the repository reads and writes.
 */
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
  createdAt: string;
  updatedAt: string;
}

/**
 * The API representation: the stored entity plus a human-readable salary string.
 */
export interface EmployeeResponse extends Employee {
  salaryFormatted: string;
}
