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

export type SortBy = 'name' | 'salary';
export type SortOrder = 'asc' | 'desc';

/** Options for a paginated/filtered/sorted employee query. */
export interface ListEmployeesOptions {
  page: number;
  pageSize: number;
  q?: string;
  department?: string;
  country?: string;
  sortBy: SortBy;
  order: SortOrder;
}

/** A page of employees plus the total matching the filters (ignoring pagination). */
export interface PaginatedEmployees {
  data: Employee[];
  total: number;
}

/** Distinct values available for filtering. */
export interface EmployeeFacets {
  departments: string[];
  countries: string[];
  titles: string[];
}

/** Filters for a country/role salary slice (both optional). */
export interface SliceFilters {
  country?: string;
  title?: string;
}

/** Aggregate salary stats for a slice (minor units; zeros when empty). */
export interface SliceStats {
  count: number;
  min: number;
  max: number;
  average: number;
}

/** One grouped row of an aggregate breakdown (all money in minor units). */
export interface BreakdownGroup {
  key: string;
  count: number;
  total: number;
  average: number;
}

/** The editable subset of an employee (email and salary are managed separately). */
export interface UpdateEmployeeFields {
  name: string;
  department: string;
  country: string;
  title: string;
  hireDate: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  managerId: string | null;
}
