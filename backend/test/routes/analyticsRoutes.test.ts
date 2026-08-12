import request from 'supertest';
import type { Express } from 'express';
import { openDb } from '../../src/db/connection';
import { migrate } from '../../src/db/schema';
import { buildApp } from '../../src/app';

const base = {
  name: 'X',
  email: 'x@x.test',
  department: 'Engineering',
  country: 'US',
  title: 'Engineer',
  hireDate: '2021-01-01',
  employmentType: 'full-time',
};

function appWithDb(): Express {
  const db = openDb(':memory:');
  migrate(db);
  return buildApp(db);
}

async function seed(app: Express, rows: Array<Record<string, unknown>>) {
  for (const [i, over] of rows.entries()) {
    await request(app)
      .post('/api/employees')
      .send({ ...base, email: `e${i}@x.test`, ...over });
  }
}

describe('GET /api/analytics/summary', () => {
  it('returns headcount, total, average and median (with formatting)', async () => {
    const app = appWithDb();
    await seed(app, [{ salary: 1000 }, { salary: 3000 }, { salary: 2000 }]);

    const res = await request(app).get('/api/analytics/summary');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      headcount: 3,
      totalPayrollMinor: 600000,
      averageMinor: 200000,
      medianMinor: 200000,
      totalPayrollFormatted: '$6,000.00',
      medianFormatted: '$2,000.00',
    });
  });

  it('returns zeros when there are no employees', async () => {
    const app = appWithDb();

    const res = await request(app).get('/api/analytics/summary');

    expect(res.body).toMatchObject({ headcount: 0, totalPayrollMinor: 0, averageMinor: 0, medianMinor: 0 });
  });
});

describe('GET /api/analytics/breakdown', () => {
  it('groups by department with count/total/average', async () => {
    const app = appWithDb();
    await seed(app, [
      { department: 'Engineering', salary: 1000 },
      { department: 'Engineering', salary: 2000 },
      { department: 'Sales', salary: 3000 },
    ]);

    const res = await request(app).get('/api/analytics/breakdown?dimension=department');

    expect(res.status).toBe(200);
    const eng = res.body.find((r: { key: string }) => r.key === 'Engineering');
    expect(eng).toMatchObject({ key: 'Engineering', count: 2, totalMinor: 300000, averageMinor: 150000 });
    expect(eng.averageFormatted).toBe('$1,500.00');
  });

  it('rejects an invalid dimension', async () => {
    const app = appWithDb();

    const res = await request(app).get('/api/analytics/breakdown?dimension=title');

    expect(res.status).toBe(400);
  });
});

describe('GET /api/analytics/top-earners', () => {
  it('returns the highest paid, limited', async () => {
    const app = appWithDb();
    await seed(app, [{ salary: 1000 }, { salary: 3000 }, { salary: 2000 }]);

    const res = await request(app).get('/api/analytics/top-earners?limit=2');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].salaryMinor).toBe(300000);
    expect(res.body[0].salaryFormatted).toBeTruthy();
  });
});

describe('GET /api/analytics/distribution', () => {
  it('returns $10k (1,000,000 minor) buckets', async () => {
    const app = appWithDb();
    await seed(app, [{ salary: 5000 }, { salary: 15000 }]);

    const res = await request(app).get('/api/analytics/distribution');

    expect(res.status).toBe(200);
    expect(res.body.bucketSizeMinor).toBe(1000000);
    expect(res.body.buckets).toEqual([
      { start: 0, end: 1000000, count: 1 },
      { start: 1000000, end: 2000000, count: 1 },
    ]);
  });
});
