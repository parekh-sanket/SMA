import request from 'supertest';
import type { Express } from 'express';
import { openDb } from '../../db/connection';
import { migrate } from '../../db/schema';
import { buildApp } from '../../app';

const validBody = {
  name: 'Ada Lovelace',
  email: 'ada@acme.test',
  department: 'Engineering',
  country: 'US',
  title: 'Staff Engineer',
  hireDate: '2021-05-01',
  employmentType: 'full-time',
  salary: 85000.5,
};

function appWithDb(): Express {
  const db = openDb(':memory:');
  migrate(db);
  return buildApp(db);
}

describe('POST /api/employees', () => {
  it('creates an employee and returns 201 with cents + formatted salary', async () => {
    const app = appWithDb();

    const res = await request(app).post('/api/employees').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
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
      salaryFormatted: '$85,000.50',
    });
    expect(typeof res.body.id).toBe('string');
    expect(res.body.id.length).toBeGreaterThan(0);
    expect(res.body.createdAt).toBeTruthy();
    expect(res.body.updatedAt).toBeTruthy();
  });

  it('accepts an explicit status and manager reference', async () => {
    const app = appWithDb();
    await request(app).post('/api/employees').send(validBody);

    const res = await request(app)
      .post('/api/employees')
      .send({
        ...validBody,
        email: 'grace@acme.test',
        status: 'terminated',
        managerId: 'someone',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('terminated');
    expect(res.body.managerId).toBe('someone');
  });

  it('returns 400 when a required field is missing', async () => {
    const app = appWithDb();
    const { email, ...missingEmail } = validBody;

    const res = await request(app).post('/api/employees').send(missingEmail);

    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid employmentType', async () => {
    const app = appWithDb();

    const res = await request(app)
      .post('/api/employees')
      .send({ ...validBody, employmentType: 'freelance' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for a negative salary', async () => {
    const app = appWithDb();

    const res = await request(app)
      .post('/api/employees')
      .send({ ...validBody, salary: -5 });

    expect(res.status).toBe(400);
  });

  it('returns 409 for a duplicate email', async () => {
    const app = appWithDb();
    await request(app).post('/api/employees').send(validBody);

    const res = await request(app)
      .post('/api/employees')
      .send({ ...validBody, name: 'Someone Else' });

    expect(res.status).toBe(409);
  });
});

describe('GET /api/employees/:id', () => {
  it('returns 200 with the employee', async () => {
    const app = appWithDb();
    const created = await request(app).post('/api/employees').send(validBody);

    const res = await request(app).get(`/api/employees/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
    expect(res.body.email).toBe('ada@acme.test');
    expect(res.body.salaryFormatted).toBe('$85,000.50');
  });

  it('returns 404 for an unknown id', async () => {
    const app = appWithDb();

    const res = await request(app).get('/api/employees/does-not-exist');

    expect(res.status).toBe(404);
  });
});
