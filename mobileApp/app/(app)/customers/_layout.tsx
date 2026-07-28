import { Stack } from 'expo-router';

import { moduleStackScreenOptions } from '@/src/navigation/stackOptions';
import { useResolvedTheme } from '@/src/theme/useResolvedTheme';

export default function CustomersLayout() {
  const { isDark } = useResolvedTheme();
  return (
    <Stack screenOptions={moduleStackScreenOptions(isDark)}>
      <Stack.Screen name="index" options={{ title: 'Customers' }} />
      <Stack.Screen name="create" options={{ title: 'New Customer' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Customer' }} />
    </Stack>
  );
}
