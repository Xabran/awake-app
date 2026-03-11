import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { FastifyInstance } from 'fastify';
import type { User } from '@awake/shared';
import * as userRepo from '../repositories/user.repository';

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

function generateTokens(app: FastifyInstance, user: User) {
  const jti = crypto.randomUUID();
  const accessToken = app.jwt.sign(
    { sub: user.id, email: user.email },
    { expiresIn: '15m' }
  );
  const refreshToken = app.jwt.sign(
    { sub: user.id, email: user.email, jti },
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken, jti };
}

async function storeRefreshToken(
  app: FastifyInstance,
  userId: string,
  jti: string
) {
  const key = `refresh:${userId}:${jti}`;
  await app.redis.set(key, '1', 'EX', REFRESH_TOKEN_EXPIRY);
}

async function invalidateRefreshToken(
  app: FastifyInstance,
  userId: string,
  jti: string
) {
  const key = `refresh:${userId}:${jti}`;
  await app.redis.del(key);
}

async function isRefreshTokenValid(
  app: FastifyInstance,
  userId: string,
  jti: string
): Promise<boolean> {
  const key = `refresh:${userId}:${jti}`;
  const exists = await app.redis.exists(key);
  return exists === 1;
}

export async function register(
  app: FastifyInstance,
  email: string,
  password: string
) {
  // Check if user already exists
  const existing = await userRepo.findByEmail(app.db, email);
  if (existing) {
    throw { statusCode: 409, error: 'CONFLICT', message: 'Email already registered' };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepo.create(app.db, email, passwordHash);

  const { accessToken, refreshToken, jti } = generateTokens(app, user);
  await storeRefreshToken(app, user.id, jti);

  return { user, accessToken, refreshToken };
}

export async function login(
  app: FastifyInstance,
  email: string,
  password: string
) {
  const user = await userRepo.findByEmail(app.db, email);
  if (!user) {
    throw { statusCode: 401, error: 'UNAUTHORIZED', message: 'Invalid email or password' };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw { statusCode: 401, error: 'UNAUTHORIZED', message: 'Invalid email or password' };
  }

  const { id, email: userEmail, createdAt, updatedAt } = user;
  const safeUser: User = { id, email: userEmail, createdAt, updatedAt };

  const { accessToken, refreshToken, jti } = generateTokens(app, safeUser);
  await storeRefreshToken(app, safeUser.id, jti);

  return { user: safeUser, accessToken, refreshToken };
}

export async function refresh(app: FastifyInstance, refreshTokenStr: string) {
  let payload: { sub: string; email: string; jti: string };
  try {
    payload = app.jwt.verify<{ sub: string; email: string; jti: string }>(refreshTokenStr);
  } catch {
    throw { statusCode: 401, error: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' };
  }

  // Check if this refresh token is still valid in Redis
  const valid = await isRefreshTokenValid(app, payload.sub, payload.jti);
  if (!valid) {
    throw { statusCode: 401, error: 'UNAUTHORIZED', message: 'Refresh token has been revoked' };
  }

  // Invalidate old refresh token (rotation)
  await invalidateRefreshToken(app, payload.sub, payload.jti);

  // Issue new token pair
  const user: User = {
    id: payload.sub,
    email: payload.email,
    createdAt: '',
    updatedAt: '',
  };
  const { accessToken, refreshToken, jti } = generateTokens(app, user);
  await storeRefreshToken(app, user.id, jti);

  return { accessToken, refreshToken };
}

export async function logout(
  app: FastifyInstance,
  userId: string,
  refreshTokenStr: string
) {
  try {
    const payload = app.jwt.verify<{ sub: string; jti: string }>(refreshTokenStr);
    await invalidateRefreshToken(app, userId, payload.jti);
  } catch {
    // Token already invalid, that's fine
  }
}
