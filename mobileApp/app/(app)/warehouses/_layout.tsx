import { Stack } from 'expo-router';

import { moduleStackScreenOptions } from '@/src/navigation/stackOptions';

export default function WarehousesLayout() {
  return (
    <Stack screenOptions={moduleStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Warehouses' }} />
      <Stack.Screen name="create" options={{ title: 'New Warehouse' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Warehouse' }} />
    </Stack>
  );
}
