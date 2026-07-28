import { Stack } from 'expo-router';

import { moduleStackScreenOptionsMinimal } from '@/src/navigation/stackOptions';
import { useResolvedTheme } from '@/src/theme/useResolvedTheme';

export default function ExpensesLayout() {
  const { isDark } = useResolvedTheme();
  return (
    <Stack screenOptions={moduleStackScreenOptionsMinimal(isDark)}>
      <Stack.Screen name="index" options={{ title: 'Expenses' }} />
      <Stack.Screen name="create" options={{ title: 'New expense' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit expense' }} />
      <Stack.Screen name="categories" options={{ title: 'Categories' }} />
    </Stack>
  );
}
