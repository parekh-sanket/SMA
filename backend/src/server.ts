import { buildApp } from './app';
import { openDb } from './db/connection';
import { migrate } from './db/schema';
import { assertSecureAuthConfig } from './services/authService';

assertSecureAuthConfig();

const port = Number(process.env.PORT) || 4000;
const dbPath = process.env.DB_PATH || 'salary.db';

const db = openDb(dbPath);
migrate(db);

const app = buildApp(db);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Salary Management API listening on http://localhost:${port}`);
});
