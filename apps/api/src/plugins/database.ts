import fp from 'fastify-plugin';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    db: pg.Pool;
  }
}

async function databasePlugin(app: FastifyInstance) {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Verify connection
  const client = await pool.connect();
  client.release();
  app.log.info('Database connected');

  app.decorate('db', pool);

  app.addHook('onClose', async () => {
    await pool.end();
  });
}

export default fp(databasePlugin, { name: 'database' });
