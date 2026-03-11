import type { FastifyInstance } from 'fastify';
import * as alarmRepo from '../repositories/alarm.repository';
import * as puckRepo from '../repositories/puck.repository';

export async function create(
  app: FastifyInstance,
  userId: string,
  data: {
    puckId: string;
    time: string;
    recurringDays?: number[];
    snoozeEnabled?: boolean;
    snoozeDurationMin?: number;
    label?: string;
    ringtoneId?: string | null;
    isEnabled?: boolean;
  }
) {
  // Verify puck ownership
  const puck = await puckRepo.findById(app.db, data.puckId);
  if (!puck || puck.userId !== userId) {
    throw { statusCode: 404, error: 'NOT_FOUND', message: 'Puck not found' };
  }

  // Check one-alarm-per-puck constraint
  const existing = await alarmRepo.findByPuckId(app.db, data.puckId);
  if (existing) {
    throw {
      statusCode: 409,
      error: 'CONFLICT',
      message: 'This puck already has an alarm. Update or delete the existing one.',
    };
  }

  return alarmRepo.create(app.db, data);
}

export async function listByUser(app: FastifyInstance, userId: string) {
  return alarmRepo.findByUserId(app.db, userId);
}

export async function getById(
  app: FastifyInstance,
  alarmId: string,
  userId: string
) {
  const alarm = await alarmRepo.findById(app.db, alarmId);
  if (!alarm) return null;

  // Verify ownership chain: alarm -> puck -> user
  const puck = await puckRepo.findById(app.db, alarm.puckId);
  if (!puck || puck.userId !== userId) return null;

  return alarm;
}

export async function update(
  app: FastifyInstance,
  alarmId: string,
  userId: string,
  data: {
    time?: string;
    recurringDays?: number[];
    snoozeEnabled?: boolean;
    snoozeDurationMin?: number;
    label?: string;
    ringtoneId?: string | null;
    isEnabled?: boolean;
  }
) {
  const alarm = await alarmRepo.findById(app.db, alarmId);
  if (!alarm) return null;

  const puck = await puckRepo.findById(app.db, alarm.puckId);
  if (!puck || puck.userId !== userId) return null;

  return alarmRepo.update(app.db, alarmId, data);
}

export async function remove(
  app: FastifyInstance,
  alarmId: string,
  userId: string
) {
  const alarm = await alarmRepo.findById(app.db, alarmId);
  if (!alarm) return false;

  const puck = await puckRepo.findById(app.db, alarm.puckId);
  if (!puck || puck.userId !== userId) return false;

  return alarmRepo.remove(app.db, alarmId);
}
