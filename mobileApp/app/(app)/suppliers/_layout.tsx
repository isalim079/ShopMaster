import { Stack } from 'expo-router';

import { moduleStackScreenOptions } from '@/src/navigation/stackOptions';

export default function SuppliersLayout() {
  return (
    <Stack screenOptions={moduleStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Suppliers' }} />
      <Stack.Screen name="create" options={{ title: 'New Supplier' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Supplier' }} />
    </Stack>
  );
}
