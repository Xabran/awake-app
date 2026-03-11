import { apiFetch, storeTokens, clearTokens } from './client';
import type { User } from '@awake/shared';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function register(
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await storeTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await storeTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logout(): Promise<void> {
  try {
    const { getStoredTokens } = await import('./client');
    const { refreshToken } = await getStoredTokens();
    if (refreshToken) {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch {
    // Logout best-effort
  }
  await clearTokens();
}
