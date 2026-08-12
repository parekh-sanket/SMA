import type { EmployeeStatus, EmploymentType } from '../../types/models';

/** Human-friendly display labels (values stay lowercase in the data). */
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contractor: 'Contractor',
};

export const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Active',
  terminated: 'Terminated',
};
