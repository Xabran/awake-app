import { View, Text, StyleSheet } from 'react-native';

interface AlarmTimeBadgeProps {
  time: string; // HH:mm
  isEnabled: boolean;
}

export function AlarmTimeBadge({ time, isEnabled }: AlarmTimeBadgeProps) {
  const [hours, minutes] = time.split(':').map(Number);
  const isPM = hours >= 12;
  const display12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const period = isPM ? 'PM' : 'AM';

  return (
    <View style={styles.container}>
      <Text style={[styles.time, !isEnabled && styles.disabled]}>
        {display12}:{minutes.toString().padStart(2, '0')}
      </Text>
      <Text style={[styles.period, !isEnabled && styles.disabled]}>
        {period}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  time: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  period: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  disabled: {
    color: '#bbb',
  },
});
