import { Stack } from 'expo-router';

import { authStackScreenOptions } from '@/src/navigation/stackOptions';
import { useResolvedTheme } from '@/src/theme/useResolvedTheme';

export default function AuthLayout() {
  const { isDark } = useResolvedTheme();

  return (
    <Stack screenOptions={authStackScreenOptions(isDark)}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-reset-otp" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
