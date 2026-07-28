import { Stack } from 'expo-router';

import { moduleStackScreenOptionsMinimal } from '@/src/navigation/stackOptions';

export default function PurchaseReturnsLayout() {
  return (
    <Stack screenOptions={moduleStackScreenOptionsMinimal}>
      <Stack.Screen name="index" options={{ title: 'Purchase returns' }} />
      <Stack.Screen name="create" options={{ title: 'New return' }} />
      <Stack.Screen name="[id]" options={{ title: 'Return' }} />
    </Stack>
  );
}
