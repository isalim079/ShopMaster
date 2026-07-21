import { Stack } from 'expo-router';

export default function ReportsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: '#059669',
        headerTitleStyle: { fontWeight: '600', color: '#0F172A' },
        headerStyle: { backgroundColor: '#FFFFFF' },
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Reports' }} />
      <Stack.Screen name="sales" options={{ title: 'Sales report' }} />
      <Stack.Screen name="purchases" options={{ title: 'Purchases report' }} />
      <Stack.Screen name="inventory" options={{ title: 'Inventory report' }} />
      <Stack.Screen name="expenses" options={{ title: 'Expenses report' }} />
      <Stack.Screen name="profit-loss" options={{ title: 'Profit & loss' }} />
    </Stack>
  );
}
