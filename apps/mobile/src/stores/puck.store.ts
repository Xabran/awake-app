import { create } from 'zustand';
import type { Puck, Alarm } from '@awake/shared';
import * as pucksApi from '../api/pucks.api';
import * as alarmsApi from '../api/alarms.api';

interface PuckWithAlarm extends Puck {
  alarm?: Alarm;
}

interface PuckState {
  pucks: PuckWithAlarm[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetchPucks: () => Promise<void>;
  refreshPucks: () => Promise<void>;
  toggleAlarm: (alarmId: string, isEnabled: boolean) => Promise<void>;
  clearError: () => void;
}

export const usePuckStore = create<PuckState>((set, get) => ({
  pucks: [],
  isLoading: false,
  isRefreshing: false,
  error: null,

  fetchPucks: async () => {
    set({ isLoading: true, error: null });
    try {
      const [pucks, alarms] = await Promise.all([
        pucksApi.listPucks(),
        alarmsApi.listAlarms(),
      ]);

      const alarmByPuckId = new Map<string, Alarm>();
      for (const alarm of alarms) {
        alarmByPuckId.set(alarm.puckId, alarm);
      }

      const pucksWithAlarms: PuckWithAlarm[] = pucks.map((puck) => ({
        ...puck,
        alarm: alarmByPuckId.get(puck.id),
      }));

      set({ pucks: pucksWithAlarms, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to load pucks' });
    }
  },

  refreshPucks: async () => {
    set({ isRefreshing: true });
    try {
      const [pucks, alarms] = await Promise.all([
        pucksApi.listPucks(),
        alarmsApi.listAlarms(),
      ]);

      const alarmByPuckId = new Map<string, Alarm>();
      for (const alarm of alarms) {
        alarmByPuckId.set(alarm.puckId, alarm);
      }

      const pucksWithAlarms: PuckWithAlarm[] = pucks.map((puck) => ({
        ...puck,
        alarm: alarmByPuckId.get(puck.id),
      }));

      set({ pucks: pucksWithAlarms, isRefreshing: false, error: null });
    } catch (err: any) {
      set({ isRefreshing: false, error: err.message || 'Failed to refresh' });
    }
  },

  toggleAlarm: async (alarmId: string, isEnabled: boolean) => {
    // Optimistic update
    const prevPucks = get().pucks;
    set({
      pucks: prevPucks.map((p) =>
        p.alarm?.id === alarmId
          ? { ...p, alarm: { ...p.alarm!, isEnabled } }
          : p
      ),
    });

    try {
      await alarmsApi.updateAlarm(alarmId, { isEnabled });
    } catch {
      // Revert on failure
      set({ pucks: prevPucks });
    }
  },

  clearError: () => set({ error: null }),
}));

export type { PuckWithAlarm };
