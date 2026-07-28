import { Stack } from 'expo-router';

import { moduleStackScreenOptions } from '@/src/navigation/stackOptions';
import { useResolvedTheme } from '@/src/theme/useResolvedTheme';

export default function WarehousesLayout() {
  const { isDark } = useResolvedTheme();
  return (
    <Stack screenOptions={moduleStackScreenOptions(isDark)}>
      <Stack.Screen name="index" options={{ title: 'Warehouses' }} />
      <Stack.Screen name="create" options={{ title: 'New Warehouse' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Warehouse' }} />
    </Stack>
  );
}
