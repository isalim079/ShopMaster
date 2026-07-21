import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: '#059669',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Products' }} />
      <Stack.Screen name="create" options={{ title: 'New product' }} />
      <Stack.Screen name="[id]" options={{ title: 'Product' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit product' }} />
    </Stack>
  );
}
