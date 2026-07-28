import { Stack } from 'expo-router';

import { moduleStackScreenOptions } from '@/src/navigation/stackOptions';
import { useResolvedTheme } from '@/src/theme/useResolvedTheme';

export default function SuppliersLayout() {
  const { isDark } = useResolvedTheme();
  return (
    <Stack screenOptions={moduleStackScreenOptions(isDark)}>
      <Stack.Screen name="index" options={{ title: 'Suppliers' }} />
      <Stack.Screen name="create" options={{ title: 'New Supplier' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Supplier' }} />
    </Stack>
  );
}
