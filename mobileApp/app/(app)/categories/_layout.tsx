import { Stack } from 'expo-router';

import { moduleStackScreenOptions } from '@/src/navigation/stackOptions';

export default function CategoriesLayout() {
  return (
    <Stack screenOptions={moduleStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Categories' }} />
      <Stack.Screen name="create" options={{ title: 'New Category' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Category' }} />
    </Stack>
  );
}
