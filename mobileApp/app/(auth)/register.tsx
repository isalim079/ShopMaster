import { Redirect } from 'expo-router';

import { RegisterScreen } from '@/src/features/auth';
import { useAppSelector } from '@/src/store/hooks';

export default function RegisterRoute() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <RegisterScreen />;
}
