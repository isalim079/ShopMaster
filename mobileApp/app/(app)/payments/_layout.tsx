import { Stack } from 'expo-router';

export default function PaymentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerTintColor: '#059669' }}>
      <Stack.Screen name="index" options={{ title: 'Payments' }} />
      <Stack.Screen name="create" options={{ title: 'New payment' }} />
    </Stack>
  );
}
