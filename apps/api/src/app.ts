import Fastify from 'fastify';
import cors from '@fastify/cors';
import database from './plugins/database';
import redisPlugin from './plugins/redis';
import authPlugin from './plugins/auth';
import authRoutes from './routes/auth.routes';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(database);
  await app.register(redisPlugin);
  await app.register(authPlugin);

  await app.register(authRoutes);

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}
