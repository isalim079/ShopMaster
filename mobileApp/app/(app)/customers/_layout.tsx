import { Stack } from 'expo-router';

import { moduleStackScreenOptions } from '@/src/navigation/stackOptions';

export default function CustomersLayout() {
  return (
    <Stack screenOptions={moduleStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Customers' }} />
      <Stack.Screen name="create" options={{ title: 'New Customer' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Customer' }} />
    </Stack>
  );
}
