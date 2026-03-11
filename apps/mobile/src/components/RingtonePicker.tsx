import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';

const RINGTONES = [
  { id: 'default', label: 'Default' },
  { id: 'alarm_gentle', label: 'Gentle Wake' },
  { id: 'alarm_classic', label: 'Classic Alarm' },
  { id: 'alarm_radar', label: 'Radar' },
  { id: 'alarm_beacon', label: 'Beacon' },
  { id: 'alarm_chimes', label: 'Chimes' },
  { id: 'alarm_circuit', label: 'Circuit' },
  { id: 'alarm_sunrise', label: 'Sunrise' },
];

interface RingtonePickerProps {
  selected: string | null;
  onSelect: (ringtoneId: string) => void;
}

export function RingtonePicker({ selected, onSelect }: RingtonePickerProps) {
  return (
    <FlatList
      data={RINGTONES}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      renderItem={({ item }) => {
        const isSelected = (selected ?? 'default') === item.id;
        return (
          <Pressable
            style={[styles.row, isSelected && styles.rowSelected]}
            onPress={() => onSelect(item.id)}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {item.label}
            </Text>
            {isSelected && <Text style={styles.check}>✓</Text>}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  rowSelected: {
    backgroundColor: '#f0f6ff',
  },
  label: {
    fontSize: 15,
    color: '#333',
  },
  labelSelected: {
    color: '#4a90d9',
    fontWeight: '600',
  },
  check: {
    fontSize: 16,
    color: '#4a90d9',
    fontWeight: '700',
  },
});
