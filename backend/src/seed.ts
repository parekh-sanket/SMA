import { openDb } from './db/connection';
import { migrate } from './db/schema';
import { seedDatabase } from './services/employeeSeeder';

const dbPath = process.env.DB_PATH || 'salary.db';
const count = Number(process.env.SEED_COUNT) || 10000;

const started = Date.now();
const db = openDb(dbPath);
migrate(db);
db.exec('DELETE FROM employees'); // fresh dataset every run
seedDatabase(db, count);
db.close();

// eslint-disable-next-line no-console
console.log(`Seeded ${count} employees into ${dbPath} in ${Date.now() - started}ms.`);
