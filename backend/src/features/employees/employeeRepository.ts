import type { Database } from 'better-sqlite3';
import type {
  Employee,
  EmployeeFacets,
  EmploymentType,
  EmployeeStatus,
  ListEmployeesOptions,
  PaginatedEmployees,
  UpdateEmployeeFields,
} from './types';

export interface EmployeeRepository {
  insert(employee: Employee): void;
  getById(id: string): Employee | null;
  list(options: ListEmployeesOptions): PaginatedEmployees;
  facets(): EmployeeFacets;
  updateSalary(id: string, salaryMinor: number, updatedAt: string): boolean;
  update(id: string, fields: UpdateEmployeeFields, updatedAt: string): boolean;
  deleteById(id: string): boolean;
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
  const updateSalaryStmt = db.prepare(
    'UPDATE employees SET base_salary_minor = @salaryMinor, updated_at = @updatedAt WHERE id = @id'
  );
  const updateStmt = db.prepare(`
    UPDATE employees SET
      name = @name, department = @department, country = @country, title = @title,
      hire_date = @hireDate, employment_type = @employmentType, status = @status,
      manager_id = @managerId, updated_at = @updatedAt
    WHERE id = @id
  `);
  const deleteStmt = db.prepare('DELETE FROM employees WHERE id = ?');

  function buildFilters(options: ListEmployeesOptions): {
    where: string;
    params: Record<string, string>;
  } {
    const conditions: string[] = [];
    const params: Record<string, string> = {};
    if (options.q) {
      conditions.push('(name LIKE @q OR email LIKE @q)');
      params.q = `%${options.q}%`;
    }
    if (options.department) {
      conditions.push('department = @department');
      params.department = options.department;
    }
    if (options.country) {
      conditions.push('country = @country');
      params.country = options.country;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return { where, params };
  }

  return {
    insert(employee) {
      insertStmt.run(employee);
    },

    getById(id) {
      const row = getByIdStmt.get(id) as EmployeeRow | undefined;
      return row ? toEmployee(row) : null;
    },

    updateSalary(id, salaryMinor, updatedAt) {
      const info = updateSalaryStmt.run({ id, salaryMinor, updatedAt });
      return info.changes > 0;
    },

    update(id, fields, updatedAt) {
      const info = updateStmt.run({ id, ...fields, updatedAt });
      return info.changes > 0;
    },

    deleteById(id) {
      const info = deleteStmt.run(id);
      return info.changes > 0;
    },

    list(options) {
      const { where, params } = buildFilters(options);
      const sortColumn = options.sortBy === 'salary' ? 'base_salary_minor' : 'name';
      const order = options.order === 'desc' ? 'DESC' : 'ASC';
      const offset = (options.page - 1) * options.pageSize;

      const rows = db
        .prepare(
          `SELECT * FROM employees ${where} ORDER BY ${sortColumn} ${order} LIMIT @limit OFFSET @offset`
        )
        .all({ ...params, limit: options.pageSize, offset }) as EmployeeRow[];

      const { count } = db
        .prepare(`SELECT COUNT(*) AS count FROM employees ${where}`)
        .get(params) as { count: number };

      return { data: rows.map(toEmployee), total: count };
    },

    facets() {
      const departments = (
        db.prepare('SELECT DISTINCT department FROM employees ORDER BY department').all() as {
          department: string;
        }[]
      ).map((r) => r.department);
      const countries = (
        db.prepare('SELECT DISTINCT country FROM employees ORDER BY country').all() as {
          country: string;
        }[]
      ).map((r) => r.country);
      return { departments, countries };
    },
  };
}
