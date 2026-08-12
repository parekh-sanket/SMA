import request from 'supertest';
import { openDb } from '../../src/db/connection';
import { migrate } from '../../src/db/schema';
import { buildApp } from '../../src/app';

describe('CORS', () => {
  it('sends an Access-Control-Allow-Origin header', async () => {
    const db = openDb(':memory:');
    migrate(db);

    const res = await request(buildApp(db)).get('/api/health');

    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});
