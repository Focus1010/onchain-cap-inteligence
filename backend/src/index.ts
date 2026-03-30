import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { tokenRoutes } from './routes/tokens';
import { healthRoutes } from './routes/health';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001');

const fastify = Fastify({
  logger: true,
});

// Register CORS
async function registerCors() {
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });
}

// Request logging hook
fastify.addHook('onRequest', async (request, reply) => {
  (request as any).startTime = Date.now();
});

fastify.addHook('onSend', async (request, reply, payload) => {
  const startTime = (request as any).startTime;
  if (startTime) {
    const duration = Date.now() - startTime;
    console.log(`${request.method} ${request.url} - ${reply.statusCode} - ${duration}ms`);
  }
});

// Error handler
fastify.setErrorHandler((error: any, request, reply) => {
  console.error('Error:', error);
  reply.status(500).send({
    error: 'Internal server error',
    details: error.message,
  });
});

// Register routes
async function registerRoutes() {
  await registerCors();
  await fastify.register(healthRoutes);
  await fastify.register(tokenRoutes);
}

// Start server
async function start() {
  try {
    await registerRoutes();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

start();
