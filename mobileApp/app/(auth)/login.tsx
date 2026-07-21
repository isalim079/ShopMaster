import { Redirect } from 'expo-router';

import { LoginScreen } from '@/src/features/auth';
import { useAppSelector } from '@/src/store/hooks';

export default function LoginRoute() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <LoginScreen />;
}
