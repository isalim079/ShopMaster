import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: '#059669',
        headerTitleStyle: { fontWeight: '600', color: '#0F172A' },
        headerStyle: { backgroundColor: '#FFFFFF' },
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
    </Stack>
  );
}
