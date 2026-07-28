import { Stack } from 'expo-router';

import { moduleStackScreenOptionsMinimal } from '@/src/navigation/stackOptions';

export default function ExpensesLayout() {
  return (
    <Stack screenOptions={moduleStackScreenOptionsMinimal}>
      <Stack.Screen name="index" options={{ title: 'Expenses' }} />
      <Stack.Screen name="create" options={{ title: 'New expense' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit expense' }} />
      <Stack.Screen name="categories" options={{ title: 'Categories' }} />
    </Stack>
  );
}
