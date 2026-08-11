import { openDb } from '../../db/connection';
import { migrate } from '../../db/schema';
import { createEmployeeRepository, EmployeeRepository } from './employeeRepository';
import type { Employee } from './types';
import type { Database } from 'better-sqlite3';

const sample: Employee = {
  id: 'emp-1',
  name: 'Ada Lovelace',
  email: 'ada@acme.test',
  department: 'Engineering',
  country: 'US',
  title: 'Staff Engineer',
  hireDate: '2021-05-01',
  employmentType: 'full-time',
  status: 'active',
  managerId: null,
  salaryMinor: 8500050,
  createdAt: '2026-08-11T00:00:00.000Z',
  updatedAt: '2026-08-11T00:00:00.000Z',
};

describe('employeeRepository', () => {
  let db: Database;
  let repo: EmployeeRepository;

  beforeEach(() => {
    db = openDb(':memory:');
    migrate(db);
    repo = createEmployeeRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('round-trips an employee via insert + getById', () => {
    repo.insert(sample);

    expect(repo.getById('emp-1')).toEqual(sample);
  });

  it('preserves a manager reference when present', () => {
    repo.insert(sample);
    repo.insert({ ...sample, id: 'emp-2', email: 'grace@acme.test', managerId: 'emp-1' });

    expect(repo.getById('emp-2')?.managerId).toBe('emp-1');
  });

  it('returns null for an unknown id', () => {
    expect(repo.getById('does-not-exist')).toBeNull();
  });

  it('rejects a duplicate email', () => {
    repo.insert(sample);

    expect(() =>
      repo.insert({ ...sample, id: 'emp-2', email: 'ada@acme.test' })
    ).toThrow();
  });
});
