import * as SecureStore from 'expo-secure-store';

const API_URL = __DEV__
  ? 'http://10.0.2.2:3000' // Android emulator -> host machine
  : 'http://localhost:3000';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function getStoredTokens() {
  const accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
  const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
  return { accessToken, refreshToken };
}

export async function storeTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await clearTokens();
      return null;
    }

    const data = await res.json();
    await storeTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    await clearTokens();
    return null;
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let accessToken = await SecureStore.getItemAsync(TOKEN_KEY);

  const doFetch = async (token: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  };

  let res = await doFetch(accessToken);

  // If 401, try refreshing the token once
  if (res.status === 401 && accessToken) {
    // Use a lock to prevent concurrent refresh requests
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken();
    }

    const newToken = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({
      error: 'UNKNOWN',
      message: 'An error occurred',
      statusCode: res.status,
    }));
    throw error;
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}
