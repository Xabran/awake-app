import { apiFetch } from './client';
import type { Puck } from '@awake/shared';

export async function listPucks(): Promise<Puck[]> {
  return apiFetch<Puck[]>('/pucks');
}

export async function getPuck(id: string): Promise<Puck> {
  return apiFetch<Puck>(`/pucks/${id}`);
}

export async function pairPuck(name: string, securityCode: string): Promise<Puck> {
  return apiFetch<Puck>('/pucks/pair', {
    method: 'POST',
    body: JSON.stringify({ name, securityCode }),
  });
}

export async function updatePuck(id: string, data: { name?: string }): Promise<Puck> {
  return apiFetch<Puck>(`/pucks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePuck(id: string): Promise<void> {
  return apiFetch<void>(`/pucks/${id}`, { method: 'DELETE' });
}
