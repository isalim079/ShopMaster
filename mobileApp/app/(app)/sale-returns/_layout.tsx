import { Stack } from 'expo-router';

export default function SaleReturnsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerTintColor: '#059669' }}>
      <Stack.Screen name="index" options={{ title: 'Sale returns' }} />
      <Stack.Screen name="create" options={{ title: 'New return' }} />
      <Stack.Screen name="[id]" options={{ title: 'Return' }} />
    </Stack>
  );
}
