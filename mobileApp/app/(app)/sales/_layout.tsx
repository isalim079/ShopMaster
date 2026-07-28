import { Stack } from 'expo-router';

import { moduleStackScreenOptionsMinimal } from '@/src/navigation/stackOptions';
import { useResolvedTheme } from '@/src/theme/useResolvedTheme';

export default function SalesLayout() {
  const { isDark } = useResolvedTheme();
  return (
    <Stack screenOptions={moduleStackScreenOptionsMinimal(isDark)}>
      <Stack.Screen name="index" options={{ title: 'Sales' }} />
      <Stack.Screen name="create" options={{ title: 'New sale' }} />
      <Stack.Screen name="[id]" options={{ title: 'Sale' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit sale' }} />
    </Stack>
  );
}
