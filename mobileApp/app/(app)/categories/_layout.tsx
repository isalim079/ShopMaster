import { Stack } from 'expo-router';

import { moduleStackScreenOptions } from '@/src/navigation/stackOptions';
import { useResolvedTheme } from '@/src/theme/useResolvedTheme';

export default function CategoriesLayout() {
  const { isDark } = useResolvedTheme();
  return (
    <Stack screenOptions={moduleStackScreenOptions(isDark)}>
      <Stack.Screen name="index" options={{ title: 'Categories' }} />
      <Stack.Screen name="create" options={{ title: 'New Category' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Category' }} />
    </Stack>
  );
}
