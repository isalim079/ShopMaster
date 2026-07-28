import { Stack } from 'expo-router';

import { moduleStackScreenOptionsMinimal } from '@/src/navigation/stackOptions';

export default function InventoryLayout() {
  return (
    <Stack screenOptions={moduleStackScreenOptionsMinimal}>
      <Stack.Screen name="index" options={{ title: 'Inventory' }} />
      <Stack.Screen name="adjust" options={{ title: 'Adjust stock' }} />
      <Stack.Screen name="history" options={{ title: 'Stock history' }} />
    </Stack>
  );
}
