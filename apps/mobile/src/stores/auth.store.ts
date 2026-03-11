import { create } from 'zustand';
import type { User } from '@awake/shared';
import * as authApi from '../api/auth.api';
import { getStoredTokens, clearTokens, storeTokens } from '../api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Login failed',
      });
      throw err;
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.register(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Registration failed',
      });
      throw err;
    }
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const { refreshToken } = await getStoredTokens();
      if (!refreshToken) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // Try to refresh the token to verify the session is still valid
      const res = await fetch(
        (__DEV__ ? 'http://10.0.2.2:3000' : 'http://localhost:3000') +
          '/auth/refresh',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!res.ok) {
        await clearTokens();
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const data = await res.json();
      await storeTokens(data.accessToken, data.refreshToken);

      // Decode the user info from the access token payload
      const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
      set({
        user: {
          id: payload.sub,
          email: payload.email,
          createdAt: '',
          updatedAt: '',
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      await clearTokens();
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));
