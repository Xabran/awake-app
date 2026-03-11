import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as bleStub from '@/services/ble.stub';
import type { BleDevice } from '@/services/ble.stub';
import * as pucksApi from '@/api/pucks.api';

type Step = 'scan' | 'configure' | 'pairing';

export default function AddPuckScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('scan');
  const [devices, setDevices] = useState<BleDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<BleDevice | null>(null);
  const [puckName, setPuckName] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [isPairing, setIsPairing] = useState(false);

  const startScan = useCallback(() => {
    setDevices([]);
    setIsScanning(true);
    bleStub.startScan((device) => {
      setDevices((prev) => {
        if (prev.some((d) => d.id === device.id)) return prev;
        return [...prev, device];
      });
    });

    // Stop after 5 seconds
    setTimeout(() => {
      bleStub.stopScan();
      setIsScanning(false);
    }, 5000);
  }, []);

  useEffect(() => {
    startScan();
    return () => bleStub.stopScan();
  }, []);

  function handleSelectDevice(device: BleDevice) {
    setSelectedDevice(device);
    setPuckName(device.name);
    setStep('configure');
  }

  async function handlePair() {
    if (!selectedDevice) return;
    if (!puckName.trim()) {
      Alert.alert('Error', 'Please enter a name for your puck');
      return;
    }
    if (!/^\d{6}$/.test(securityCode)) {
      Alert.alert('Error', 'Security code must be exactly 6 digits');
      return;
    }

    setStep('pairing');
    setIsPairing(true);

    try {
      // Simulate BLE connection
      const connected = await bleStub.connectToDevice(selectedDevice.id);
      if (!connected) {
        Alert.alert('Error', 'Failed to connect to puck');
        setStep('configure');
        setIsPairing(false);
        return;
      }

      // Register puck with backend
      await pucksApi.pairPuck(puckName.trim(), securityCode);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to pair puck');
      setStep('configure');
    } finally {
      setIsPairing(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Add Puck' }} />

      {step === 'scan' && (
        <View style={styles.container}>
          <Text style={styles.instruction}>
            Searching for nearby Awake pucks...
          </Text>

          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable
                style={styles.deviceRow}
                onPress={() => handleSelectDevice(item)}
              >
                <View>
                  <Text style={styles.deviceName}>{item.name}</Text>
                  <Text style={styles.deviceId}>{item.id}</Text>
                </View>
                <Text style={styles.rssi}>{item.rssi} dBm</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              isScanning ? null : (
                <Text style={styles.emptyText}>
                  No pucks found nearby
                </Text>
              )
            }
          />

          {isScanning ? (
            <View style={styles.scanIndicator}>
              <ActivityIndicator color="#4a90d9" />
              <Text style={styles.scanText}>Scanning...</Text>
            </View>
          ) : (
            <Pressable style={styles.rescanButton} onPress={startScan}>
              <Text style={styles.rescanText}>Scan Again</Text>
            </Pressable>
          )}
        </View>
      )}

      {step === 'configure' && (
        <View style={styles.container}>
          <Text style={styles.instruction}>
            Configure your puck before pairing
          </Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Puck Name</Text>
              <TextInput
                style={styles.input}
                value={puckName}
                onChangeText={setPuckName}
                placeholder="My Puck"
                placeholderTextColor="#bbb"
                maxLength={50}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Security Code (6 digits)</Text>
              <TextInput
                style={styles.input}
                value={securityCode}
                onChangeText={setSecurityCode}
                placeholder="000000"
                placeholderTextColor="#bbb"
                keyboardType="number-pad"
                maxLength={6}
                secureTextEntry
              />
              <Text style={styles.fieldHint}>
                You'll need this code to dismiss alarms
              </Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.pairButton,
              (!puckName.trim() || securityCode.length !== 6) && styles.pairButtonDisabled,
            ]}
            onPress={handlePair}
            disabled={!puckName.trim() || securityCode.length !== 6}
          >
            <Text style={styles.pairButtonText}>Pair Puck</Text>
          </Pressable>
        </View>
      )}

      {step === 'pairing' && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4a90d9" />
          <Text style={styles.pairingText}>Pairing with {puckName}...</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#f5f5f5',
  },
  instruction: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    gap: 8,
  },
  deviceRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deviceId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  rssi: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 15,
  },
  scanIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  scanText: {
    fontSize: 14,
    color: '#4a90d9',
  },
  rescanButton: {
    backgroundColor: '#4a90d9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  rescanText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#333',
  },
  fieldHint: {
    fontSize: 12,
    color: '#999',
  },
  pairButton: {
    backgroundColor: '#4a90d9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  pairButtonDisabled: {
    opacity: 0.5,
  },
  pairButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  pairingText: {
    fontSize: 16,
    color: '#666',
  },
});
