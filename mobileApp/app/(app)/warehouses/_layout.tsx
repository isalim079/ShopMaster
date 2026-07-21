import { Stack } from 'expo-router';

export default function WarehousesLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: '#059669',
        headerTitleStyle: { fontWeight: '600', color: '#0F172A' },
        headerStyle: { backgroundColor: '#FFFFFF' },
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Warehouses' }} />
      <Stack.Screen name="create" options={{ title: 'New Warehouse' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Warehouse' }} />
    </Stack>
  );
}
