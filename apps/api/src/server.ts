import 'dotenv/config';
import { buildApp } from './app';

const start = async () => {
  const app = await buildApp();
  const port = Number(process.env.PORT) || 3000;

  await app.listen({ port, host: '0.0.0.0' });
  app.log.info(`Server listening on port ${port}`);
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
