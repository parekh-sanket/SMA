import { openDb } from '../../src/db/connection';
import { migrate } from '../../src/db/schema';
import { createEmployeeRepository } from '../../src/services/employeeRepository';
import { generateEmployees, seedDatabase } from '../../src/services/employeeSeeder';

describe('generateEmployees', () => {
  it('generates the requested number of employees', () => {
    expect(generateEmployees(50)).toHaveLength(50);
  });

  it('produces unique ids/emails and valid fields', () => {
    const employees = generateEmployees(300);

    expect(new Set(employees.map((e) => e.email)).size).toBe(300);
    expect(new Set(employees.map((e) => e.id)).size).toBe(300);
    for (const e of employees) {
      expect(Number.isInteger(e.salaryMinor)).toBe(true);
      expect(e.salaryMinor).toBeGreaterThan(0);
      expect(['full-time', 'part-time', 'contractor']).toContain(e.employmentType);
      expect(['active', 'terminated']).toContain(e.status);
      expect(e.hireDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('seedDatabase', () => {
  it('inserts the requested number of employees', () => {
    const db = openDb(':memory:');
    migrate(db);

    seedDatabase(db, 100);

    const repo = createEmployeeRepository(db);
    const { total } = repo.list({ page: 1, pageSize: 1, sortBy: 'name', order: 'asc' });
    expect(total).toBe(100);
    db.close();
  });
});
