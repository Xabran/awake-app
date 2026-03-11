import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '@/stores/auth.store';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{user?.email ?? '—'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>0.0.1</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>App</Text>
            <Text style={styles.rowValue}>Awake</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  rowLabel: {
    fontSize: 15,
    color: '#333',
  },
  rowValue: {
    fontSize: 15,
    color: '#666',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#eee',
    marginHorizontal: 14,
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});
