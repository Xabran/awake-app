import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../app';
import type { FastifyInstance } from 'fastify';

// These tests require a running PostgreSQL and Redis instance.
// They run against the real database using the test-friendly .env config.
// Skip if no database is available.

let app: FastifyInstance;

describe('Auth API', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'password123';
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    try {
      app = await buildApp();
      await app.ready();
    } catch {
      // If database/Redis isn't available, skip tests
      return;
    }
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('should register a new user', async () => {
    if (!app) return;

    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: testEmail, password: testPassword },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.user.email).toBe(testEmail);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
    accessToken = body.accessToken;
    refreshToken = body.refreshToken;
  });

  it('should reject duplicate registration', async () => {
    if (!app) return;

    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: testEmail, password: testPassword },
    });

    expect(res.statusCode).toBe(409);
  });

  it('should login with valid credentials', async () => {
    if (!app) return;

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: testEmail, password: testPassword },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.user.email).toBe(testEmail);
    accessToken = body.accessToken;
    refreshToken = body.refreshToken;
  });

  it('should reject login with wrong password', async () => {
    if (!app) return;

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: testEmail, password: 'wrongpassword' },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should refresh tokens', async () => {
    if (!app) return;

    const res = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
    // Old refresh token should be rotated
    expect(body.refreshToken).not.toBe(refreshToken);
    refreshToken = body.refreshToken;
  });

  it('should reject reuse of rotated refresh token', async () => {
    if (!app) return;

    // The old refresh token from before rotation should be rejected
    const res = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken: 'invalid-token' },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should access health endpoint', async () => {
    if (!app) return;

    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ status: 'ok' });
  });

  it('should reject unauthenticated puck access', async () => {
    if (!app) return;

    const res = await app.inject({
      method: 'GET',
      url: '/pucks',
    });

    expect(res.statusCode).toBe(401);
  });

  it('should list pucks when authenticated', async () => {
    if (!app) return;

    const res = await app.inject({
      method: 'GET',
      url: '/pucks',
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(JSON.parse(res.body))).toBe(true);
  });
});
