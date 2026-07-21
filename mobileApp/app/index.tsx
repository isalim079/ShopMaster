import { Redirect } from 'expo-router';

import { useAppSelector } from '@/src/store/hooks';
import { LoadingState } from '@/src/shared/components/ui/ScreenStates';

export default function Index() {
  const { isAuthenticated, isHydrated } = useAppSelector((s) => s.auth);

  if (!isHydrated) {
    return <LoadingState />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
