import type { Database } from 'better-sqlite3';

/**
 * Creates the database schema if it does not already exist.
 * Indexes on department, country, and salary support the directory's
 * filter/sort queries at 10k rows (Feature 3).
 */
export function migrate(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id                TEXT    PRIMARY KEY,
      name              TEXT    NOT NULL,
      email             TEXT    NOT NULL UNIQUE,
      department        TEXT    NOT NULL,
      country           TEXT    NOT NULL,
      title             TEXT    NOT NULL,
      hire_date         TEXT    NOT NULL,
      employment_type   TEXT    NOT NULL,
      status            TEXT    NOT NULL,
      manager_id        TEXT,
      base_salary_minor INTEGER NOT NULL,
      created_at        TEXT    NOT NULL,
      updated_at        TEXT    NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
    CREATE INDEX IF NOT EXISTS idx_employees_country    ON employees(country);
    CREATE INDEX IF NOT EXISTS idx_employees_salary     ON employees(base_salary_minor);
  `);
}
