import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePuckStore } from '@/stores/puck.store';
import { PuckCard } from '@/components/PuckCard';

export default function HomeScreen() {
  const { pucks, isLoading, isRefreshing, error, fetchPucks, refreshPucks, toggleAlarm } =
    usePuckStore();
  const router = useRouter();

  useEffect(() => {
    fetchPucks();
  }, []);

  const handlePuckPress = useCallback(
    (puckId: string) => {
      router.push(`/puck/${puckId}`);
    },
    [router]
  );

  const handleToggleAlarm = useCallback(
    (alarmId: string, isEnabled: boolean) => {
      toggleAlarm(alarmId, isEnabled);
    },
    [toggleAlarm]
  );

  if (isLoading && pucks.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a90d9" />
      </View>
    );
  }

  if (error && pucks.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={fetchPucks}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pucks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PuckCard
            puck={item}
            onPress={handlePuckPress}
            onToggleAlarm={handleToggleAlarm}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshPucks}
            tintColor="#4a90d9"
          />
        }
        contentContainerStyle={
          pucks.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>No pucks yet</Text>
            <Text style={styles.emptySubtitle}>
              Pair a puck to get started
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#e53e3e',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryText: {
    fontSize: 14,
    color: '#4a90d9',
    fontWeight: '600',
  },
});
