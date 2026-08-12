import type { Database } from 'better-sqlite3';
import { createEmployeeRepository } from './employeeRepository';
import type { Employee, EmployeeStatus, EmploymentType } from './types';

/** Deterministic PRNG (mulberry32) so a given seed always yields the same dataset. */
function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'Ada', 'Grace', 'Alan', 'Katherine', 'Linus', 'Margaret', 'Dennis', 'Barbara',
  'Ken', 'Radia', 'Guido', 'Anita', 'Bjarne', 'Sophie', 'James', 'Maria', 'Omar',
  'Yuki', 'Wei', 'Priya', 'Carlos', 'Fatima', 'Liam', 'Noah', 'Emma', 'Olivia',
  'Ravi', 'Sofia', 'Hiroshi', 'Ingrid', 'Diego', 'Amara', 'Chen', 'Lucas',
];

const LAST_NAMES = [
  'Lovelace', 'Hopper', 'Turing', 'Johnson', 'Torvalds', 'Hamilton', 'Ritchie',
  'Liskov', 'Thompson', 'Perlman', 'Rossum', 'Borg', 'Stroustrup', 'Wilson',
  'Smith', 'Garcia', 'Khan', 'Tanaka', 'Chen', 'Patel', 'Silva', 'Ahmed',
  'Murphy', 'Nguyen', 'Kim', 'Muller', 'Rossi', 'Dubois', 'Sato', 'Andersson',
];

interface Role {
  title: string;
  base: number; // annual base salary in USD
}

const DEPARTMENTS: { name: string; roles: Role[] }[] = [
  { name: 'Engineering', roles: [{ title: 'Software Engineer', base: 95000 }, { title: 'Senior Software Engineer', base: 135000 }, { title: 'Staff Engineer', base: 175000 }, { title: 'Engineering Manager', base: 185000 }] },
  { name: 'Product', roles: [{ title: 'Product Manager', base: 120000 }, { title: 'Senior Product Manager', base: 155000 }, { title: 'Product Director', base: 190000 }] },
  { name: 'Design', roles: [{ title: 'Product Designer', base: 95000 }, { title: 'Senior Designer', base: 125000 }, { title: 'Design Lead', base: 150000 }] },
  { name: 'Sales', roles: [{ title: 'Account Executive', base: 80000 }, { title: 'Sales Manager', base: 120000 }, { title: 'VP Sales', base: 200000 }] },
  { name: 'Marketing', roles: [{ title: 'Marketing Specialist', base: 70000 }, { title: 'Marketing Manager', base: 110000 }, { title: 'CMO', base: 210000 }] },
  { name: 'Customer Support', roles: [{ title: 'Support Specialist', base: 55000 }, { title: 'Support Lead', base: 85000 }] },
  { name: 'Finance', roles: [{ title: 'Financial Analyst', base: 85000 }, { title: 'Finance Manager', base: 130000 }, { title: 'CFO', base: 230000 }] },
  { name: 'Human Resources', roles: [{ title: 'HR Coordinator', base: 65000 }, { title: 'HR Manager', base: 110000 }] },
  { name: 'Legal', roles: [{ title: 'Legal Counsel', base: 140000 }, { title: 'General Counsel', base: 220000 }] },
  { name: 'Operations', roles: [{ title: 'Operations Analyst', base: 75000 }, { title: 'Operations Manager', base: 120000 }] },
  { name: 'IT', roles: [{ title: 'IT Support', base: 60000 }, { title: 'Systems Administrator', base: 95000 }, { title: 'IT Manager', base: 130000 }] },
  { name: 'Data & Analytics', roles: [{ title: 'Data Analyst', base: 95000 }, { title: 'Data Scientist', base: 135000 }, { title: 'Analytics Manager', base: 160000 }] },
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

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

function pad(n: number): string {
  return String(n).padStart(6, '0');
}

function randomHireDate(rng: () => number): string {
  const year = 2015 + Math.floor(rng() * 11); // 2015..2025
  const month = 1 + Math.floor(rng() * 12);
  const day = 1 + Math.floor(rng() * 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Deterministically generates `count` employees for the given `seed`.
 * Salaries scale with role seniority and country; some employees report to an
 * earlier-generated employee.
 */
export function generateEmployees(count: number, seed: number): Employee[] {
  const rng = createRng(seed);
  const employees: Employee[] = [];

  for (let i = 0; i < count; i++) {
    const first = pick(FIRST_NAMES, rng);
    const last = pick(LAST_NAMES, rng);
    const dept = pick(DEPARTMENTS, rng);
    const role = pick(dept.roles, rng);
    const country = pick(COUNTRIES, rng);

    const employmentRoll = rng();
    const employmentType: EmploymentType =
      employmentRoll < 0.8 ? EMPLOYMENT_TYPES[0] : employmentRoll < 0.92 ? EMPLOYMENT_TYPES[1] : EMPLOYMENT_TYPES[2];
    const status: EmployeeStatus = rng() < 0.08 ? 'terminated' : 'active';

    const salaryDollars = Math.round(role.base * country.mult * (0.85 + rng() * 0.35));
    const hireDate = randomHireDate(rng);
    const managerRoll = rng();
    const managerId = i > 0 && managerRoll < 0.85 ? `emp-${pad(1 + Math.floor(rng() * i))}` : null;

    employees.push({
      id: `emp-${pad(i + 1)}`,
      name: `${first} ${last}`,
      email: `${first}.${last}${i + 1}@acme.test`.toLowerCase(),
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
 * Seeds `count` deterministic employees into `db` in a single transaction (fast).
 */
export function seedDatabase(db: Database, count: number, seed: number): void {
  const repo = createEmployeeRepository(db);
  const insertAll = db.transaction((employees: Employee[]) => {
    for (const employee of employees) repo.insert(employee);
  });
  insertAll(generateEmployees(count, seed));
}
