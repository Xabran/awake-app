import Fastify from 'fastify';
import cors from '@fastify/cors';
import database from './plugins/database';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(database);

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}
