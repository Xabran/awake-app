/**
 * BLE Stub Service
 *
 * Simulates Bluetooth Low Energy device scanning and discovery
 * for development without real puck hardware. Replace with actual
 * BLE implementation when firmware is ready.
 */

export interface BleDevice {
  id: string;
  name: string;
  rssi: number;
}

const FAKE_DEVICES: BleDevice[] = [
  { id: 'puck-001', name: 'Awake Puck #1', rssi: -45 },
  { id: 'puck-002', name: 'Awake Puck #2', rssi: -62 },
  { id: 'puck-003', name: 'Awake Puck #3', rssi: -78 },
];

type ScanCallback = (device: BleDevice) => void;

let scanTimer: ReturnType<typeof setInterval> | null = null;

export function startScan(onDeviceFound: ScanCallback): void {
  stopScan();
  let index = 0;

  // Simulate discovering devices one at a time
  scanTimer = setInterval(() => {
    if (index < FAKE_DEVICES.length) {
      onDeviceFound(FAKE_DEVICES[index]);
      index++;
    } else {
      stopScan();
    }
  }, 800);
}

export function stopScan(): void {
  if (scanTimer) {
    clearInterval(scanTimer);
    scanTimer = null;
  }
}

export async function connectToDevice(_deviceId: string): Promise<boolean> {
  // Simulate connection delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return true;
}

export async function disconnectFromDevice(_deviceId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
}
