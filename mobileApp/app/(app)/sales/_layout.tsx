import { Stack } from 'expo-router';

import { moduleStackScreenOptionsMinimal } from '@/src/navigation/stackOptions';

export default function SalesLayout() {
  return (
    <Stack screenOptions={moduleStackScreenOptionsMinimal}>
      <Stack.Screen name="index" options={{ title: 'Sales' }} />
      <Stack.Screen name="create" options={{ title: 'New sale' }} />
      <Stack.Screen name="[id]" options={{ title: 'Sale' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit sale' }} />
    </Stack>
  );
}
