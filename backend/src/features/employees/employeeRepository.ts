import type { Database } from 'better-sqlite3';
import type { Employee, EmploymentType, EmployeeStatus } from './types';

export interface EmployeeRepository {
  insert(employee: Employee): void;
  getById(id: string): Employee | null;
}

interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  department: string;
  country: string;
  title: string;
  hire_date: string;
  employment_type: string;
  status: string;
  manager_id: string | null;
  base_salary_minor: number;
  created_at: string;
  updated_at: string;
}

function toEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    department: row.department,
    country: row.country,
    title: row.title,
    hireDate: row.hire_date,
    employmentType: row.employment_type as EmploymentType,
    status: row.status as EmployeeStatus,
    managerId: row.manager_id,
    salaryMinor: row.base_salary_minor,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createEmployeeRepository(db: Database): EmployeeRepository {
  const insertStmt = db.prepare(`
    INSERT INTO employees (
      id, name, email, department, country, title, hire_date,
      employment_type, status, manager_id, base_salary_minor,
      created_at, updated_at
    ) VALUES (
      @id, @name, @email, @department, @country, @title, @hireDate,
      @employmentType, @status, @managerId, @salaryMinor,
      @createdAt, @updatedAt
    )
  `);
  const getByIdStmt = db.prepare('SELECT * FROM employees WHERE id = ?');

  return {
    insert(employee) {
      insertStmt.run(employee);
    },
    getById(id) {
      const row = getByIdStmt.get(id) as EmployeeRow | undefined;
      return row ? toEmployee(row) : null;
    },
  };
}
