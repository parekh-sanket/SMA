import type { Database } from 'better-sqlite3';
import { faker } from '@faker-js/faker';
import { createEmployeeRepository } from './employeeRepository';
import type { Employee, EmployeeStatus, EmploymentType } from './types';

interface Role {
  title: string;
  min: number; // annual salary band in USD (before the country multiplier)
  max: number;
}

const DEPARTMENTS: { name: string; roles: Role[] }[] = [
  { name: 'Engineering', roles: [{ title: 'Software Engineer', min: 80000, max: 120000 }, { title: 'Senior Software Engineer', min: 120000, max: 160000 }, { title: 'Staff Engineer', min: 160000, max: 210000 }, { title: 'Engineering Manager', min: 170000, max: 220000 }] },
  { name: 'Product', roles: [{ title: 'Product Manager', min: 105000, max: 140000 }, { title: 'Senior Product Manager', min: 140000, max: 180000 }, { title: 'Product Director', min: 175000, max: 230000 }] },
  { name: 'Design', roles: [{ title: 'Product Designer', min: 80000, max: 115000 }, { title: 'Senior Designer', min: 110000, max: 150000 }, { title: 'Design Lead', min: 135000, max: 180000 }] },
  { name: 'Sales', roles: [{ title: 'Account Executive', min: 65000, max: 110000 }, { title: 'Sales Manager', min: 100000, max: 150000 }, { title: 'VP Sales', min: 170000, max: 240000 }] },
  { name: 'Marketing', roles: [{ title: 'Marketing Specialist', min: 60000, max: 90000 }, { title: 'Marketing Manager', min: 95000, max: 135000 }, { title: 'CMO', min: 180000, max: 250000 }] },
  { name: 'Customer Support', roles: [{ title: 'Support Specialist', min: 45000, max: 70000 }, { title: 'Support Lead', min: 70000, max: 100000 }] },
  { name: 'Finance', roles: [{ title: 'Financial Analyst', min: 70000, max: 105000 }, { title: 'Finance Manager', min: 110000, max: 155000 }, { title: 'CFO', min: 200000, max: 280000 }] },
  { name: 'Human Resources', roles: [{ title: 'HR Coordinator', min: 55000, max: 80000 }, { title: 'HR Manager', min: 95000, max: 135000 }] },
  { name: 'Legal', roles: [{ title: 'Legal Counsel', min: 120000, max: 170000 }, { title: 'General Counsel', min: 190000, max: 260000 }] },
  { name: 'Operations', roles: [{ title: 'Operations Analyst', min: 65000, max: 95000 }, { title: 'Operations Manager', min: 100000, max: 145000 }] },
  { name: 'IT', roles: [{ title: 'IT Support', min: 50000, max: 75000 }, { title: 'Systems Administrator', min: 80000, max: 115000 }, { title: 'IT Manager', min: 110000, max: 155000 }] },
  { name: 'Data & Analytics', roles: [{ title: 'Data Analyst', min: 80000, max: 115000 }, { title: 'Data Scientist', min: 115000, max: 160000 }, { title: 'Analytics Manager', min: 140000, max: 190000 }] },
];

/** Country code + cost-of-labour multiplier applied to the base salary. */
const COUNTRIES: { code: string; mult: number }[] = [
  { code: 'US', mult: 1.0 }, { code: 'GB', mult: 0.85 }, { code: 'DE', mult: 0.8 },
  { code: 'IN', mult: 0.35 }, { code: 'CA', mult: 0.8 }, { code: 'AU', mult: 0.85 },
  { code: 'FR', mult: 0.78 }, { code: 'JP', mult: 0.75 }, { code: 'BR', mult: 0.4 },
  { code: 'NL', mult: 0.82 },
];

const EMPLOYMENT_TYPES: EmploymentType[] = ['full-time', 'part-time', 'contractor'];
const BASE_TS = '2026-01-01T00:00:00.000Z';

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pad(n: number): string {
  return String(n).padStart(6, '0');
}

function randomHireDate(): string {
  const year = 2015 + Math.floor(Math.random() * 11); // 2015..2025
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Generates `count` random employees. Salaries scale with role seniority and
 * country; some employees report to an earlier-generated employee.
 */
export function generateEmployees(count: number): Employee[] {
  const employees: Employee[] = [];

  for (let i = 0; i < count; i++) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const dept = pick(DEPARTMENTS);
    const role = pick(dept.roles);
    const country = pick(COUNTRIES);

    const employmentRoll = Math.random();
    const employmentType: EmploymentType =
      employmentRoll < 0.8 ? EMPLOYMENT_TYPES[0] : employmentRoll < 0.92 ? EMPLOYMENT_TYPES[1] : EMPLOYMENT_TYPES[2];
    const status: EmployeeStatus = Math.random() < 0.08 ? 'terminated' : 'active';

    const roleSalary = faker.number.int({ min: role.min, max: role.max });
    const salaryDollars = Math.round(roleSalary * country.mult);
    const hireDate = randomHireDate();
    const managerId = i > 0 && Math.random() < 0.85 ? `emp-${pad(1 + Math.floor(Math.random() * i))}` : null;

    const emailLocal = `${first}.${last}.${i + 1}`
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '');

    employees.push({
      id: `emp-${pad(i + 1)}`,
      name: `${first} ${last}`,
      email: `${emailLocal}@acme.test`,
      department: dept.name,
      country: country.code,
      title: role.title,
      hireDate,
      employmentType,
      status,
      managerId,
      salaryMinor: salaryDollars * 100,
      createdAt: BASE_TS,
      updatedAt: BASE_TS,
    });
  }

  return employees;
}

/**
 * Seeds `count` random employees into `db` in a single transaction (fast).
 */
export function seedDatabase(db: Database, count: number): void {
  const repo = createEmployeeRepository(db);
  const insertAll = db.transaction((employees: Employee[]) => {
    for (const employee of employees) repo.insert(employee);
  });
  insertAll(generateEmployees(count));
}
