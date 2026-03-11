import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import type { PuckWithAlarm } from '../stores/puck.store';
import { AlarmTimeBadge } from './AlarmTimeBadge';
import { DayPills } from './DayPills';

interface PuckCardProps {
  puck: PuckWithAlarm;
  onPress: (puckId: string) => void;
  onToggleAlarm: (alarmId: string, isEnabled: boolean) => void;
}

export function PuckCard({ puck, onPress, onToggleAlarm }: PuckCardProps) {
  const { alarm } = puck;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(puck.id)}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{puck.name}</Text>
        {alarm && (
          <Switch
            value={alarm.isEnabled}
            onValueChange={(val) => onToggleAlarm(alarm.id, val)}
            trackColor={{ false: '#ddd', true: '#4a90d9' }}
            thumbColor="#fff"
          />
        )}
      </View>

      {alarm ? (
        <View style={styles.alarmInfo}>
          <AlarmTimeBadge time={alarm.time} isEnabled={alarm.isEnabled} />
          {alarm.label ? (
            <Text style={styles.label} numberOfLines={1}>
              {alarm.label}
            </Text>
          ) : null}
          <View style={styles.daysRow}>
            <DayPills days={alarm.recurringDays} />
          </View>
        </View>
      ) : (
        <Text style={styles.noAlarm}>No alarm set — tap to configure</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  alarmInfo: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: '#666',
  },
  daysRow: {
    marginTop: 2,
  },
  noAlarm: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
