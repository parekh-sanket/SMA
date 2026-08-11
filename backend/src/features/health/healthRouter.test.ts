import request from 'supertest';
import { buildApp } from '../../app';
import { openDb } from '../../db/connection';
import { migrate } from '../../db/schema';

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const db = openDb(':memory:');
    migrate(db);
    const app = buildApp(db);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
