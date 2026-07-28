import { Stack } from 'expo-router';

import { moduleStackScreenOptions } from '@/src/navigation/stackOptions';

export default function ReportsLayout() {
  return (
    <Stack screenOptions={moduleStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Reports' }} />
      <Stack.Screen name="sales" options={{ title: 'Sales report' }} />
      <Stack.Screen name="purchases" options={{ title: 'Purchases report' }} />
      <Stack.Screen name="inventory" options={{ title: 'Inventory report' }} />
      <Stack.Screen name="expenses" options={{ title: 'Expenses report' }} />
      <Stack.Screen name="profit-loss" options={{ title: 'Profit & loss' }} />
    </Stack>
  );
}
