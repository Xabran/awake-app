import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DayOfWeek, Alarm } from '@awake/shared';
import * as alarmsApi from '@/api/alarms.api';
import { DayPills } from '@/components/DayPills';
import { RingtonePicker } from '@/components/RingtonePicker';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export default function AlarmEditorScreen() {
  const { puckId, alarmId } = useLocalSearchParams<{
    puckId: string;
    alarmId?: string;
  }>();
  const router = useRouter();
  const isEditing = !!alarmId;

  const [time, setTime] = useState(new Date(2000, 0, 1, 7, 0));
  const [recurringDays, setRecurringDays] = useState<DayOfWeek[]>([]);
  const [snoozeEnabled, setSnoozeEnabled] = useState(true);
  const [snoozeDurationMin, setSnoozeDurationMin] = useState(5);
  const [label, setLabel] = useState('');
  const [ringtoneId, setRingtoneId] = useState<string>('default');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAlarm, setIsLoadingAlarm] = useState(false);
  const [showRingtones, setShowRingtones] = useState(false);

  useEffect(() => {
    if (alarmId) {
      loadExistingAlarm();
    }
  }, [alarmId]);

  async function loadExistingAlarm() {
    setIsLoadingAlarm(true);
    try {
      const alarm = await alarmsApi.getAlarm(alarmId!);
      const [h, m] = alarm.time.split(':').map(Number);
      setTime(new Date(2000, 0, 1, h, m));
      setRecurringDays(alarm.recurringDays);
      setSnoozeEnabled(alarm.snoozeEnabled);
      setSnoozeDurationMin(alarm.snoozeDurationMin);
      setLabel(alarm.label);
      setRingtoneId(alarm.ringtoneId ?? 'default');
      setIsEnabled(alarm.isEnabled);
    } catch {
      Alert.alert('Error', 'Failed to load alarm');
      router.back();
    } finally {
      setIsLoadingAlarm(false);
    }
  }

  function toggleDay(day: DayOfWeek) {
    setRecurringDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  async function handleSave() {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    setIsSaving(true);
    try {
      if (isEditing) {
        await alarmsApi.updateAlarm(alarmId!, {
          time: timeStr,
          recurringDays,
          snoozeEnabled,
          snoozeDurationMin,
          label,
          ringtoneId,
          isEnabled,
        });
      } else {
        await alarmsApi.createAlarm({
          puckId: puckId!,
          time: timeStr,
          recurringDays,
          snoozeEnabled,
          snoozeDurationMin,
          label,
          ringtoneId,
          isEnabled,
        });
      }
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save alarm');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingAlarm) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a90d9" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? 'Edit Alarm' : 'New Alarm',
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={isSaving}>
              <Text style={[styles.saveText, isSaving && styles.saveDisabled]}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Time Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time</Text>
          <View style={styles.timePickerContainer}>
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selectedDate) => {
                if (selectedDate) setTime(selectedDate);
              }}
              style={styles.timePicker}
            />
          </View>
        </View>

        {/* Recurring Days */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Repeat</Text>
          <View style={styles.daysGrid}>
            {DAY_LABELS.map((dayLabel, i) => {
              const day = i as DayOfWeek;
              const active = recurringDays.includes(day);
              return (
                <Pressable
                  key={i}
                  style={[styles.dayButton, active && styles.dayButtonActive]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[styles.dayText, active && styles.dayTextActive]}
                  >
                    {dayLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <DayPills days={recurringDays} />
        </View>

        {/* Label */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Label</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Morning workout"
            placeholderTextColor="#bbb"
            maxLength={100}
          />
        </View>

        {/* Ringtone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringtone</Text>
          <Pressable
            style={styles.ringtoneToggle}
            onPress={() => setShowRingtones(!showRingtones)}
          >
            <Text style={styles.ringtoneLabel}>
              {ringtoneId === 'default' ? 'Default' : ringtoneId.replace('alarm_', '').replace(/^\w/, c => c.toUpperCase())}
            </Text>
            <Text style={styles.chevron}>{showRingtones ? '▲' : '▼'}</Text>
          </Pressable>
          {showRingtones && (
            <View style={styles.ringtoneList}>
              <RingtonePicker selected={ringtoneId} onSelect={setRingtoneId} />
            </View>
          )}
        </View>

        {/* Snooze */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Snooze</Text>
            <Switch
              value={snoozeEnabled}
              onValueChange={setSnoozeEnabled}
              trackColor={{ false: '#ddd', true: '#4a90d9' }}
              thumbColor="#fff"
            />
          </View>
          {snoozeEnabled && (
            <View style={styles.snoozeOptions}>
              {[5, 10, 15].map((mins) => (
                <Pressable
                  key={mins}
                  style={[
                    styles.snoozePill,
                    snoozeDurationMin === mins && styles.snoozePillActive,
                  ]}
                  onPress={() => setSnoozeDurationMin(mins)}
                >
                  <Text
                    style={[
                      styles.snoozePillText,
                      snoozeDurationMin === mins && styles.snoozePillTextActive,
                    ]}
                  >
                    {mins} min
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Enabled Toggle */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Alarm Enabled</Text>
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ false: '#ddd', true: '#4a90d9' }}
              thumbColor="#fff"
            />
          </View>
        </View>
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
    gap: 24,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  timePicker: {
    height: 150,
  },
  daysGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dayButtonActive: {
    backgroundColor: '#4a90d9',
    borderColor: '#4a90d9',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  dayTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#333',
  },
  ringtoneToggle: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ringtoneLabel: {
    fontSize: 15,
    color: '#333',
  },
  chevron: {
    fontSize: 12,
    color: '#999',
  },
  ringtoneList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  switchRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 15,
    color: '#333',
  },
  snoozeOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  snoozePill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  snoozePillActive: {
    backgroundColor: '#4a90d9',
    borderColor: '#4a90d9',
  },
  snoozePillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  snoozePillTextActive: {
    color: '#fff',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a90d9',
  },
  saveDisabled: {
    opacity: 0.5,
  },
});
