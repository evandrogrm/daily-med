import request from 'supertest';
import { app } from '../../infra/server';

describe('Health Check', () => {
  it('should return 200 and status ok', async () => {
    const response = await request(app.express).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
