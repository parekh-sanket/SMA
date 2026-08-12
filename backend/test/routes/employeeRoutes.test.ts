import request from 'supertest';
import type { Express } from 'express';
import { openDb } from '../../src/db/connection';
import { migrate } from '../../src/db/schema';
import { buildApp } from '../../src/app';

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

describe('GET /api/employees (list)', () => {
  async function seed(app: Express) {
    const mk = (over: Record<string, unknown>) => ({ ...validBody, ...over });
    await request(app).post('/api/employees').send(mk({ name: 'Alice', email: 'alice@x.test', department: 'Engineering', country: 'US', salary: 3000 }));
    await request(app).post('/api/employees').send(mk({ name: 'Bob', email: 'bob@x.test', department: 'Sales', country: 'IN', salary: 5000 }));
    await request(app).post('/api/employees').send(mk({ name: 'Carol', email: 'carol@x.test', department: 'Engineering', country: 'IN', salary: 1000 }));
  }

  it('returns a paginated envelope with formatted salaries', async () => {
    const app = appWithDb();
    await seed(app);

    const res = await request(app).get('/api/employees?page=1&pageSize=2&sortBy=name&order=asc');

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(2);
    expect(res.body.total).toBe(3);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.map((e: { name: string }) => e.name)).toEqual(['Alice', 'Bob']);
    expect(res.body.data[0].salaryFormatted).toBeTruthy();
  });

  it('defaults to page 1 with pageSize 25', async () => {
    const app = appWithDb();
    await seed(app);

    const res = await request(app).get('/api/employees');

    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(25);
    expect(res.body.total).toBe(3);
  });

  it('searches by q', async () => {
    const app = appWithDb();
    await seed(app);

    const res = await request(app).get('/api/employees?q=carol');

    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Carol');
  });

  it('filters by department and country', async () => {
    const app = appWithDb();
    await seed(app);

    const res = await request(app).get('/api/employees?department=Engineering&country=IN');

    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Carol');
  });

  it('sorts by salary descending', async () => {
    const app = appWithDb();
    await seed(app);

    const res = await request(app).get('/api/employees?sortBy=salary&order=desc');

    expect(res.body.data.map((e: { name: string }) => e.name)).toEqual(['Bob', 'Alice', 'Carol']);
  });

  it('returns 400 for an invalid sortBy', async () => {
    const app = appWithDb();

    const res = await request(app).get('/api/employees?sortBy=ssn');

    expect(res.status).toBe(400);
  });
});

describe('GET /api/employees/facets', () => {
  it('returns distinct departments, countries and titles', async () => {
    const app = appWithDb();
    await request(app).post('/api/employees').send({ ...validBody, email: 'a@x.test', department: 'Engineering', country: 'US', title: 'Engineer' });
    await request(app).post('/api/employees').send({ ...validBody, email: 'b@x.test', department: 'Sales', country: 'IN', title: 'Rep' });

    const res = await request(app).get('/api/employees/facets');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      departments: ['Engineering', 'Sales'],
      countries: ['IN', 'US'],
      titles: ['Engineer', 'Rep'],
    });
  });
});

describe('PATCH /api/employees/:id/salary', () => {
  it('updates the salary and returns 200 with the new values', async () => {
    const app = appWithDb();
    const created = await request(app).post('/api/employees').send(validBody);

    const res = await request(app)
      .patch(`/api/employees/${created.body.id}/salary`)
      .send({ salary: 90000 });

    expect(res.status).toBe(200);
    expect(res.body.salaryMinor).toBe(9000000);
    expect(res.body.salaryFormatted).toBe('$90,000.00');
  });

  it('returns 400 for a negative salary', async () => {
    const app = appWithDb();
    const created = await request(app).post('/api/employees').send(validBody);

    const res = await request(app)
      .patch(`/api/employees/${created.body.id}/salary`)
      .send({ salary: -1 });

    expect(res.status).toBe(400);
  });

  it('returns 400 when salary is missing', async () => {
    const app = appWithDb();
    const created = await request(app).post('/api/employees').send(validBody);

    const res = await request(app)
      .patch(`/api/employees/${created.body.id}/salary`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 404 for an unknown id', async () => {
    const app = appWithDb();

    const res = await request(app)
      .patch('/api/employees/does-not-exist/salary')
      .send({ salary: 90000 });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/employees/:id', () => {
  const editBody = {
    name: 'Ada L.',
    department: 'Product',
    country: 'GB',
    title: 'Principal',
    hireDate: '2020-01-01',
    employmentType: 'part-time',
    status: 'terminated',
  };

  it('updates editable fields and returns 200, keeping email and salary', async () => {
    const app = appWithDb();
    const created = await request(app).post('/api/employees').send(validBody);

    const res = await request(app).put(`/api/employees/${created.body.id}`).send(editBody);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ...editBody, managerId: null });
    expect(res.body.email).toBe('ada@acme.test');
    expect(res.body.salaryMinor).toBe(8500050);
  });

  it('returns 400 for an invalid body', async () => {
    const app = appWithDb();
    const created = await request(app).post('/api/employees').send(validBody);

    const res = await request(app).put(`/api/employees/${created.body.id}`).send({ name: '' });

    expect(res.status).toBe(400);
  });

  it('returns 404 for an unknown id', async () => {
    const app = appWithDb();

    const res = await request(app).put('/api/employees/does-not-exist').send(editBody);

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/employees/:id', () => {
  it('deletes the employee and returns 204', async () => {
    const app = appWithDb();
    const created = await request(app).post('/api/employees').send(validBody);

    const res = await request(app).delete(`/api/employees/${created.body.id}`);

    expect(res.status).toBe(204);
    const after = await request(app).get(`/api/employees/${created.body.id}`);
    expect(after.status).toBe(404);
  });

  it('returns 404 for an unknown id', async () => {
    const app = appWithDb();

    const res = await request(app).delete('/api/employees/does-not-exist');

    expect(res.status).toBe(404);
  });
});
