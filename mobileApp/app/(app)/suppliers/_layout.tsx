import { Stack } from 'expo-router';

export default function SuppliersLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: '#059669',
        headerTitleStyle: { fontWeight: '600', color: '#0F172A' },
        headerStyle: { backgroundColor: '#FFFFFF' },
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Suppliers' }} />
      <Stack.Screen name="create" options={{ title: 'New Supplier' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Supplier' }} />
    </Stack>
  );
}
