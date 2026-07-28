import { Redirect, Stack } from 'expo-router';

import { appRootStackScreenOptions } from '@/src/navigation/stackOptions';
import { useAppSelector } from '@/src/store/hooks';
import { useResolvedTheme } from '@/src/theme/useResolvedTheme';

export default function AppLayout() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { isDark } = useResolvedTheme();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={appRootStackScreenOptions(isDark)}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="products" options={{ headerShown: false }} />
      <Stack.Screen name="inventory" options={{ headerShown: false }} />
      <Stack.Screen name="purchases" options={{ headerShown: false }} />
      <Stack.Screen name="purchase-returns" options={{ headerShown: false }} />
      <Stack.Screen name="sales" options={{ headerShown: false }} />
      <Stack.Screen name="sale-returns" options={{ headerShown: false }} />
      <Stack.Screen name="expenses" options={{ headerShown: false }} />
      <Stack.Screen name="payments" options={{ headerShown: false }} />
      <Stack.Screen name="warehouses" options={{ headerShown: false }} />
      <Stack.Screen name="customers" options={{ headerShown: false }} />
      <Stack.Screen name="suppliers" options={{ headerShown: false }} />
      <Stack.Screen name="brands" options={{ headerShown: false }} />
      <Stack.Screen name="categories" options={{ headerShown: false }} />
      <Stack.Screen name="reports" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="employees" options={{ headerShown: false }} />
    </Stack>
  );
}
