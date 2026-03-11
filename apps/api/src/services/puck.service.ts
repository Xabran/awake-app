import bcrypt from 'bcrypt';
import type { FastifyInstance } from 'fastify';
import * as puckRepo from '../repositories/puck.repository';
import * as alarmRepo from '../repositories/alarm.repository';

const SALT_ROUNDS = 12;

export async function pair(
  app: FastifyInstance,
  userId: string,
  name: string,
  securityCode: string
) {
  const securityCodeHash = await bcrypt.hash(securityCode, SALT_ROUNDS);
  return puckRepo.create(app.db, userId, name, securityCodeHash);
}

export async function listByUser(app: FastifyInstance, userId: string) {
  return puckRepo.findByUserId(app.db, userId);
}

export async function getById(
  app: FastifyInstance,
  puckId: string,
  userId: string
) {
  const puck = await puckRepo.findById(app.db, puckId);
  if (!puck || puck.userId !== userId) return null;
  return puck;
}

export async function update(
  app: FastifyInstance,
  puckId: string,
  userId: string,
  data: { name?: string }
) {
  const puck = await puckRepo.findById(app.db, puckId);
  if (!puck || puck.userId !== userId) return null;
  return puckRepo.update(app.db, puckId, data);
}

export async function updateSecurityCode(
  app: FastifyInstance,
  puckId: string,
  userId: string,
  newCode: string
) {
  const puck = await puckRepo.findById(app.db, puckId);
  if (!puck || puck.userId !== userId) return null;
  const hash = await bcrypt.hash(newCode, SALT_ROUNDS);
  return puckRepo.updateSecurityCode(app.db, puckId, hash);
}

export async function remove(
  app: FastifyInstance,
  puckId: string,
  userId: string
) {
  const puck = await puckRepo.findById(app.db, puckId);
  if (!puck || puck.userId !== userId) return false;
  return puckRepo.remove(app.db, puckId);
}

export async function getSync(
  app: FastifyInstance,
  puckId: string,
  userId: string
) {
  const puck = await puckRepo.findById(app.db, puckId);
  if (!puck || puck.userId !== userId) return null;
  const alarm = await alarmRepo.findByPuckId(app.db, puckId);
  // Strip the security code hash from the response
  const { securityCodeHash, ...safePuck } = puck;
  return { puck: safePuck, alarm };
}
