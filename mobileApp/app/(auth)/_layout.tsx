import { Stack } from 'expo-router';

import { authStackScreenOptions } from '@/src/navigation/stackOptions';

export default function AuthLayout() {
  return (
    <Stack screenOptions={authStackScreenOptions}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-reset-otp" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
