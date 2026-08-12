import request from 'supertest';
import type { Express } from 'express';
import { openDb } from '../../src/db/connection';
import { migrate } from '../../src/db/schema';
import { buildApp } from '../../src/app';

function appWithDb(): Express {
  const db = openDb(':memory:');
  migrate(db);
  return buildApp(db);
}

function login(app: Express, creds = { username: 'admin', password: 'admin' }) {
  return request(app).post('/api/auth/login').send(creds);
}

describe('POST /api/auth/login', () => {
  it('returns a token for valid admin credentials', async () => {
    const app = appWithDb();

    const res = await login(app);

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(0);
  });

  it('returns 401 for invalid credentials', async () => {
    const app = appWithDb();

    const res = await login(app, { username: 'admin', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when fields are missing', async () => {
    const app = appWithDb();

    const res = await request(app).post('/api/auth/login').send({ username: 'admin' });

    expect(res.status).toBe(400);
  });
});

describe('auth gating', () => {
  it('rejects a protected route without a token (401)', async () => {
    const app = appWithDb();

    const res = await request(app).get('/api/employees');

    expect(res.status).toBe(401);
  });

  it('allows a protected route with a valid token', async () => {
    const app = appWithDb();
    const { body } = await login(app);

    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${body.token}`);

    expect(res.status).toBe(200);
  });

  it('leaves the health endpoint open', async () => {
    const app = appWithDb();

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
  });
});
