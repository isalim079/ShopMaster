import { Stack } from 'expo-router';

import { moduleStackScreenOptionsMinimal } from '@/src/navigation/stackOptions';
import { useResolvedTheme } from '@/src/theme/useResolvedTheme';

export default function SaleReturnsLayout() {
  const { isDark } = useResolvedTheme();
  return (
    <Stack screenOptions={moduleStackScreenOptionsMinimal(isDark)}>
      <Stack.Screen name="index" options={{ title: 'Sale returns' }} />
      <Stack.Screen name="create" options={{ title: 'New return' }} />
      <Stack.Screen name="[id]" options={{ title: 'Return' }} />
    </Stack>
  );
}
