import { View, Text, StyleSheet } from 'react-native';
import type { DayOfWeek } from '@awake/shared';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

interface DayPillsProps {
  days: DayOfWeek[];
}

export function DayPills({ days }: DayPillsProps) {
  const activeSet = new Set(days);

  if (days.length === 7) {
    return <Text style={styles.everyDay}>Every day</Text>;
  }

  if (days.length === 0) {
    return <Text style={styles.once}>Once</Text>;
  }

  return (
    <View style={styles.row}>
      {DAY_LABELS.map((label, i) => {
        const active = activeSet.has(i as DayOfWeek);
        return (
          <View
            key={i}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  pill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: '#4a90d9',
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
  },
  pillTextActive: {
    color: '#fff',
  },
  everyDay: {
    fontSize: 12,
    color: '#666',
  },
  once: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
