import { Stack } from 'expo-router';

import { moduleStackScreenOptionsMinimal } from '@/src/navigation/stackOptions';

export default function ProductsLayout() {
  return (
    <Stack screenOptions={moduleStackScreenOptionsMinimal}>
      <Stack.Screen name="index" options={{ title: 'Products' }} />
      <Stack.Screen name="create" options={{ title: 'New product' }} />
      <Stack.Screen name="[id]" options={{ title: 'Product' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit product' }} />
    </Stack>
  );
}
