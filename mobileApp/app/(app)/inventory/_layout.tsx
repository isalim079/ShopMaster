import { Stack } from 'expo-router';

import { moduleStackScreenOptionsMinimal } from '@/src/navigation/stackOptions';
import { useResolvedTheme } from '@/src/theme/useResolvedTheme';

export default function InventoryLayout() {
  const { isDark } = useResolvedTheme();
  return (
    <Stack screenOptions={moduleStackScreenOptionsMinimal(isDark)}>
      <Stack.Screen name="index" options={{ title: 'Inventory' }} />
      <Stack.Screen name="adjust" options={{ title: 'Adjust stock' }} />
      <Stack.Screen name="history" options={{ title: 'Stock history' }} />
    </Stack>
  );
}
