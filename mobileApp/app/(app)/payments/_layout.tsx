import { Stack } from 'expo-router';

import { moduleStackScreenOptionsMinimal } from '@/src/navigation/stackOptions';

export default function PaymentsLayout() {
  return (
    <Stack screenOptions={moduleStackScreenOptionsMinimal}>
      <Stack.Screen name="index" options={{ title: 'Payments' }} />
      <Stack.Screen name="create" options={{ title: 'New payment' }} />
    </Stack>
  );
}
