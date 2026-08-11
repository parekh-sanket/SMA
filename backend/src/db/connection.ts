import BetterSqlite3 from 'better-sqlite3';
import type { Database } from 'better-sqlite3';

/**
 * Opens a SQLite database connection.
 * Defaults to an in-memory database, which tests use for isolation.
 */
export function openDb(path = ':memory:'): Database {
  const db = new BetterSqlite3(path);
  db.pragma('foreign_keys = ON');
  return db;
}
