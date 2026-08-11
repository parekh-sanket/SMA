import { buildApp } from './app';

const port = Number(process.env.PORT) || 4000;

const app = buildApp();

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Salary Management API listening on http://localhost:${port}`);
});
