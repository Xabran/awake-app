import { Stack } from 'expo-router';

export default function PuckLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
      }}
    />
  );
}
