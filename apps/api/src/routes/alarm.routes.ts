import type { FastifyInstance } from 'fastify';
import { createAlarmSchema, updateAlarmSchema } from '@awake/shared';
import * as alarmService from '../services/alarm.service';

export default async function alarmRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.post('/alarms', async (request, reply) => {
    const parsed = createAlarmSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues[0].message,
        statusCode: 400,
      });
    }

    try {
      const alarm = await alarmService.create(app, request.user.sub, parsed.data);
      return reply.status(201).send(alarm);
    } catch (err: any) {
      if (err.statusCode) {
        return reply.status(err.statusCode).send(err);
      }
      throw err;
    }
  });

  app.get('/alarms', async (request) => {
    return alarmService.listByUser(app, request.user.sub);
  });

  app.get('/alarms/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const alarm = await alarmService.getById(app, id, request.user.sub);
    if (!alarm) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Alarm not found',
        statusCode: 404,
      });
    }
    return alarm;
  });

  app.put('/alarms/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateAlarmSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues[0].message,
        statusCode: 400,
      });
    }

    const alarm = await alarmService.update(app, id, request.user.sub, parsed.data);
    if (!alarm) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Alarm not found',
        statusCode: 404,
      });
    }
    return alarm;
  });

  app.delete('/alarms/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await alarmService.remove(app, id, request.user.sub);
    if (!deleted) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Alarm not found',
        statusCode: 404,
      });
    }
    return reply.status(204).send();
  });
}
