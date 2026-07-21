import { Stack } from 'expo-router';

export default function InventoryLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerTintColor: '#059669' }}>
      <Stack.Screen name="index" options={{ title: 'Inventory' }} />
      <Stack.Screen name="adjust" options={{ title: 'Adjust stock' }} />
      <Stack.Screen name="history" options={{ title: 'Stock history' }} />
    </Stack>
  );
}
