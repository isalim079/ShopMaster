import '../global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useAuthBootstrap } from '@/src/features/auth/hooks/useAuthBootstrap';
import { store } from '@/src/store';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { LoadingState } from '@/src/shared/components/ui/ScreenStates';
import { useAppSelector } from '@/src/store/hooks';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function BootstrapGate({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  const isHydrated = useAppSelector((s) => s.auth.isHydrated);

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return <LoadingState message="Starting ShopMaster…" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider>
          <BootstrapGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </BootstrapGate>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
