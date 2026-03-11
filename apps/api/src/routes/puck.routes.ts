import type { FastifyInstance } from 'fastify';
import { pairPuckSchema, updatePuckSchema, updatePuckSettingsSchema } from '@awake/shared';
import * as puckService from '../services/puck.service';

export default async function puckRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.post('/pucks/pair', async (request, reply) => {
    const parsed = pairPuckSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues[0].message,
        statusCode: 400,
      });
    }

    const puck = await puckService.pair(
      app,
      request.user.sub,
      parsed.data.name,
      parsed.data.securityCode
    );
    return reply.status(201).send(puck);
  });

  app.get('/pucks', async (request) => {
    return puckService.listByUser(app, request.user.sub);
  });

  app.get('/pucks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const puck = await puckService.getById(app, id, request.user.sub);
    if (!puck) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Puck not found',
        statusCode: 404,
      });
    }
    return puck;
  });

  app.put('/pucks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updatePuckSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues[0].message,
        statusCode: 400,
      });
    }

    const puck = await puckService.update(app, id, request.user.sub, parsed.data);
    if (!puck) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Puck not found',
        statusCode: 404,
      });
    }
    return puck;
  });

  app.put('/pucks/:id/settings', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updatePuckSettingsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues[0].message,
        statusCode: 400,
      });
    }

    if (parsed.data.securityCode) {
      const puck = await puckService.updateSecurityCode(
        app,
        id,
        request.user.sub,
        parsed.data.securityCode
      );
      if (!puck) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'Puck not found',
          statusCode: 404,
        });
      }
      return puck;
    }

    return reply.status(400).send({
      error: 'VALIDATION_ERROR',
      message: 'No settings to update',
      statusCode: 400,
    });
  });

  app.delete('/pucks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await puckService.remove(app, id, request.user.sub);
    if (!deleted) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Puck not found',
        statusCode: 404,
      });
    }
    return reply.status(204).send();
  });

  app.get('/pucks/:id/sync', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await puckService.getSync(app, id, request.user.sub);
    if (!result) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Puck not found',
        statusCode: 404,
      });
    }
    return result;
  });
}
