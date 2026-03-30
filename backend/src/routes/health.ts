import { FastifyInstance } from 'fastify';
import { HealthResponse } from '../types';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async () => {
    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
    return response;
  });
}
