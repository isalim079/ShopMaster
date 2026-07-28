import { Stack } from 'expo-router';

import { moduleStackScreenOptions } from '@/src/navigation/stackOptions';

export default function BrandsLayout() {
  return (
    <Stack screenOptions={moduleStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Brands' }} />
      <Stack.Screen name="create" options={{ title: 'New Brand' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Brand' }} />
    </Stack>
  );
}
