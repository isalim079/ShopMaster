import { Stack } from 'expo-router';

import { moduleStackScreenOptionsMinimal } from '@/src/navigation/stackOptions';
import { useResolvedTheme } from '@/src/theme/useResolvedTheme';

export default function ProductsLayout() {
  const { isDark } = useResolvedTheme();
  return (
    <Stack screenOptions={moduleStackScreenOptionsMinimal(isDark)}>
      <Stack.Screen name="index" options={{ title: 'Products' }} />
      <Stack.Screen name="create" options={{ title: 'New product' }} />
      <Stack.Screen name="[id]" options={{ title: 'Product' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit product' }} />
    </Stack>
  );
}
