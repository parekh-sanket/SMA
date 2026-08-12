import { buildApp } from './app';
import { openDb } from './db/connection';
import { migrate } from './db/schema';
import { seedDatabase } from './services/employeeSeeder';
import { assertSecureAuthConfig } from './services/authService';

assertSecureAuthConfig();

const port = Number(process.env.PORT) || 4000;
const dbPath = process.env.DB_PATH || 'salary.db';

const db = openDb(dbPath);
migrate(db);

/**
 * In production (or when SEED_ON_START=true) the server boots from a fresh,
 * generated dataset: wipe the employees table and re-seed before listening.
 * Set SEED_ON_START=false to opt out; SEED_COUNT controls the row count.
 */
const seedOnStart =
  process.env.SEED_ON_START === 'true' ||
  (process.env.NODE_ENV === 'production' && process.env.SEED_ON_START !== 'false');

if (seedOnStart) {
  const count = Number(process.env.SEED_COUNT) || 10000;
  const started = Date.now();
  db.exec('DELETE FROM employees');
  seedDatabase(db, count);
  // eslint-disable-next-line no-console
  console.log(`Reseeded ${count} employees on startup in ${Date.now() - started}ms.`);
}

const app = buildApp(db);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Salary Management API listening on http://localhost:${port}`);
});
