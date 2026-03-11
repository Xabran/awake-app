import fp from 'fastify-plugin';
import redis from '@fastify/redis';
import type { FastifyInstance } from 'fastify';

async function redisPlugin(app: FastifyInstance) {
  await app.register(redis, {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });
  app.log.info('Redis connected');
}

export default fp(redisPlugin, { name: 'redis' });
