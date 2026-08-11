import request from 'supertest';
import { buildApp } from '../../app';

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const app = buildApp();

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
