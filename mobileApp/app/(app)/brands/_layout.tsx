import { Stack } from 'expo-router';

import { moduleStackScreenOptions } from '@/src/navigation/stackOptions';
import { useResolvedTheme } from '@/src/theme/useResolvedTheme';

export default function BrandsLayout() {
  const { isDark } = useResolvedTheme();
  return (
    <Stack screenOptions={moduleStackScreenOptions(isDark)}>
      <Stack.Screen name="index" options={{ title: 'Brands' }} />
      <Stack.Screen name="create" options={{ title: 'New Brand' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Brand' }} />
    </Stack>
  );
}
