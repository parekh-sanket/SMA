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

describe('employeeRepository.list', () => {
  let db: Database;
  let repo: EmployeeRepository;

  beforeEach(() => {
    db = openDb(':memory:');
    migrate(db);
    repo = createEmployeeRepository(db);
    repo.insert({ ...sample, id: 'e1', email: 'alice@x.test', name: 'Alice', department: 'Engineering', country: 'US', salaryMinor: 300000 });
    repo.insert({ ...sample, id: 'e2', email: 'bob@x.test', name: 'Bob', department: 'Sales', country: 'IN', salaryMinor: 500000 });
    repo.insert({ ...sample, id: 'e3', email: 'carol@x.test', name: 'Carol', department: 'Engineering', country: 'IN', salaryMinor: 100000 });
  });

  afterEach(() => db.close());

  it('returns all rows with a total, sorted by name', () => {
    const { data, total } = repo.list({ page: 1, pageSize: 25, sortBy: 'name', order: 'asc' });

    expect(total).toBe(3);
    expect(data.map((e) => e.name)).toEqual(['Alice', 'Bob', 'Carol']);
  });

  it('filters by department', () => {
    const { data, total } = repo.list({ page: 1, pageSize: 25, department: 'Engineering', sortBy: 'name', order: 'asc' });

    expect(total).toBe(2);
    expect(data.map((e) => e.name)).toEqual(['Alice', 'Carol']);
  });

  it('filters by department and country together', () => {
    const { data, total } = repo.list({ page: 1, pageSize: 25, department: 'Engineering', country: 'IN', sortBy: 'name', order: 'asc' });

    expect(total).toBe(1);
    expect(data[0].name).toBe('Carol');
  });

  it('searches by name or email', () => {
    expect(repo.list({ page: 1, pageSize: 25, q: 'bob', sortBy: 'name', order: 'asc' }).data.map((e) => e.name)).toEqual(['Bob']);
    expect(repo.list({ page: 1, pageSize: 25, q: 'carol@x', sortBy: 'name', order: 'asc' }).data.map((e) => e.name)).toEqual(['Carol']);
  });

  it('sorts by salary descending', () => {
    const { data } = repo.list({ page: 1, pageSize: 25, sortBy: 'salary', order: 'desc' });

    expect(data.map((e) => e.name)).toEqual(['Bob', 'Alice', 'Carol']);
  });

  it('paginates results while reporting the full total', () => {
    const page1 = repo.list({ page: 1, pageSize: 2, sortBy: 'name', order: 'asc' });
    const page2 = repo.list({ page: 2, pageSize: 2, sortBy: 'name', order: 'asc' });

    expect(page1.total).toBe(3);
    expect(page1.data.map((e) => e.name)).toEqual(['Alice', 'Bob']);
    expect(page2.data.map((e) => e.name)).toEqual(['Carol']);
  });
});

describe('employeeRepository.facets', () => {
  it('returns distinct, sorted departments and countries', () => {
    const db = openDb(':memory:');
    migrate(db);
    const repo = createEmployeeRepository(db);
    repo.insert({ ...sample, id: 'e1', email: 'a@x.test', department: 'Engineering', country: 'US' });
    repo.insert({ ...sample, id: 'e2', email: 'b@x.test', department: 'Sales', country: 'IN' });
    repo.insert({ ...sample, id: 'e3', email: 'c@x.test', department: 'Engineering', country: 'IN' });

    expect(repo.facets()).toEqual({
      departments: ['Engineering', 'Sales'],
      countries: ['IN', 'US'],
    });
  });
});
