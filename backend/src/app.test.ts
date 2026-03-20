import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from './app';

describe('App Configuration', () => {
  it('health check returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.timestamp).toBeDefined();
  });

  it('CORS headers should be present', async () => {
    const origin = 'http://localhost:5173';
    const res = await request(app)
      .get('/health')
      .set('Origin', origin);
    
    expect(res.headers['access-control-allow-origin']).toBe(origin);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NotFoundError');
  });

  it('JSON body parsing works', async () => {
    const res = await request(app)
      .post('/api/test')
      .send({ test: 'data' })
      .set('Content-Type', 'application/json');
    
    expect(res.status).toBe(200);
    expect(res.body.body.test).toBe('data');
  });

  it('should reject large payloads (>10MB)', async () => {
    const largeData = 'A'.repeat(11 * 1024 * 1024); // 11MB
    const res = await request(app)
      .post('/api/test') // Use an existing route
      .send({ data: largeData });
    expect(res.status).toBe(413);
  });
});
