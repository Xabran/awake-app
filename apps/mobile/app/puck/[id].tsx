import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import type { Puck, Alarm } from '@awake/shared';
import * as pucksApi from '@/api/pucks.api';
import * as alarmsApi from '@/api/alarms.api';
import { AlarmTimeBadge } from '@/components/AlarmTimeBadge';
import { DayPills } from '@/components/DayPills';

export default function PuckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [puck, setPuck] = useState<Puck | null>(null);
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPuckData();
  }, [id]);

  async function loadPuckData() {
    setIsLoading(true);
    try {
      const [puckData, alarms] = await Promise.all([
        pucksApi.getPuck(id!),
        alarmsApi.listAlarms(),
      ]);
      setPuck(puckData);
      setAlarm(alarms.find((a) => a.puckId === id) ?? null);
    } catch {
      Alert.alert('Error', 'Failed to load puck details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }

  function handleEditAlarm() {
    if (alarm) {
      router.push(`/puck/alarm-editor?puckId=${id}&alarmId=${alarm.id}`);
    } else {
      router.push(`/puck/alarm-editor?puckId=${id}`);
    }
  }

  async function handleDeleteAlarm() {
    if (!alarm) return;
    Alert.alert('Delete Alarm', 'Are you sure you want to delete this alarm?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await alarmsApi.deleteAlarm(alarm.id);
            setAlarm(null);
          } catch {
            Alert.alert('Error', 'Failed to delete alarm');
          }
        },
      },
    ]);
  }

  async function handleDeletePuck() {
    Alert.alert(
      'Remove Puck',
      'This will unpair the puck and delete its alarm. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await pucksApi.deletePuck(id!);
              router.back();
            } catch {
              Alert.alert('Error', 'Failed to remove puck');
            }
          },
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a90d9" />
      </View>
    );
  }

  if (!puck) return null;

  return (
    <>
      <Stack.Screen options={{ title: puck.name }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alarm</Text>
          {alarm ? (
            <View style={styles.alarmCard}>
              <AlarmTimeBadge time={alarm.time} isEnabled={alarm.isEnabled} />
              {alarm.label ? (
                <Text style={styles.label}>{alarm.label}</Text>
              ) : null}
              <DayPills days={alarm.recurringDays} />
              {alarm.snoozeEnabled && (
                <Text style={styles.snoozeText}>
                  Snooze: {alarm.snoozeDurationMin} min
                </Text>
              )}
              <View style={styles.alarmActions}>
                <Pressable style={styles.editButton} onPress={handleEditAlarm}>
                  <Text style={styles.editButtonText}>Edit Alarm</Text>
                </Pressable>
                <Pressable style={styles.deleteAlarmButton} onPress={handleDeleteAlarm}>
                  <Text style={styles.deleteAlarmText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.addAlarmButton} onPress={handleEditAlarm}>
              <Text style={styles.addAlarmText}>+ Add Alarm</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Puck Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Paired</Text>
            <Text style={styles.infoValue}>
              {new Date(puck.pairedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <Pressable style={styles.removePuckButton} onPress={handleDeletePuck}>
          <Text style={styles.removePuckText}>Remove Puck</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    gap: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alarmCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  snoozeText: {
    fontSize: 12,
    color: '#999',
  },
  alarmActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#4a90d9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteAlarmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#fee',
  },
  deleteAlarmText: {
    color: '#e53e3e',
    fontWeight: '600',
    fontSize: 14,
  },
  addAlarmButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4a90d9',
    borderStyle: 'dashed',
  },
  addAlarmText: {
    color: '#4a90d9',
    fontWeight: '600',
    fontSize: 16,
  },
  infoRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  removePuckButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fee',
  },
  removePuckText: {
    color: '#e53e3e',
    fontWeight: '600',
    fontSize: 15,
  },
});
