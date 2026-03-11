import type { FastifyInstance } from 'fastify';
import { registerSchema, loginSchema, refreshSchema } from '@awake/shared';
import * as authService from '../services/auth.service';

export default async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues[0].message,
        statusCode: 400,
      });
    }

    try {
      const result = await authService.register(app, parsed.data.email, parsed.data.password);
      return reply.status(201).send(result);
    } catch (err: any) {
      if (err.statusCode) {
        return reply.status(err.statusCode).send(err);
      }
      throw err;
    }
  });

  app.post('/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues[0].message,
        statusCode: 400,
      });
    }

    try {
      const result = await authService.login(app, parsed.data.email, parsed.data.password);
      return reply.send(result);
    } catch (err: any) {
      if (err.statusCode) {
        return reply.status(err.statusCode).send(err);
      }
      throw err;
    }
  });

  app.post('/auth/refresh', async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues[0].message,
        statusCode: 400,
      });
    }

    try {
      const result = await authService.refresh(app, parsed.data.refreshToken);
      return reply.send(result);
    } catch (err: any) {
      if (err.statusCode) {
        return reply.status(err.statusCode).send(err);
      }
      throw err;
    }
  });

  app.post('/auth/logout', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues[0].message,
        statusCode: 400,
      });
    }

    await authService.logout(app, request.user.sub, parsed.data.refreshToken);
    return reply.status(204).send();
  });
}
